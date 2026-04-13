const express = require('express');
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const auth = require('./auth');
require('dotenv').config();

// Debug: show uncaught exceptions/rejections to prevent silent exits
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

const app = express();
const PORT = 3000;

// Servir contenido estático para la página web principal y los assets
app.use(express.static(path.join(__dirname)));

// En Vercel, no arrancamos el server de forma local con app.listen
// porque la plataforma ya lo hace internamente.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend TerraVerde corriendo en http://localhost:${PORT}`);
  });
}

// CORS más seguro: restringe a orígenes específicos
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL || 'http://localhost'
];

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL || true)
    : allowedOrigins,
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Servir index.html para rutas que no sean /api/* y no sean archivos estáticos
app.get(/^(?!\/(api|css|js|assets|favicon\.ico)).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Conexión a la base de datos
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Verifica conexión al iniciar (puede ayudar a diagnosticar errores de autenticación)
// async function ensureCreditColumns() {
//   try {
//     const [cols] = await db.query("SHOW COLUMNS FROM lotes LIKE 'pago_tipo'");
//     if (!cols.length) {
//       console.log('Agregando columnas de crédito a table lotes...');
//       await db.query(`ALTER TABLE lotes
//         ADD COLUMN pago_tipo ENUM('contado','credito') NOT NULL DEFAULT 'contado',
//         ADD COLUMN credito_meses INT DEFAULT NULL,
//         ADD COLUMN credito_tasa DECIMAL(6,4) DEFAULT NULL,
//         ADD COLUMN credito_total DECIMAL(14,2) DEFAULT NULL,
//         ADD COLUMN credito_mensual DECIMAL(14,2) DEFAULT NULL,
//         ADD COLUMN credito_pagado DECIMAL(14,2) NOT NULL DEFAULT 0`);
//     }
//   } catch (err) {
//     console.error('Error verificando columnas:', err.message);
//   }
// }

db.connect().then(async () => {
  console.log('Conectado a PostgreSQL');
  // await ensureCreditColumns();
}).catch(err => {
  console.error('No se pudo conectar a PostgreSQL:', err.message);
});

// --- Helpers de envío de correo ---
function createMailTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Envía un comprobante de pago por correo (simple texto adjunto).
 * Si no hay configuración SMTP, solo registra en consola.
 */
async function sendPaymentReceiptEmail({ to, nombre, pago, lote }) {
  const transporter = createMailTransporter();
  if (!transporter) {
    console.log('SMTP no configurado, no se envió comprobante. Destinatario:', to);
    return;
  }

  const from = process.env.EMAIL_FROM || 'no-reply@terraverde.local';
  const subject = `Comprobante de pago TerraVerde #${pago.id}`;
  const text = `Hola ${nombre || 'Cliente'},\n\n` +
    `Gracias por tu pago. Aquí tienes el detalle:\n\n` +
    `Pago ID: ${pago.id}\n` +
    `Cliente: ${nombre}\n` +
    `Lote: #${pago.loteId} (${lote.ubicacion || 'N/D'})\n` +
    `Cuota: ${pago.nCuota}\n` +
    `Monto: $${Number(pago.monto).toLocaleString('es-CO')}\n` +
    `Fecha: ${pago.fecha}\n\n` +
    `Gracias por confiar en TerraVerde.\n`;

  const attachment = {
    filename: `comprobante-${pago.id}.txt`,
    content: text,
    contentType: 'text/plain'
  };

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      attachments: [attachment]
    });
    console.log('Comprobante enviado a', to);
  } catch (err) {
    console.error('Error enviando comprobante por correo:', err.message);
  }
}

/**
 * Calcula el saldo pendiente para un cliente (por lote).
 */
