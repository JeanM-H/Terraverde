-- ============================================================
-- TerraVerde — Script de Base de Datos PostgreSQL
-- ADSO-19 | Sistema Web de Gestión de Venta de Lotes
-- ============================================================

-- Crear base de datos (en Supabase ya existe)
-- DROP DATABASE IF EXISTS terraverde;
-- CREATE DATABASE terraverde;

-- ============================================================
-- TABLA: usuarios
-- ============================================================
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  role VARCHAR(10) NOT NULL DEFAULT 'cliente' CHECK (role IN ('admin', 'cliente')),
  createdat TIMESTAMP DEFAULT NOW(),
  updatedat TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_role ON usuarios(role);

-- ============================================================
-- TABLA: lotes
-- ============================================================
CREATE TABLE lotes (
  id SERIAL PRIMARY KEY,
  area INT NOT NULL,
  ubicacion VARCHAR(255) NOT NULL,
  valor DECIMAL(14,2) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'reservado', 'vendido')),
  etapa VARCHAR(20) NOT NULL CHECK (etapa IN ('Lanzamiento', 'Preventa', 'Construcción', 'Entrega')),
  clienteid INT,
  pago_tipo VARCHAR(10) NOT NULL DEFAULT 'contado' CHECK (pago_tipo IN ('contado', 'credito')),
  credito_meses INT,
  credito_tasa DECIMAL(6,4),
  credito_total DECIMAL(14,2),
  credito_mensual DECIMAL(14,2),
  credito_pagado DECIMAL(14,2) DEFAULT 0,
  createdat TIMESTAMP DEFAULT NOW(),
  updatedat TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (clienteid) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_lotes_estado ON lotes(estado);
CREATE INDEX idx_lotes_etapa ON lotes(etapa);
CREATE INDEX idx_lotes_clienteId ON lotes(clienteid);

-- ============================================================
-- TABLA: pagos
-- ============================================================
CREATE TABLE pagos (
  id SERIAL PRIMARY KEY,
  clienteid INT NOT NULL,
  clientenombre VARCHAR(255),
  loteid INT NOT NULL,
  ncuota INT NOT NULL,
  monto DECIMAL(14,2) NOT NULL,
  fecha DATE NOT NULL,
  nota TEXT,
  createdat TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (clienteid) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (loteid) REFERENCES lotes(id) ON DELETE CASCADE
);

CREATE INDEX idx_pagos_clienteId ON pagos(clienteid);
CREATE INDEX idx_pagos_loteId ON pagos(loteid);
CREATE INDEX idx_pagos_fecha ON pagos(fecha);

-- ============================================================
-- TABLA: pqrs
-- ============================================================
CREATE TABLE pqrs (
  id SERIAL PRIMARY KEY,
  clienteid INT,
  clientenombre VARCHAR(255),
  tipo VARCHAR(15) NOT NULL CHECK (tipo IN ('peticion', 'queja', 'reclamo', 'sugerencia')),
  asunto VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  estado VARCHAR(15) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'resuelto', 'cerrado')),
  respuesta TEXT,
  fecha TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (clienteid) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_pqrs_estado ON pqrs(estado);
CREATE INDEX idx_pqrs_tipo ON pqrs(tipo);
CREATE INDEX idx_pqrs_clienteId ON pqrs(clienteid);

-- ============================================================
-- TABLA: compras
-- ============================================================
CREATE TABLE compras (
  id SERIAL PRIMARY KEY,
  clienteid INT NOT NULL,
  loteid INT NOT NULL,
  fecha TIMESTAMP DEFAULT NOW(),
  monto DECIMAL(14,2),
  estado VARCHAR(15) NOT NULL DEFAULT 'completada' CHECK (estado IN ('completada', 'pendiente', 'cancelada')),
  FOREIGN KEY (clienteid) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (loteid) REFERENCES lotes(id) ON DELETE CASCADE
);

CREATE INDEX idx_compras_clienteId ON compras(clienteid);
CREATE INDEX idx_compras_loteId ON compras(loteid);

-- ============================================================
-- DATOS DE EJEMPLO
-- ============================================================

-- Usuarios demo
INSERT INTO usuarios (nombre, email, password, telefono, role) VALUES
('Administrador TerraVerde', 'admin@terraverde.co', '$2b$10$YourHashedPasswordHere', '3001234567', 'admin'),
('Carlos Rodríguez', 'carlos@gmail.com', '$2b$10$YourHashedPasswordHere', '3109876543', 'cliente'),
('María González', 'maria@gmail.com', '$2b$10$YourHashedPasswordHere', '3156781234', 'cliente'),
('Juan Pérez', 'juan@gmail.com', '$2b$10$YourHashedPasswordHere', '3187654321', 'cliente'),
('Ana López', 'ana@gmail.com', '$2b$10$YourHashedPasswordHere', '3012345678', 'cliente');

