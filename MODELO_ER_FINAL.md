# Modelo Entidad-Relación (ER) — TerraVerde

**Sistema Web para Gestión de Venta de Lotes de Terreno**

---

## 📊 Diagrama ER

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TERRAVERDE - MODELO CONCEPTUAL                       │
└─────────────────────────────────────────────────────────────────────────────┘

                            ┌──────────────────┐
                            │    USUARIOS      │
                            ├──────────────────┤
                            │ pk: id (INT)     │
                            │ • nombre         │
                            │ • email (UNIQUE) │
                            │ • password       │
                            │ • telefono       │
                            │ • role           │
                            │ • createdAt      │
                            └────────┬─────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │ (1:M)         │ (1:M)         │ (1:M)
                    ▼               ▼               ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │    LOTES     │ │    PAGOS     │ │     PQRS     │
            ├──────────────┤ ├──────────────┤ ├──────────────┤
            │ pk: id       │ │ pk: id       │ │ pk: id       │
            │ • area       │ │ fk: clienteId│ │ fk: clienteId│
            │ • ubicacion  │ │ fk: loteId   │ │ • tipo       │
            │ • valor      │ │ • nCuota     │ │ • asunto     │
            │ • estado     │ │ • monto      │ │ • descripción│
            │ • etapa      │ │ • fecha      │ │ • estado     │
            │ fk: clienteId│ │ • nota       │ │ • respuesta  │
            │ • pago_tipo  │ └──────────────┘ │ • fecha      │
            │ • credito_*  │                  └──────────────┘
            └──────────────┘
```

---

## 🗂️ Descripción de Entidades

### 1. USUARIOS
Almacena información de usuarios del sistema (clientes y administradores).

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, SERIAL | Identificador único |
| `nombre` | VARCHAR(255) | NOT NULL | Nombre completo del usuario |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Correo electrónico |
| `password` | VARCHAR(255) | NOT NULL | Contraseña hasheada |
| `telefono` | VARCHAR(20) | - | Número de contacto |
| `role` | ENUM('admin','cliente') | NOT NULL, DEFAULT 'cliente' | Rol en el sistema |
| `createdAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| `updatedAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de actualización |

---

### 2. LOTES
Registro de los lotes del proyecto.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, SERIAL | Identificador único |
| `area` | INT | NOT NULL | Superficie en m² |
| `ubicacion` | VARCHAR(255) | NOT NULL | Ubicación descriptiva |
| `valor` | DECIMAL(14,2) | NOT NULL | Precio en COP |
| `estado` | ENUM('disponible','reservado','vendido') | DEFAULT 'disponible' | Estado del lote |
| `etapa` | ENUM('Lanzamiento','Preventa','Construcción','Entrega') | NOT NULL | Etapa del proyecto |
| `clienteId` | INT | FK → usuarios.id | Cliente propietario |
| `pago_tipo` | ENUM('contado','credito') | DEFAULT 'contado' | Método de pago |
| `credito_meses` | INT | - | Plazo en meses |
| `credito_tasa` | DECIMAL(6,4) | - | Tasa de interés |
| `credito_total` | DECIMAL(14,2) | - | Valor total de crédito |
| `credito_mensual` | DECIMAL(14,2) | - | Pago mensual |
| `credito_pagado` | DECIMAL(14,2) | DEFAULT 0 | Monto abonado |
| `createdAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha creación |
| `updatedAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha actualización |

---

### 3. PAGOS
Registro de pagos realizados por clientes.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, SERIAL | Identificador único |
| `clienteId` | INT | FK → usuarios.id | Cliente que paga |
| `clienteNombre` | VARCHAR(255) | - | Nombre del cliente |
| `loteId` | INT | FK → lotes.id | Lote vinculado |
| `nCuota` | INT | NOT NULL | Número de cuota |
| `monto` | DECIMAL(14,2) | NOT NULL | Monto pagado |
| `fecha` | DATE | NOT NULL | Fecha del pago |
| `nota` | TEXT | - | Nota adicional |
| `createdAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha creación |