async function getSaldoPorCliente(clienteId) {
  const { rows } = await db.query(
    `SELECT
       l.id AS loteId,
       l.valor AS valorTotal,
       l.pago_tipo AS pagoTipo,
       l.credito_meses AS creditoMeses,
       l.credito_tasa AS creditoTasa,
       l.credito_total AS creditoTotal,
       l.credito_mensual AS creditoMensual,
       COALESCE(l.credito_pagado, 0) AS creditoPagado,
       l.estado,
       l.ubicacion,
       COALESCE(SUM(p.monto), 0) AS totalPagado
     FROM lotes l
     LEFT JOIN pagos p ON p.loteId = l.id
     WHERE l.clienteId = $1
     GROUP BY l.id`,
    [clienteId]
  );

  const items = rows.map(r => {
    const valorBase = Number(r.valorTotal || 0);
    const esCredito = r.pagoTipo === 'credito';
    const totalCredito = Number(r.creditoTotal || valorBase);
    const pagadoCredito = Number(r.creditoPagado || 0);
    const totalPagado = Number(r.totalPagado || 0);

    const saldo = esCredito ? Math.max(0, totalCredito - pagadoCredito) : Math.max(0, valorBase - totalPagado);

    return {
      loteId: r.loteId,
      valorTotal: valorBase,
      totalPagado: totalPagado,
      saldo,
      estado: r.estado,
      ubicacion: r.ubicacion,
      pagoTipo: r.pagoTipo,
      credito: esCredito ? {
        meses: r.creditoMeses || null,
        tasa: Number(r.creditoTasa || 0),
        total: totalCredito,
        mensual: Number(r.creditoMensual || 0),
        pagado: pagadoCredito
      } : null
    };
  });

  const totalValor = items.reduce((s, i) => s + i.valorTotal, 0);
  const totalPagado = items.reduce((s, i) => s + i.totalPagado, 0);

  return {
    clienteId,
    totalValor,
    totalPagado,
    saldo: totalValor - totalPagado,
    items
  };
}

// --- RUTAS ---

// --- LOTES (Crear lotes: solo admin) ---
app.post('/api/lotes', auth.verifyToken, auth.verifyAdmin, async (req, res) => {
  try {
    const { rows: lotes } = await db.query('SELECT * FROM lotes');
    res.json(lotes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener lotes', details: err.message });
  }
});

// Protegido: Cliente debe estar autenticado para reservar
app.post('/api/lotes/:id/reservar', auth.verifyToken, async (req, res) => {
  const id = parseInt(req.params.id);
  const { clienteId, pago } = req.body;
  const { rows: lotes } = await db.query('SELECT * FROM lotes WHERE id = $1', [id]);
  const lote = lotes[0];
  if (!lote) return res.status(404).json({ error: 'Lote no encontrado' });
  if (lote.estado !== 'disponible') return res.status(400).json({ error: 'Lote no disponible' });

  // Si se envía información de pago, se registra ahora mismo
  let pagoRegistrado = null;
  if (pago && pago.monto) {
    const fecha = pago.fecha || new Date().toISOString();
    const nCuota = pago.nCuota || 1;
    const nota = pago.nota || 'Pago inicial al reservar';
    const tipoPago = pago.tipo || (pago.meses ? 'credito' : 'contado');

    const { rows: usuarioRows } = await db.query('SELECT nombre, email FROM usuarios WHERE id = $1', [clienteId]);
    const usuario = usuarioRows[0] || {};

    const { rows: insertRows } = await db.query(
      'INSERT INTO pagos (clienteid, clientenombre, loteid, ncuota, monto, fecha, nota) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [clienteId, usuario.nombre || '', id, nCuota, pago.monto, fecha, nota]
    );
    pagoRegistrado = { id: insertRows[0].id, clienteId, loteId: id, nCuota, monto: pago.monto, fecha, nota };

    // Si es financiación, guarda el plan de cuotas en el lote
    if (tipoPago === 'credito') {
      const meses = pago.meses || null;
      const tasa  = pago.tasa || null;
      const mensual = pago.mensual || null;
      const total = pago.total || (meses && tasa ? Number(lote.valor) * (1 + Number(tasa)) : null);

      await db.query(
        'UPDATE lotes SET pago_tipo = $1, credito_meses = $2, credito_tasa = $3, credito_total = $4, credito_mensual = $5, credito_pagado = $6 WHERE id = $7',
        ['credito', meses, tasa, total, mensual, Number(pago.monto), id]
      );
    } else {
      // Contado
      await db.query('UPDATE lotes SET pago_tipo = $1, credito_meses = NULL, credito_tasa = NULL, credito_total = NULL, credito_mensual = NULL, credito_pagado = 0 WHERE id = $2', ['contado', id]);
    }
  }

  // Recalcula el total pagado para el lote (suma de todos los pagos)
  const { rows: totalRows } = await db.query(
    'SELECT SUM(monto) AS totalpagado FROM pagos WHERE loteid = $1',
    [id]
  );
  const totalPagado = Number(totalRows[0]?.totalpagado || 0);

  // Re-obtiene el lote para usar los valores actualizados (pago_tipo/credito_total)
  const { rows: loteRows } = await db.query(
    'SELECT valor, pago_tipo, credito_total FROM lotes WHERE id = $1',
    [id]
  );
  const loteActualizado = loteRows[0] || {};

  const valorReferencia = loteActualizado && loteActualizado.pago_tipo === 'credito' && loteActualizado.credito_total
    ? Number(loteActualizado.credito_total)
    : Number(loteActualizado.valor);

  const estadoNuevo = totalPagado >= valorReferencia ? 'vendido' : 'reservado';

  await db.query('UPDATE lotes SET estado = $1, clienteid = $2 WHERE id = $3', [estadoNuevo, clienteId, id]);

  // Enviar correo de notificación de reserva (si está configurado SMTP)
  try {
    const { rows: usuarioRows } = await db.query('SELECT nombre, email FROM usuarios WHERE id = $1', [clienteId]);
    const usuario = usuarioRows[0] || {};
    if (usuario.email) {
      const transporter = createMailTransporter();
      if (transporter) {
        const pagoTexto = pagoRegistrado ? `\nMonto pagado: $${Number(pagoRegistrado.monto).toLocaleString('es-CO')}` : '';
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || 'no-reply@terraverde.local',
          to: usuario.email,
          subject: `Reserva de lote #${lote.id} - TerraVerde`,
          text: `Hola ${usuario.nombre || 'Cliente'},\n\n` +
                `Tu reserva del lote #${lote.id} (${lote.ubicacion}) se completó correctamente.${pagoTexto}\n\n` +
                `Gracias por tu preferencia.\n` +
                `— Equipo TerraVerde`
        });
      }
    }
  } catch (err) {
    console.error('Error enviando correo de reserva:', err.message);
  }

  const loteResponse = { ...loteActualizado, estado: estadoNuevo, clienteId };
  res.json({ ok: true, lote: loteResponse, pago: pagoRegistrado });
});

