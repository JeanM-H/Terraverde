-- ============================================================
-- TerraVerde — Script de Base de Datos MySQL
-- ADSO-19 | Sistema Web de Gestión de Venta de Lotes
-- ============================================================

-- Crear base de datos
DROP DATABASE IF EXISTS terraverde;
CREATE DATABASE terraverde CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE terraverde;

-- ============================================================
-- TABLA: usuarios
-- ============================================================
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  role ENUM('admin', 'cliente') NOT NULL DEFAULT 'cliente',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: lotes
-- ============================================================
CREATE TABLE lotes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  area INT NOT NULL,
  ubicacion VARCHAR(255) NOT NULL,
  valor DECIMAL(14,2) NOT NULL,
  estado ENUM('disponible', 'reservado', 'vendido') NOT NULL DEFAULT 'disponible',
  etapa ENUM('Lanzamiento', 'Preventa', 'Construcción', 'Entrega') NOT NULL,
  clienteId INT,
  pago_tipo ENUM('contado', 'credito') NOT NULL DEFAULT 'contado',
  credito_meses INT,
  credito_tasa DECIMAL(6,4),
  credito_total DECIMAL(14,2),
  credito_mensual DECIMAL(14,2),
  credito_pagado DECIMAL(14,2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (clienteId) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_estado (estado),
  INDEX idx_etapa (etapa),
  INDEX idx_clienteId (clienteId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: pagos
-- ============================================================
CREATE TABLE pagos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  clienteId INT NOT NULL,
  clienteNombre VARCHAR(255),
  loteId INT NOT NULL,
  nCuota INT NOT NULL,
  monto DECIMAL(14,2) NOT NULL,
  fecha DATE NOT NULL,
  nota TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clienteId) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (loteId) REFERENCES lotes(id) ON DELETE CASCADE,
  INDEX idx_clienteId (clienteId),
  INDEX idx_loteId (loteId),
  INDEX idx_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: pqrs
-- ============================================================
CREATE TABLE pqrs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  clienteId INT,
  clienteNombre VARCHAR(255),
  tipo ENUM('peticion', 'queja', 'reclamo', 'sugerencia') NOT NULL,
  asunto VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  estado ENUM('pendiente', 'en_proceso', 'resuelto', 'cerrado') NOT NULL DEFAULT 'pendiente',
  respuesta TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clienteId) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_estado (estado),
  INDEX idx_tipoIdx (tipo),
  INDEX idx_clienteId (clienteId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: compras
-- ============================================================
CREATE TABLE compras (
  id INT PRIMARY KEY AUTO_INCREMENT,
  clienteId INT NOT NULL,
  loteId INT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  monto DECIMAL(14,2),
  estado ENUM('completada', 'pendiente', 'cancelada') NOT NULL DEFAULT 'completada',
  FOREIGN KEY (clienteId) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (loteId) REFERENCES lotes(id) ON DELETE CASCADE,
  INDEX idx_clienteId (clienteId),
  INDEX idx_loteId (loteId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
INSERT INTO lotes (area, ubicacion, valor, estado, etapa, clienteId, pago_tipo) VALUES
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
INSERT INTO pagos (clienteId, clienteNombre, loteId, nCuota, monto, fecha, nota) VALUES
(3, 'María González', 4, 1, 13500000, '2024-02-15', 'Cuota inicial crediticia'),
(3, 'María González', 4, 2, 13500000, '2024-03-15', 'Segunda cuota'),
(4, 'Juan Pérez', 9, 1, 10000000, '2024-03-01', 'Pago inicial'),
(4, 'Juan Pérez', 9, 2, 10000000, '2024-04-01', 'Segunda cuota'),
(2, 'Carlos Rodríguez', 3, 1, 33750000, '2024-01-20', 'Reserva de lote');

-- PQRS demo
INSERT INTO pqrs (clienteId, clienteNombre, tipo, asunto, descripcion, estado, respuesta) VALUES
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
LEFT JOIN lotes l ON l.clienteId = u.id AND l.estado IN ('reservado', 'vendido')
LEFT JOIN pagos p ON p.clienteId = u.id
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