---

### 4. PQRS
Solicitudes del tipo petición, queja, reclamo o sugerencia.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, SERIAL | Identificador único |
| `clienteId` | INT | FK → usuarios.id, NULL | Cliente remitente |
| `clienteNombre` | VARCHAR(255) | - | Nombre del cliente |
| `tipo` | ENUM('peticion','queja','reclamo','sugerencia') | NOT NULL | Tipo de solicitud |
| `asunto` | VARCHAR(255) | NOT NULL | Asunto |
| `descripcion` | TEXT | NOT NULL | Descripción |
| `estado` | ENUM('pendiente','en_proceso','resuelto','cerrado') | DEFAULT 'pendiente' | Estado actual |
| `respuesta` | TEXT | - | Respuesta del admin |
| `fecha` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

---

### 5. COMPRAS
Registro de la compra final de lotes.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, SERIAL | Identificador único |
| `clienteId` | INT | FK → usuarios.id | Cliente comprador |
| `loteId` | INT | FK → lotes.id | Lote comprado |
| `fecha` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de compra |
| `monto` | DECIMAL(14,2) | - | Monto total |
| `estado` | ENUM('completada','pendiente','cancelada') | DEFAULT 'completada' | Estado de la compra |

---

## 📈 Cardinalidades

```
USUARIOS (1) ──────────────► (M) LOTES
           └──────────────► (M) PAGOS
           └──────────────► (M) PQRS
           └──────────────► (M) COMPRAS

LOTES  (1) ──────────────► (M) PAGOS
      └──────────────► (M) COMPRAS
```

---

## 🔑 Restricciones de Integridad

```sql
ALTER TABLE lotes ADD CONSTRAINT fk_lotes_clienteId
  FOREIGN KEY (clienteid) REFERENCES usuarios(id) ON DELETE SET NULL;

ALTER TABLE pagos ADD CONSTRAINT fk_pagos_clienteId
  FOREIGN KEY (clienteid) REFERENCES usuarios(id) ON DELETE CASCADE;

ALTER TABLE pagos ADD CONSTRAINT fk_pagos_loteId
  FOREIGN KEY (loteid) REFERENCES lotes(id) ON DELETE CASCADE;

ALTER TABLE pqrs ADD CONSTRAINT fk_pqrs_clienteId
  FOREIGN KEY (clienteid) REFERENCES usuarios(id) ON DELETE SET NULL;

ALTER TABLE compras ADD CONSTRAINT fk_compras_clienteId
  FOREIGN KEY (clienteid) REFERENCES usuarios(id) ON DELETE CASCADE;

ALTER TABLE compras ADD CONSTRAINT fk_compras_loteId
  FOREIGN KEY (loteid) REFERENCES lotes(id) ON DELETE CASCADE;
```

---

## 📊 Consultas Relevantes

### Saldo de clientes

```sql
CREATE VIEW vista_saldo_clientes AS
SELECT
  u.id AS clienteId,
  u.nombre,
  u.email,
  COUNT(DISTINCT l.id) AS total_lotes,
  SUM(l.valor) AS valor_total_lotes,
  COALESCE(SUM(p.monto), 0) AS total_pagado,
  COALESCE(SUM(l.valor) - SUM(p.monto), SUM(l.valor)) AS saldo_pendiente
FROM usuarios u
LEFT JOIN lotes l ON l.clienteid = u.id AND l.estado IN ('reservado', 'vendido')
LEFT JOIN pagos p ON p.clienteid = u.id
WHERE u.role = 'cliente'
GROUP BY u.id, u.nombre, u.email;
```

### Historial de pagos por cliente

```sql
SELECT
  p.id,
  p.ncuota,
  p.monto,
  p.fecha,
  l.ubicacion,
  l.area,
  u.nombre,
  u.email
FROM pagos p
JOIN usuarios u ON p.clienteid = u.id
JOIN lotes l ON p.loteid = l.id
WHERE p.clienteid = $1
ORDER BY p.fecha DESC;
```