app.post('/api/lotes', async (req, res) => {
  const { area, valor, ubicacion, etapa, estado, clienteId } = req.body;
  if (!area || !valor || !ubicacion || !etapa || !estado) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  const { rows } = await db.query(
    'INSERT INTO lotes (area, valor, ubicacion, etapa, estado, clienteid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [area, valor, ubicacion, etapa, estado, clienteId || null]
  );
  res.json({ ok: true, id: rows[0].id });
});

// Editar lote: solo admin
app.put('/api/lotes/:id', auth.verifyToken, auth.verifyAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const { area, valor, ubicacion, etapa, estado, clienteId } = req.body;
  await db.query(
    'UPDATE lotes SET area=$1, valor=$2, ubicacion=$3, etapa=$4, estado=$5, clienteid=$6 WHERE id=$7',
    [area, valor, ubicacion, etapa, estado, clienteId || null, id]
  );
  res.json({ ok: true });
});

// --- PAGOS ---
// Protegido: Admin puede ver todos los pagos, clientes ven solo los suyos
app.get('/api/pagos', auth.verifyToken, async (req, res) => {
  try {
    let pagos;
    if (req.user.role === 'admin') {
      [pagos] = await db.query('SELECT * FROM pagos ORDER BY fecha DESC');
    } else {
      [pagos] = await db.query('SELECT * FROM pagos WHERE clienteId = $1 ORDER BY fecha DESC', [req.user.id]);
    }
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pagos', details: err.message });
  }
});