-- Lotes demo
INSERT INTO lotes (area, ubicacion, valor, estado, etapa, clienteid, pago_tipo) VALUES
(100, 'Sector A — Manzana 1, Lote 1', 45000000, 'disponible', 'Preventa', NULL, 'contado'),
(120, 'Sector A — Manzana 1, Lote 2', 54000000, 'disponible', 'Preventa', NULL, 'contado'),
(150, 'Sector B — Manzana 2, Lote 1', 67500000, 'reservado', 'Preventa', 2, 'contado'),
(150, 'Sector B — Manzana 2, Lote 2', 67500000, 'vendido', 'Lanzamiento', 3, 'credito'),
(200, 'Sector C — Manzana 3, Lote 1', 90000000, 'disponible', 'Preventa', NULL, 'contado'),
(180, 'Sector C — Manzana 3, Lote 2', 81000000, 'reservado', 'Preventa', 2, 'contado'),
(100, 'Sector D — Manzana 4, Lote 1', 46000000, 'disponible', 'Construcción', NULL, 'contado'),
(120, 'Sector D — Manzana 4, Lote 2', 55000000, 'disponible', 'Construcción', NULL, 'contado'),
(110, 'Sector E — Manzana 5, Lote 1', 50000000, 'vendido', 'Preventa', 4, 'credito'),
(115, 'Sector E — Manzana 5, Lote 2', 52500000, 'disponible', 'Entrega', NULL, 'contado');

-- Pagos demo
INSERT INTO pagos (clienteid, clientenombre, loteid, ncuota, monto, fecha, nota) VALUES
(3, 'María González', 4, 1, 13500000, '2024-02-15', 'Cuota inicial crediticia'),
(3, 'María González', 4, 2, 13500000, '2024-03-15', 'Segunda cuota'),
(4, 'Juan Pérez', 9, 1, 10000000, '2024-03-01', 'Pago inicial'),
(4, 'Juan Pérez', 9, 2, 10000000, '2024-04-01', 'Segunda cuota'),
(2, 'Carlos Rodríguez', 3, 1, 33750000, '2024-01-20', 'Reserva de lote');

-- PQRS demo
INSERT INTO pqrs (clienteid, clientenombre, tipo, asunto, descripcion, estado, respuesta) VALUES
(2, 'Carlos Rodríguez', 'peticion', 'Solicitar información', 'Me gustaría conocer más detalles sobre los planos habitacionales', 'resuelto', 'Enviamos los planos a tu correo. Gracias.'),
(3, 'María González', 'queja', 'Demora en la respuesta', 'No he recibido respuesta sobre mi consulta anterior', 'en_proceso', NULL),
(NULL, 'Cliente Anónimo', 'sugerencia', 'Mejorar plataforma', 'Sugiero agregar filtro por precio mínimo y máximo', 'pendiente', NULL);

-- ============================================================
-- VISTA: Resumen de Saldos de Clientes (Opcional)
-- ============================================================
CREATE VIEW vista_saldo_clientes AS
SELECT
  u.id as clienteId,
  u.nombre,
  u.email,
  COUNT(DISTINCT l.id) as total_lotes,
  SUM(l.valor) as valor_total_lotes,
  COALESCE(SUM(p.monto), 0) as total_pagado,
  COALESCE(SUM(l.valor) - SUM(p.monto), SUM(l.valor)) as saldo_pendiente
FROM usuarios u
LEFT JOIN lotes l ON l.clienteid = u.id AND l.estado IN ('reservado', 'vendido')
LEFT JOIN pagos p ON p.clienteid = u.id
WHERE u.role = 'cliente'
GROUP BY u.id, u.nombre, u.email;

-- ============================================================
-- NOTAS SOBRE CONTRASEÑAS DEMO
-- ============================================================
-- Las contraseñas anterior usaban $2b$10$YourHashedPasswordHere
-- Usar la siguiente para generar hashes reales (bcrypt con salt 10):
-- 
-- admin123   → $2b$10$YourGeneratedHashHere
-- carlos123  → $2b$10$YourGeneratedHashHere
-- maria123   → $2b$10$YourGeneratedHashHere
-- juan123    → $2b$10$YourGeneratedHashHere
-- ana123     → $2b$10$YourGeneratedHashHere
--
-- Puedes generarlos ejecutando en Node.js:
-- const bcrypt = require('bcrypt');
-- bcrypt.hash('admin123', 10).then(hash => console.log(hash));
--
-- ============================================================
