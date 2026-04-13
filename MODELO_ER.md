# Modelo Entidad-Relación (ER) — TerraVerde

**Sistema Web para Gestión de Venta de Lotes de Terreno**

---

## ?? Diagrama ER

```
+-----------------------------------------------------------------------------+
¦                        TERRAVERDE - MODELO CONCEPTUAL                       ¦
+-----------------------------------------------------------------------------+

                            +------------------+
                            ¦    USUARIOS      ¦
                            +------------------¦
                            ¦ pk: id (INT)     ¦
                            ¦ • nombre         ¦
                            ¦ • email (UNIQUE) ¦
                            ¦ • password       ¦
                            ¦ • telefono       ¦
                            ¦ • role           ¦
                            ¦ • createdAt      ¦
                            +------------------+
                                    ¦
                    +---------------+---------------+
                    ¦ (1:M)         ¦ (1:M)         ¦ (1:M)
                    ?               ?               ?
            +--------------+ +--------------+ +--------------+
            ¦    LOTES     ¦ ¦    PAGOS     ¦ ¦     PQRS     ¦
            +--------------¦ +--------------¦ +--------------¦
            ¦ pk: id       ¦ ¦ pk: id       ¦ ¦ pk: id       ¦
            ¦ • area       ¦ ¦ fk: clienteId¦ ¦ fk: clienteId¦
            ¦ • ubicacion  ¦ ¦ fk: loteId   ¦ ¦ • tipo       ¦
            ¦ • valor      ¦ ¦ • nCuota     ¦ ¦ • asunto     ¦
            ¦ • estado     ¦ ¦ • monto      ¦ ¦ • descripcion¦
            ¦ • etapa      ¦ ¦ • fecha      ¦ ¦ • estado     ¦
            ¦ fk: clienteId¦ ¦ • nota       ¦ ¦ • respuesta  ¦
            ¦ • pago_tipo  ¦ +--------------+ ¦ • fecha      ¦
            ¦ • credito_*  ¦                  +--------------+
            +--------------+
```

---

## ??? Descripción de Entidades

### 1. **USUARIOS**
Almacena información de usuarios del sistema (clientes y administradores).

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, SERIAL | Identificador único |
| `nombre` | VARCHAR(255) | NOT NULL | Nombre completo del usuario |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Correo electrónico |
| `password` | VARCHAR(255) | NOT NULL | Contraseña hasheada |
| `telefono` | VARCHAR(20) | - | Número de contacto |
| `role` | ENUM('admin', 'cliente') | NOT NULL, DEFAULT='cliente' | Rol en el sistema |
| `createdAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| `updatedAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de actualización |

**Índices:**
- `idx_email` en (email)
- `idx_role` en (role)

---

### 2. **LOTES**
Registro de todos los lotes disponibles en el proyecto inmobiliario.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, SERIAL | Identificador único |
| `area` | INT | NOT NULL | Superficie en m² |
| `ubicacion` | VARCHAR(255) | NOT NULL | Ubicación geográfica |
| `valor` | DECIMAL(14,2) | NOT NULL | Precio en COP |
| `estado` | ENUM('disponible','reservado','vendido') | DEFAULT 'disponible' | Estado del lote |
| `etapa` | ENUM('Lanzamiento','Preventa','Construcción','Entrega') | NOT NULL | Etapa de proyecto |
| `clienteId` | INT | FK ? usuarios.id | Cliente propietario |
| `pago_tipo` | ENUM('contado','credito') | DEFAULT 'contado' | Tipo de pago |
| `credito_meses` | INT | - | Plazo en meses |
| `credito_tasa` | DECIMAL(6,4) | - | Tasa de interés |
| `credito_total` | DECIMAL(14,2) | - | Total crédito |
| `credito_mensual` | DECIMAL(14,2) | - | Cuota mensual |
| `credito_pagado` | DECIMAL(14,2) | DEFAULT 0 | Total pagado en crédito |
| `createdAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha creación |
| `updatedAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha actualización |

**Índices:**
- `idx_estado` en (estado)
- `idx_etapa` en (etapa)
- `idx_clienteId` en (clienteId)

**Relaciones:**
- Muchos lotes pueden pertenecer a un usuario

---

### 3. **PAGOS**
Historial de pagos realizados por clientes.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, SERIAL | Identificador único |
| `clienteId` | INT | FK ? usuarios.id | Cliente que realiza el pago |
| `clienteNombre` | VARCHAR(255) | - | Nombre del cliente |
| `loteId` | INT | FK ? lotes.id | Lote asociado |
| `nCuota` | INT | NOT NULL | Número de cuota |
| `monto` | DECIMAL(14,2) | NOT NULL | Monto pagado |
| `fecha` | DATE | NOT NULL | Fecha del pago |
| `nota` | TEXT | - | Notas adicionales |
| `createdAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha creación |

**Índices:**
- `idx_clienteId` en (clienteId)
- `idx_loteId` en (loteId)
- `idx_fecha` en (fecha)

---

### 4. **PQRS**
Peticiones, Quejas, Reclamos y Sugerencias de clientes.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, SERIAL | Identificador único |
| `clienteId` | INT | FK ? usuarios.id, NULL | Cliente remitente |
| `clienteNombre` | VARCHAR(255) | - | Nombre del cliente |
| `tipo` | ENUM('peticion','queja','reclamo','sugerencia') | NOT NULL | Tipo de solicitud |
| `asunto` | VARCHAR(255) | NOT NULL | Asunto |
| `descripcion` | TEXT | NOT NULL | Descripción |
| `estado` | ENUM('pendiente','en_proceso','resuelto','cerrado') | DEFAULT 'pendiente' | Estado del caso |
| `respuesta` | TEXT | - | Respuesta del admin |
| `fecha` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

**Índices:**
- `idx_estado` en (estado)
- `idx_tipo` en (tipo)
- `idx_clienteId` en (clienteId)

---

### 5. **COMPRAS**
Registro de compras de lotes.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, SERIAL | Identificador único |
| `clienteId` | INT | FK ? usuarios.id | Cliente comprador |
| `loteId` | INT | FK ? lotes.id | Lote comprado |
| `fecha` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de compra |
| `monto` | DECIMAL(14,2) | - | Monto total |
| `estado` | ENUM('completada','pendiente','cancelada') | DEFAULT 'completada' | Estado de la compra |

**Índices:**
- `idx_clienteId` en (clienteId)
- `idx_loteId` en (loteId)

---

## ?? Cardinalidades

```
USUARIOS (1) --------------? (M) LOTES
           +--------------? (M) PAGOS
           +--------------? (M) PQRS
           +--------------? (M) COMPRAS

LOTES  (1) --------------? (M) PAGOS
      +--------------? (M) COMPRAS
```

---

## ?? Restricciones de Integridad

### Foreign Keys

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

## ?? Consultas Relevantes

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