// Protegido: Registrar pago requiere autenticación
app.post('/api/pagos', auth.verifyToken, async (req, res) => {
  try {
    const { clienteId, clienteNombre, loteId, nCuota, monto, fecha, nota } = req.body;
    if (!clienteId || !loteId || !nCuota || !monto || !fecha) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const { rows: insertRows } = await db.query(
      'INSERT INTO pagos (clienteid, clientenombre, loteid, ncuota, monto, fecha, nota) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [clienteId, clienteNombre, loteId, nCuota, monto, fecha, nota]
    );

    const pagoId = insertRows[0].id;

    // --- Lógica para cambiar el estado del lote ---
    const { rows: totalRows } = await db.query(
      'SELECT SUM(monto) AS totalpagado FROM pagos WHERE clienteid = $1 AND loteid = $2',
      [clienteId, loteId]
    );
    const totalPagado = Number(totalRows[0]?.totalpagado || 0);
    const { rows: loteRows } = await db.query(
      'SELECT valor, estado, ubicacion, pago_tipo, credito_total, credito_pagado FROM lotes WHERE id = $1',
      [loteId]
    );
    const lote = loteRows[0] || {};

    // Actualiza crédito pagado si el lote está financiado
    if (lote && lote.pago_tipo === 'credito') {
      const nuevoPagado = (Number(lote.credito_pagado) || 0) + Number(monto);
      await db.query('UPDATE lotes SET credito_pagado = $1 WHERE id = $2', [nuevoPagado, loteId]);
    }

    // Define la referencia para marcar como vendido
    const valorReferencia = lote && lote.pago_tipo === 'credito' && lote.credito_total ? Number(lote.credito_total) : Number(lote.valor);
    if (lote && Number(totalPagado) >= valorReferencia && lote.estado !== 'vendido') {
      await db.query(
        'UPDATE lotes SET estado = $1 WHERE id = $2',
        ['vendido', loteId]
      );
    }

    // Envía comprobante por correo si está configurado
    try {
      const { rows: usuarioRows } = await db.query('SELECT nombre, email FROM usuarios WHERE id = $1', [clienteId]);
      const usuario = usuarioRows[0] || {};
      if (usuario.email) {
        await sendPaymentReceiptEmail({
          to: usuario.email,
          nombre: usuario.nombre,
          pago: { id: pagoId, clienteId, loteId, nCuota, monto, fecha, nota },
          lote
        });
      }
    } catch (err) {
      console.error('No se pudo enviar correo de comprobante:', err.message);
    }

    res.json({ ok: true, id: pagoId });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// --- SALDO PENDIENTE ---
// Protegido: Ver saldo requiere ser el usuario o admin
app.get('/api/clientes/:id/saldo', auth.verifyToken, auth.verifySameUserOrAdmin, async (req, res) => {
  const clienteId = parseInt(req.params.id);
  if (Number.isNaN(clienteId)) return res.status(400).json({ error: 'Cliente inválido' });
  try {
    const saldo = await getSaldoPorCliente(clienteId);
    res.json(saldo);
  } catch (err) {
    res.status(500).json({ error: 'Error al calcular saldo', details: err.message });
  }
});

// --- COMPRA DE LOTES ---
// Protegido: Registrar compra requiere autenticación
app.post('/api/compras', auth.verifyToken, async (req, res) => {
  const { clienteId, lotes } = req.body;
  if (!clienteId || !Array.isArray(lotes) || !lotes.length) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    // Verifica que los lotes existan y estén disponibles
    const { rows: existing } = await db.query('SELECT id, estado FROM lotes WHERE id = ANY($1)', [lotes]);
    const unavailable = existing.filter(l => l.estado !== 'disponible');
    if (unavailable.length) {
      return res.status(400).json({ error: 'Algunos lotes no están disponibles', lotes: unavailable.map(l => l.id) });
    }

    // Reserva los lotes (asocia al cliente)
    await db.query('UPDATE lotes SET estado = $1, clienteid = $2 WHERE id = ANY($3)', ['reservado', clienteId, lotes]);

    res.json({ ok: true, lotesReservados: lotes });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar compra', details: err.message });
  }
});

// --- TEST ENVÍO DE CORREO ---
app.post('/api/test-email', async (req, res) => {
  const to = req.body && req.body.to ? req.body.to : null;
  if (!req.body) return res.status(400).json({ error: 'Body vacío. Usa Content-Type: application/json y envía {"to":"correo@ejemplo.com"}' });
  if (!to) return res.status(400).json({ error: 'Falta email destino. Envía {"to":"correo@ejemplo.com"}' });

  try {
    const transporter = createMailTransporter();
    if (!transporter) return res.status(500).json({ error: 'SMTP no configurado' });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'test@terraverde.local',
      to,
      subject: 'Prueba de envío TerraVerde',
      text: 'Este es un correo de prueba para verificar que el envío funciona correctamente.'
    });

    res.json({ ok: true, message: 'Correo enviado a ' + to });
  } catch (err) {
    res.status(500).json({ error: 'Error enviando correo', details: err.message });
  }
});

// --- USUARIOS (Registro) ---

app.post('/api/usuarios', async (req, res) => {
  const { nombre, email, password, telefono } = req.body;
  if (!password) return res.status(400).json({ error: 'Contraseña requerida' });

  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO usuarios (nombre, email, password, telefono) VALUES ($1, $2, $3, $4)',
      [nombre, email, hash, telefono]
    );
    res.json({ ok: true });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un usuario con ese correo electrónico.' });
    }
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const { rows } = await db.query(
      'SELECT id, nombre, email, role, password FROM usuarios WHERE email = $1',
      [email]
    );
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Compara la contraseña hasheada con bcrypt
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Genera token JWT
    const token = auth.generateToken(user);

    res.json({
      ok: true,
      message: 'Sesión iniciada correctamente',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
});

