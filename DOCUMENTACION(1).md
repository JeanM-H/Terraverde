# TerraVerde — Documentación Técnica Completa
## Sistema Web para Gestión de Venta de Lotes de Terreno
### ADSO-19 | Proyecto Grupal

---

## TABLA DE CONTENIDOS

1. [Descripción del Sistema](#1-descripción-del-sistema)
2. [Árbol de Archivos del Frontend](#2-árbol-de-archivos)
3. [Requisitos Funcionales Implementados](#3-requisitos-funcionales-implementados)
4. [Flujo de Navegación](#4-flujo-de-navegación)
5. [Manejo de Roles y Sesión](#5-manejo-de-roles-y-sesión)
6. [Modelo de Datos (Frontend → Backend)](#6-modelo-de-datos)
7. [Diseño de Base de Datos MySQL](#7-base-de-datos-mysql)
8. [API REST — Endpoints Requeridos](#8-api-rest--endpoints)
9. [Cómo Conectar con Node.js + Express](#9-conexión-con-nodejs--express)
10. [Envío de Correos con Nodemailer](#10-envío-de-correos)
11. [Variables de Entorno](#11-variables-de-entorno)
12. [Despliegue en Vercel](#12-despliegue-en-vercel)
13. [Cuentas Demo](#13-cuentas-demo)
14. [Checklist de Requisitos del PDF](#14-checklist-de-requisitos)

---

## 1. DESCRIPCIÓN DEL SISTEMA

**TerraVerde** es una aplicación web para la gestión de venta de lotes de terreno de 100m² a 200m². Permite:

- A los **clientes**: registrarse, consultar y reservar lotes, pagar por cuotas, ver su estado de cuenta, historial de pagos y enviar PQRS.
- Al **administrador**: gestionar usuarios, lotes, pagos y responder PQRS.
- Sistema de **comprobantes de pago** generados automáticamente (simulado en frontend, real con backend).

---

## 2. ÁRBOL DE ARCHIVOS

```
/terraverde
│
├── index.html          → Página principal (landing page pública)
├── login.html          → Inicio de sesión con validaciones en tiempo real
├── registro.html       → Registro de usuario con validaciones + medidor contraseña
├── recuperar.html      → Recuperación de contraseña por correo
├── dashboard.html      → Panel de control (diferenciado por rol)
├── lotes.html          → Catálogo público de lotes con filtros
├── proyecto.html       → Info del proyecto + etapas + planos habitacionales
├── pqrs.html           → Formulario PQRS público + seguimiento
│
├── css/
│   └── styles.css      → Estilos globales (variables CSS, componentes, layouts)
│
└── js/
    └── app.js          → Lógica principal: sesión, validaciones, toast,
                          helpers de datos, comprobantes
```

---

## 3. REQUISITOS FUNCIONALES IMPLEMENTADOS

### CU-01 — Registro de Usuario ✅
- Formulario con: nombre, teléfono, correo, contraseña, confirmar contraseña
- Validaciones en tiempo real: formato email, longitud contraseña, coincidencia
- Medidor de fortaleza de contraseña
- Tipo de usuario fijo: "Cliente" (los admins se asignan internamente)
- Al registrar → sesión iniciada automáticamente → redirige al dashboard

### CU-02 — Inicio de Sesión ✅
- Validación de credenciales contra localStorage (en producción → API)
- Cuentas demo: Admin y Cliente con un clic
- Toggle de visibilidad de contraseña
- Página de recuperación de contraseña (`recuperar.html`)
- Redirección automática si ya hay sesión activa

### CU-03 — Compra / Reserva de Lote ✅
- Catálogo público filtrable por: estado, área, precio, etapa
- Botón "Me Interesa" → si no hay sesión, muestra modal para login/registro
- Si hay sesión cliente → cambia estado del lote a "reservado" y lo asigna al cliente
- El admin puede asignar lotes desde el dashboard

### CU-04 — Registro de Pago y Comprobante ✅
- Modal de registro con: lote, n° cuota, monto, fecha, nota
- Comprobante visual con todos los detalles, badge de verificación
- Botón de impresión del comprobante (window.print())
- **Envío de correo**: simulado en frontend. Ver sección 10 para implementación real.

### CU-05 — Historial de Pagos ✅
- Tabla de todos los pagos del cliente con: lote, cuota, monto, fecha, nota
- Total pagado calculado automáticamente
- Acceso al comprobante individual de cada pago

### CU-06 — PQRS ✅
- Formulario público (con o sin sesión)
- Tipos: Petición, Queja, Reclamo, Sugerencia
- Campos: tipo, asunto, descripción
- Invitados pueden enviar PQRS con nombre manual
- Seguimiento de estado: pendiente → en proceso → resuelto → cerrado
- Admin puede responder directamente desde el dashboard
- Cliente puede ver la respuesta del admin

### Funcionalidades adicionales ✅
- **Estado de cuenta**: resumen por lote con valor total, pagado, saldo y progreso en barra
- **Perfil de usuario**: edición de nombre y teléfono, cambio de contraseña
- **Panel administrador**: KPIs (clientes, lotes, recaudado, PQRS pendientes), distribución de lotes
- **Planos habitacionales**: 3 modelos SVG (2, 3 y 4 habitaciones) en proyecto.html
- **Recuperación de contraseña**: flujo de 2 pasos (requiere nodemailer en backend)

---

## 4. FLUJO DE NAVEGACIÓN

```
index.html (Landing pública)
  ├─→ proyecto.html      Descripción, mapa, etapas, planos gratuitos
  ├─→ lotes.html         Catálogo con filtros (estado, área, precio, etapa)
  ├─→ pqrs.html          PQRS público (con/sin sesión)
  ├─→ login.html
  │     ├─→ dashboard.html (si OK)
  │     └─→ recuperar.html (olvidé contraseña)
  └─→ registro.html
        └─→ dashboard.html (auto-login tras registro)

dashboard.html
  ├─ CLIENTE
  │   ├─ Mi Panel       → KPIs personales, resumen de lotes
  │   ├─ Mis Lotes      → Listado de lotes adquiridos
  │   ├─ Estado Cuenta  → Valor total, pagado, saldo, progreso por lote
  │   ├─ Historial Pagos→ Tabla de pagos + comprobantes
  │   ├─ PQRS           → Enviar solicitud + ver sus PQRS con respuestas
  │   └─ Mi Perfil      → Editar nombre, teléfono, cambiar contraseña
  │
  └─ ADMINISTRADOR
      ├─ Resumen General → KPIs globales, distribución de lotes, últimos pagos
      ├─ Usuarios        → Tabla de todos los usuarios registrados
      ├─ Lotes           → CRUD de lotes (crear, editar, cambiar estado, asignar cliente)
      ├─ Pagos           → Todos los pagos, comprobantes, KPIs financieros
      ├─ PQRS            → Todas las solicitudes, responder, cambiar estado
      └─ Mi Perfil       → Editar datos y contraseña
```

---

## 5. MANEJO DE ROLES Y SESIÓN

### Almacenamiento (Frontend actual — localStorage)
```javascript
// Objeto de sesión almacenado en: localStorage['tv_session']
{
  id: 1,
  name: "Administrador TerraVerde",
  email: "admin@terraverde.co",
  role: "admin",   // "admin" | "cliente"
  phone: "3001234567",
  createdAt: "2024-01-10T08:00:00Z"
}
```

### Lógica de roles
```javascript
const session = Auth.getSession();
const isAdmin = session.role === 'admin';

// El dashboard renderiza menús y contenido diferentes según el rol
// Admin ve: Usuarios, Lotes (CRUD), Pagos (todos), PQRS (responder)
// Cliente ve: Mis Lotes, Estado de Cuenta, Historial, PQRS (enviar)
```

### Protección de páginas
```javascript
// En dashboard.html — requiere sesión iniciada
Auth.requireAuth(); // → si no hay sesión, redirige a login.html

// Para páginas solo-admin
Auth.requireAdmin(); // → si no es admin, redirige a dashboard.html
```

### Migración a JWT (Backend)
```javascript
// Reemplazar localStorage con:
const token = localStorage.getItem('tv_token');
headers: { 'Authorization': `Bearer ${token}` }

// El backend valida el token y retorna el rol
// Middleware Express: verifyToken.js
```

---

## 6. MODELO DE DATOS

### Estructuras usadas en el frontend (localStorage)

```javascript
// USUARIO
{
  id: Number,           // PK auto-increment
  name: String,         // Nombre completo
  email: String,        // Único, validado
  password: String,     // btoa() en demo → bcrypt en producción
  role: "admin"|"cliente",
  phone: String,        // Opcional
  createdAt: ISO8601    // Timestamp de registro
}

// LOTE
{
  id: Number,           // PK
  area: Number,         // 100 - 200 m²
  ubicacion: String,    // "Sector A — Manzana 1, Lote 1"
  valor: Number,        // En pesos colombianos
  estado: "disponible"|"reservado"|"vendido",
  etapa: "Lanzamiento"|"Preventa"|"Construcción"|"Entrega",
  clienteId: Number|null  // FK → usuarios.id
}

// PAGO
{
  id: Number,
  clienteId: Number,    // FK → usuarios.id
  clienteNombre: String,// Desnormalizado para comprobantes
  loteId: Number,       // FK → lotes.id
  nCuota: Number,       // Número de cuota (1, 2, 3...)
  monto: Number,        // Monto en pesos
  fecha: ISO8601,
  nota: String          // Opcional
}

// PQRS
{
  id: Number,
  clienteId: Number|null,   // null si es anónimo
  clienteNombre: String,
  tipo: "Petición"|"Queja"|"Reclamo"|"Sugerencia",
  asunto: String,
  descripcion: String,
  estado: "pendiente"|"en proceso"|"resuelto"|"cerrado",
  fecha: ISO8601,
  respuesta: String     // Respuesta del admin
}
```

---

## 7. BASE DE DATOS MYSQL

```sql
-- ================================================
-- TerraVerde — Script SQL completo
-- Base de datos: terraverde_db
-- ================================================

CREATE DATABASE IF NOT EXISTS terraverde_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE terraverde_db;

-- TABLA: usuarios
CREATE TABLE usuarios (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(150)  NOT NULL,
  correo      VARCHAR(200)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL COMMENT 'Hash bcrypt',
  rol         ENUM('admin','cliente') NOT NULL DEFAULT 'cliente',
  telefono    VARCHAR(20)   DEFAULT NULL,
  activo      BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_correo (correo),
  INDEX idx_rol    (rol)
) ENGINE=InnoDB;

-- TABLA: lotes
CREATE TABLE lotes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  area_m2     DECIMAL(8,2)  NOT NULL COMMENT 'Entre 100 y 200 m²',
  ubicacion   VARCHAR(250)  NOT NULL,
  valor       DECIMAL(14,2) NOT NULL,
  estado      ENUM('disponible','reservado','vendido') NOT NULL DEFAULT 'disponible',
  etapa       ENUM('Lanzamiento','Preventa','Construccion','Entrega') NOT NULL,
  cliente_id  INT           DEFAULT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_lote_cliente FOREIGN KEY (cliente_id)
    REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_estado    (estado),
  INDEX idx_etapa     (etapa),
  INDEX idx_cliente   (cliente_id),
  CONSTRAINT chk_area CHECK (area_m2 BETWEEN 100 AND 200)
) ENGINE=InnoDB;

-- TABLA: pagos
CREATE TABLE pagos (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id          INT           NOT NULL,
  lote_id             INT           NOT NULL,
  n_cuota             INT           NOT NULL DEFAULT 1,
  monto               DECIMAL(14,2) NOT NULL,
  fecha_pago          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  nota                TEXT          DEFAULT NULL,
  comprobante_enviado BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pago_cliente FOREIGN KEY (cliente_id)
    REFERENCES usuarios(id) ON DELETE RESTRICT,
  CONSTRAINT fk_pago_lote   FOREIGN KEY (lote_id)
    REFERENCES lotes(id) ON DELETE RESTRICT,
  INDEX idx_cliente_pagos (cliente_id),
  INDEX idx_lote_pagos    (lote_id),
  CONSTRAINT chk_monto CHECK (monto > 0)
) ENGINE=InnoDB;

-- TABLA: pqrs
CREATE TABLE pqrs (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id      INT           DEFAULT NULL COMMENT 'NULL si es anónimo',
  cliente_nombre  VARCHAR(150)  NOT NULL,
  tipo            ENUM('Peticion','Queja','Reclamo','Sugerencia') NOT NULL,
  asunto          VARCHAR(250)  NOT NULL,
  descripcion     TEXT          NOT NULL,
  estado          ENUM('pendiente','en proceso','resuelto','cerrado') NOT NULL DEFAULT 'pendiente',
  respuesta       TEXT          DEFAULT NULL,
  fecha           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pqrs_cliente FOREIGN KEY (cliente_id)
    REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_estado_pqrs   (estado),
  INDEX idx_cliente_pqrs  (cliente_id)
) ENGINE=InnoDB;

-- TABLA: tokens_recuperacion (para reset de contraseña)
CREATE TABLE tokens_recuperacion (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT         NOT NULL,
  token       VARCHAR(255) NOT NULL UNIQUE,
  usado       BOOLEAN      NOT NULL DEFAULT FALSE,
  expira_en   DATETIME     NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_token_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- DATOS DEMO
INSERT INTO usuarios (nombre, correo, password, rol, telefono) VALUES
  ('Administrador TerraVerde', 'admin@terraverde.co',  '$2b$10$HASH_DE_admin123',  'admin',   '3001234567'),
  ('Carlos Rodríguez',         'carlos@gmail.com',     '$2b$10$HASH_DE_carlos123', 'cliente', '3109876543'),
  ('María González',           'maria@gmail.com',      '$2b$10$HASH_DE_maria123',  'cliente', '3156781234');

INSERT INTO lotes (area_m2, ubicacion, valor, estado, etapa, cliente_id) VALUES
  (100, 'Sector A — Manzana 1, Lote 1', 45000000, 'disponible', 'Preventa',     NULL),
  (120, 'Sector A — Manzana 1, Lote 2', 54000000, 'disponible', 'Preventa',     NULL),
  (150, 'Sector B — Manzana 2, Lote 1', 67500000, 'reservado',  'Preventa',     2),
  (150, 'Sector B — Manzana 2, Lote 2', 67500000, 'vendido',    'Lanzamiento',  3),
  (200, 'Sector C — Manzana 3, Lote 1', 90000000, 'disponible', 'Preventa',     NULL),
  (180, 'Sector C — Manzana 3, Lote 2', 81000000, 'reservado',  'Preventa',     2),
  (100, 'Sector D — Manzana 4, Lote 1', 46000000, 'disponible', 'Construccion', NULL),
  (120, 'Sector D — Manzana 4, Lote 2', 55000000, 'disponible', 'Construccion', NULL);
```

---

## 8. API REST — ENDPOINTS

> Base URL: `https://tu-dominio.vercel.app/api`

### AUTENTICACIÓN

| Método | Endpoint             | Body                                | Respuesta                        | Descripción                      |
|--------|----------------------|-------------------------------------|----------------------------------|----------------------------------|
| POST   | `/auth/register`     | `{name,email,password,phone}`       | `{token, user}`                  | Registro de nuevo cliente        |
| POST   | `/auth/login`        | `{email, password}`                 | `{token, user}`                  | Inicio de sesión                 |
| POST   | `/auth/recover`      | `{email}`                           | `{message}`                      | Envía link de recuperación       |
| POST   | `/auth/reset`        | `{token, newPassword}`              | `{message}`                      | Restablece contraseña            |
| PUT    | `/auth/profile`      | `{name, phone}`                     | `{user}` 🔒                      | Actualiza perfil                 |
| PUT    | `/auth/change-pw`    | `{currentPw, newPw}`                | `{message}` 🔒                   | Cambia contraseña                |

### USUARIOS (Admin)

| Método | Endpoint         | Params     | Descripción            |
|--------|------------------|------------|------------------------|
| GET    | `/users`         | —          | Todos los usuarios 🔒👑 |
| GET    | `/users/:id`     | id         | Usuario por ID 🔒👑     |

### LOTES

| Método | Endpoint         | Body/Params                                     | Descripción                 |
|--------|------------------|-------------------------------------------------|-----------------------------|
| GET    | `/lotes`         | ?estado=&etapa=&area_min=&precio_max=           | Listado con filtros          |
| GET    | `/lotes/:id`     | id                                              | Lote específico              |
| POST   | `/lotes`         | `{area,ubicacion,valor,estado,etapa}`           | Crear lote 🔒👑              |
| PUT    | `/lotes/:id`     | `{area?,ubicacion?,valor?,estado?,etapa?,clienteId?}` | Editar lote 🔒👑      |
| DELETE | `/lotes/:id`     | id                                              | Eliminar lote 🔒👑           |

### PAGOS

| Método | Endpoint            | Body/Params                                    | Descripción                     |
|--------|---------------------|------------------------------------------------|---------------------------------|
| GET    | `/pagos`            | ?clienteId=                                    | Pagos (admin: todos; cliente: propios) 🔒 |
| GET    | `/pagos/:id`        | id                                             | Pago específico + comprobante 🔒 |
| POST   | `/pagos`            | `{loteId,nCuota,monto,fecha,nota}`             | Registrar pago + enviar correo 🔒 |
| GET    | `/pagos/cuenta/:clienteId` | clienteId                             | Estado de cuenta del cliente 🔒  |

### PQRS

| Método | Endpoint         | Body/Params                                    | Descripción                  |
|--------|------------------|------------------------------------------------|------------------------------|
| GET    | `/pqrs`          | ?clienteId=                                    | PQRS (admin: todas; cliente: propias) 🔒 |
| POST   | `/pqrs`          | `{tipo,asunto,descripcion,clienteNombre?}`     | Crear PQRS (sin auth también) |
| PUT    | `/pqrs/:id`      | `{estado,respuesta}`                           | Actualizar estado 🔒👑        |

> 🔒 = Requiere token JWT  
> 👑 = Solo administrador

---

## 9. CONEXIÓN CON NODE.JS + EXPRESS

### Estructura de carpetas sugerida (Backend)

```
/backend
├── server.js               → Entrada principal
├── vercel.json             → Config Vercel
├── .env                    → Variables de entorno
├── package.json
│
├── config/
│   └── db.js               → Conexión MySQL (mysql2)
│
├── middlewares/
│   ├── auth.js             → Verificar JWT
│   └── isAdmin.js          → Verificar rol admin
│
├── routes/
│   ├── auth.routes.js
│   ├── lotes.routes.js
│   ├── pagos.routes.js
│   ├── pqrs.routes.js
│   └── users.routes.js
│
└── controllers/
    ├── auth.controller.js
    ├── lotes.controller.js
    ├── pagos.controller.js
    ├── pqrs.controller.js
    └── users.controller.js
```

### server.js básico

```javascript
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.use('/api/auth',   require('./routes/auth.routes'));
app.use('/api/users',  require('./routes/users.routes'));
app.use('/api/lotes',  require('./routes/lotes.routes'));
app.use('/api/pagos',  require('./routes/pagos.routes'));
app.use('/api/pqrs',   require('./routes/pqrs.routes'));

app.listen(process.env.PORT || 3000, () => console.log('API corriendo'));
module.exports = app; // requerido por Vercel
```

### config/db.js

```javascript
const mysql = require('mysql2/promise');
const pool  = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});
module.exports = pool;
```

### middlewares/auth.js

```javascript
const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};
```

### Reemplazar localStorage en el frontend

```javascript
// ─── ANTES (demo con localStorage) ───
const result = Auth.login(email, password);

// ─── DESPUÉS (con backend real) ───
async function loginReal(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('tv_token',   data.token);
    localStorage.setItem('tv_session', JSON.stringify(data.user));
    window.location.href = 'dashboard.html';
  } else {
    Toast.show(data.error, 'error');
  }
}
```

---

## 10. ENVÍO DE CORREOS

### Instalar nodemailer

```bash
npm install nodemailer
```

### config/mailer.js

```javascript
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',   // o usar SMTP personalizado
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,   // App Password de Google
  },
});

async function enviarComprobante(destinatario, pago, lote) {
  const html = `
    <div style="font-family:Arial;max-width:500px;margin:0 auto">
      <div style="background:#1E3A8A;color:white;padding:24px;text-align:center">
        <h1 style="margin:0">◈ TerraVerde</h1>
        <p>Comprobante de Pago</p>
      </div>
      <div style="padding:24px;border:1px solid #e5e7eb">
        <p><strong>Cliente:</strong> ${pago.clienteNombre}</p>
        <p><strong>Lote:</strong> #${lote.id} — ${lote.area_m2}m² (${lote.ubicacion})</p>
        <p><strong>N° Cuota:</strong> ${pago.n_cuota}</p>
        <p><strong>Monto:</strong> <span style="color:#16A34A;font-size:1.2em">
          $${Number(pago.monto).toLocaleString('es-CO')}</span></p>
        <p><strong>Fecha:</strong> ${new Date(pago.fecha_pago).toLocaleString('es-CO')}</p>
        <p><strong>ID Transacción:</strong> #TV-${pago.id}</p>
      </div>
      <div style="background:#f3f4f6;padding:16px;text-align:center;font-size:12px;color:#6b7280">
        © 2024 TerraVerde. Todos los derechos reservados.
      </div>
    </div>`;

  await transporter.sendMail({
    from:    `"TerraVerde" <${process.env.EMAIL_USER}>`,
    to:      destinatario,
    subject: `Comprobante de Pago — Cuota ${pago.n_cuota} — Lote #${lote.id}`,
    html,
  });
}

async function enviarRecuperacion(destinatario, nombre, link) {
  await transporter.sendMail({
    from:    `"TerraVerde" <${process.env.EMAIL_USER}>`,
    to:      destinatario,
    subject: 'Recupera tu contraseña — TerraVerde',
    html: `<p>Hola ${nombre},</p>
           <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
           <a href="${link}" style="background:#1E3A8A;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">
             Restablecer Contraseña</a>
           <p>Este enlace expira en 1 hora.</p>`,
  });
}

module.exports = { enviarComprobante, enviarRecuperacion };
```

### Llamar desde el controlador de pagos

```javascript
// controllers/pagos.controller.js
const { enviarComprobante } = require('../config/mailer');

exports.registrarPago = async (req, res) => {
  const { loteId, nCuota, monto, fecha, nota } = req.body;
  const clienteId = req.user.id;
  
  const [result] = await db.execute(
    'INSERT INTO pagos (cliente_id, lote_id, n_cuota, monto, fecha_pago, nota) VALUES (?,?,?,?,?,?)',
    [clienteId, loteId, nCuota, monto, fecha || new Date(), nota || '']
  );
  
  // Obtener datos para el comprobante
  const [[pago]]    = await db.execute('SELECT * FROM pagos WHERE id = ?', [result.insertId]);
  const [[lote]]    = await db.execute('SELECT * FROM lotes WHERE id = ?', [loteId]);
  const [[cliente]] = await db.execute('SELECT * FROM usuarios WHERE id = ?', [clienteId]);
  
  // Enviar correo en background (no bloquear respuesta)
  enviarComprobante(cliente.correo, pago, lote).catch(console.error);
  
  // Marcar como enviado
  await db.execute('UPDATE pagos SET comprobante_enviado = TRUE WHERE id = ?', [result.insertId]);
  
  res.json({ ok: true, pago, message: 'Pago registrado. Comprobante enviado al correo.' });
};
```

---

## 11. VARIABLES DE ENTORNO

### Archivo `.env` (backend)

```env
# Servidor
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://terraverde.vercel.app

# Base de datos MySQL
DB_HOST=tu-host.mysql.com
DB_PORT=3306
DB_USER=tu_usuario
DB_PASS=tu_contraseña_segura
DB_NAME=terraverde_db

# JWT
JWT_SECRET=una_clave_aleatoria_muy_larga_y_segura_aqui
JWT_EXPIRES=7d

# Email (nodemailer)
EMAIL_USER=terraverde@gmail.com
EMAIL_PASS=abcd_efgh_ijkl_mnop   # App Password de Google (no la contraseña real)
```

> ⚠️ Nunca subas `.env` al repositorio. Agrega `.env` a `.gitignore`.

---

## 12. DESPLIEGUE EN VERCEL

### vercel.json (en la raíz del backend)

```json
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server.js" },
    { "src": "/(.*)",     "dest": "server.js" }
  ]
}
```

### Pasos para desplegar

1. **Instalar Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Desplegar frontend** (carpeta `/terraverde`):
   ```bash
   cd terraverde
   vercel --prod
   ```

3. **Desplegar backend** (carpeta `/backend`):
   ```bash
   cd backend
   vercel --prod
   ```

4. **Configurar variables de entorno en Vercel**:
   - Dashboard Vercel → proyecto → Settings → Environment Variables
   - Agrega todas las variables del `.env`

5. **Base de datos**: Usar servicio MySQL externo compatible:
   - **PlanetScale** (gratuito, serverless MySQL)
   - **Railway** (fácil despliegue)
   - **AWS RDS** (producción)
   - **Hostinger MySQL** (económico)

### Actualizar URLs en el frontend tras despliegue

```javascript
// js/app.js — reemplazar llamadas a localStorage con:
const API_URL = 'https://terraverde-backend.vercel.app/api';

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('tv_token');
  const res   = await fetch(API_URL + endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}
```

---

## 13. CUENTAS DEMO

| Rol           | Correo                | Contraseña   |
|---------------|-----------------------|--------------|
| Administrador | admin@terraverde.co   | admin123     |
| Cliente 1     | carlos@gmail.com      | carlos123    |
| Cliente 2     | maria@gmail.com       | maria123     |

> Los datos demo se inicializan automáticamente en localStorage la primera vez que se abre el sistema.

---

## 14. CHECKLIST DE REQUISITOS DEL PDF

### Requisitos Funcionales

| Req. | Descripción                                         | Frontend | Backend |
|------|-----------------------------------------------------|----------|---------|
| 4.1  | Registro de usuarios con validación de correo       | ✅       | ⏳      |
| 4.1  | Inicio y cierre de sesión seguro                    | ✅       | ⏳      |
| 4.1  | Recuperación de contraseña por correo               | ✅ UI    | ⏳ nodemailer |
| 4.2  | Registro de lotes (área, ubicación, valor)          | ✅       | ⏳      |
| 4.2  | Clasificación por etapas del proyecto               | ✅       | ⏳      |
| 4.2  | Visualización de estado del lote                    | ✅       | ⏳      |
| 4.3  | Registro de compra de lotes                         | ✅       | ⏳      |
| 4.3  | Registro de pagos por cuotas                        | ✅       | ⏳      |
| 4.3  | Cálculo automático del saldo pendiente              | ✅       | ⏳      |
| 4.3  | Historial de pagos por cliente                      | ✅       | ⏳      |
| 4.3  | Envío automático de comprobante al correo           | ✅ UI    | ⏳ nodemailer |
| 4.4  | Información general del proyecto habitacional       | ✅       | —       |
| 4.4  | Detalle de etapas del negocio                       | ✅       | —       |
| 4.4  | Modelos de planos habitacionales (2/3/4 hab.)       | ✅ SVG   | —       |
| 4.5  | Formulario PQRS (P/Q/R/S)                          | ✅       | ⏳      |
| 4.5  | Seguimiento del estado de cada solicitud            | ✅       | ⏳      |
| 4.5  | Respuesta admin a PQRS                              | ✅       | ⏳      |

### Requisitos No Funcionales

| Req. | Descripción                                    | Estado     |
|------|------------------------------------------------|------------|
| 5.1  | Encriptación de contraseñas (bcrypt)           | ⏳ backend |
| 5.2  | Control de sesiones y roles (Admin/Cliente)    | ✅ frontend |
| 5.3  | Interfaz responsiva y amigable                 | ✅ CSS     |
| 5.4  | Despliegue en hosting con URL pública          | ⏳ Vercel  |

### Entregables

| Entregable                        | Estado         |
|-----------------------------------|----------------|
| Código fuente Frontend            | ✅ Completo    |
| Código fuente Backend             | ⏳ Pendiente   |
| Script SQL (esquema + datos demo) | ✅ En esta doc |
| Modelo Entidad-Relación (MER)     | ⏳ Diagramar   |
| Aplicación desplegada (URL)       | ⏳ Pendiente   |
| Manual de usuario                 | ⏳ Pendiente   |

---

## MODELO ENTIDAD-RELACIÓN (Descripción textual)

```
USUARIOS ||--o{ LOTES       : "adquiere (cliente_id)"
USUARIOS ||--o{ PAGOS       : "realiza (cliente_id)"
USUARIOS ||--o{ PQRS        : "envía (cliente_id)"
LOTES    ||--o{ PAGOS       : "recibe pagos (lote_id)"
USUARIOS ||--o{ TOKENS_REC  : "solicita recuperación"
```

Para generar el diagrama visual, se recomienda usar:
- **draw.io** (diagrams.net)
- **MySQL Workbench** → Database → Reverse Engineer

---

*Documentación generada para el equipo ADSO-19*  
*Frontend: HTML5 + CSS3 + JavaScript Vanilla*  
*Backend requerido: Node.js + Express + MySQL*