// --- PQRS ---
// Protegido: Admin ve todas, clientes ven solo las suyas
app.get('/api/pqrs', auth.verifyToken, async (req, res) => {
  try {
    let pqrs;
    if (req.user.role === 'admin') {
      const { rows } = await db.query('SELECT * FROM pqrs ORDER BY fecha DESC');
      pqrs = rows;
    } else {
      const { rows } = await db.query('SELECT * FROM pqrs WHERE clienteid = $1 ORDER BY fecha DESC', [req.user.id]);
      pqrs = rows;
    }
    res.json(pqrs);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener PQRS', details: err.message });
  }
});

// Protegido: Admin puede responder PQRS (NUEVO ENDPOINT)
app.put('/api/pqrs/:id/responder', auth.verifyToken, auth.verifyAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { estado, respuesta } = req.body;
    
    if (!estado || !respuesta) {
      return res.status(400).json({ error: 'Estado y respuesta son requeridos' });
    }

    const validStates = ['pendiente', 'en_proceso', 'resuelto', 'cerrado'];
    if (!validStates.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    await db.query(
      'UPDATE pqrs SET estado = $1, respuesta = $2 WHERE id = $3',
      [estado, respuesta, id]
    );
    
    res.json({ ok: true, message: 'PQRS actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar PQRS', details: err.message });
  }
});

// Protegido: Solo usuarios autenticados pueden crear PQRS
app.post('/api/pqrs', auth.verifyToken, async (req, res) => {
  console.log('Datos recibidos en /api/pqrs:', req.body);
  let { clienteId, clienteNombre, tipo, asunto, descripcion, estado, fecha, respuesta } = req.body;
  // Convierte la fecha a formato MySQL
  if (fecha) {
    const d = new Date(fecha);
    fecha = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
  }
  try {
    const { rows: resultado } = await db.query(
      'INSERT INTO pqrs (clienteid, clientenombre, tipo, asunto, descripcion, estado, fecha, respuesta) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [clienteId, clienteNombre, tipo, asunto, descripcion, estado, fecha, respuesta || '']
    );
    res.json({ ok: true, id: resultado[0].id });
  } catch (err) {
    console.error('Error al guardar PQRS:', err);
    res.status(500).json({ ok: false, error: 'Error al guardar PQRS', details: err.message });
  }
});

// Protegido: Admin puede responder PQRS y cambiar estado
app.put('/api/pqrs/:id/responder', auth.verifyToken, auth.verifyAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { estado, respuesta } = req.body;
    
    if (!estado || !respuesta) {
      return res.status(400).json({ error: 'Estado y respuesta son requeridos' });
    }

    const validStates = ['pendiente', 'en_proceso', 'resuelto', 'cerrado'];
    if (!validStates.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    await db.query(
      'UPDATE pqrs SET estado = $1, respuesta = $2 WHERE id = $3',
      [estado, respuesta, id]
    );
    
    res.json({ ok: true, message: 'PQRS actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar PQRS', details: err.message });
  }
});

// Protegido: Solo el usuario mismo o admin puede editar
app.put('/api/usuarios/:id', auth.verifyToken, auth.verifySameUserOrAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, telefono } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Faltan datos' });
    await db.query('UPDATE usuarios SET nombre = $1, telefono = $2 WHERE id = $3', [nombre, telefono || null, id]);
    res.json({ ok: true, message: 'Usuario actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario', details: err.message });
  }
});

// Protegido: Solo admin puede listar todos los usuarios
app.get('/api/usuarios', auth.verifyToken, auth.verifyAdmin, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, nombre, email, telefono, role, createdat AS "createdAt" FROM usuarios');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios', details: err.message });
  }
});

// Protegido: Usuario autenticado puede ver su perfil o admin puede ver cualquiera
app.get('/api/usuarios/:id', auth.verifyToken, auth.verifySameUserOrAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { rows } = await db.query(
      'SELECT id, nombre, email, telefono, role, createdat AS "createdAt" FROM usuarios WHERE id = $1', 
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ ok: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuario', details: err.message });
  }
});

// Protegido: Cambiar contraseña con token JWT
app.post('/api/usuarios/cambiar-password', auth.verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // Del token JWT
    const { actual, nueva } = req.body;
    
    if (!actual || !nueva) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    }

    // Busca el usuario por ID
    const { rows } = await db.query('SELECT password FROM usuarios WHERE id = $1', [userId]);
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Compara la contraseña actual con bcrypt
    const match = await bcrypt.compare(actual, rows[0].password);
    if (!match) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }

    // Hashea la nueva contraseña
    const hash = await bcrypt.hash(nueva, 10);
    await db.query('UPDATE usuarios SET password = $1 WHERE id = $2', [hash, userId]);
    res.json({ ok: true, message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al cambiar contraseña', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend TerraVerde corriendo en http://localhost:${PORT}`);
});

module.exports = app;

