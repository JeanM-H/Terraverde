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
            │ • estado     │ │ • monto      │ │ • descripcion│
            │ • etapa      │ │ • fecha      │ │ • estado     │
            │ fk: clienteId│ │ • nota       │ │ • respuesta  │
            │ • pago_tipo  │ └──────────────┘ │ • fecha      │
            │ • credito_*  │                  └──────────────┘
            └──────────────┘
```

---

## 🗂️ Descripción de Entidades

### 1. **USUARIOS**
Almacena información de usuarios del sistema (clientes y administradores).

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `nombre` | VARCHAR(255) | NOT NULL | Nombre completo del usuario |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Correo electrónico |
| `password` | VARCHAR(255) | NOT NULL | Contraseña hasheada (bcrypt) |
| `telefono` | VARCHAR(20) | - | Número de contacto |
| `role` | ENUM('admin', 'cliente') | NOT NULL, DEFAULT='cliente' | Rol en el sistema |
| `createdAt` | TIMESTAMP | DEFAULT=CURRENT_TIMESTAMP | Fecha de creación |
| `updatedAt` | TIMESTAMP | DEFAULT=CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

**Índices:**
- `idx_email` en (email)
- `idx_role` en (role)

---

### 2. **LOTES**
Registro de todos los lotes disponibles en el proyecto inmobiliario.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `area` | INT | NOT NULL | Superficie en m² |
| `ubicacion` | VARCHAR(255) | NOT NULL | Ubicación geográfica (Sector, Manzana, Lote) |
| `valor` | DECIMAL(14,2) | NOT NULL | Precio en COP |
| `estado` | ENUM | DEFAULT='disponible' | Estados: disponible, reservado, vendido |
| `etapa` | ENUM | NOT NULL | Etapa: Lanzamiento, Preventa, Construcción, Entrega |
| `clienteId` | INT | FK → USUARIOS(id) | Cliente propietario (NULL si disponible) |
| `pago_tipo` | ENUM | DEFAULT='contado' | Tipo de pago: contado, credito |
| `credito_meses` | INT | - | Plazo en meses (si es crédito) |
| `credito_tasa` | DECIMAL(6,4) | - | Tasa de interés (ej: 0.12 = 12%) |
| `credito_total` | DECIMAL(14,2) | - | Valor total con interés |
| `credito_mensual` | DECIMAL(14,2) | - | Cuota mensual |
| `credito_pagado` | DECIMAL(14,2) | DEFAULT=0 | Total pagado en crédito |
| `createdAt` | TIMESTAMP | DEFAULT=CURRENT_TIMESTAMP | Fecha de creación |
| `updatedAt` | TIMESTAMP | DEFAULT=CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

**Índices:**
- `idx_estado` en (estado)
- `idx_etapa` en (etapa)
- `idx_clienteId` en (clienteId)

**Relaciones:**
- M:1 con USUARIOS (clienteId)

---

### 3. **PAGOS**
Historial de pagos realizados por clientes.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `clienteId` | INT | FK → USUARIOS(id) | Cliente que realiza el pago |
| `clienteNombre` | VARCHAR(255) | - | Nombre del cliente (desnormalizado para reportes) |
| `loteId` | INT | FK → LOTES(id) | Lote sobre el que se paga |
| `nCuota` | INT | NOT NULL | Número de cuota |
| `monto` | DECIMAL(14,2) | NOT NULL | Monto pagado |
| `fecha` | DATE | NOT NULL | Fecha del pago |
| `nota` | TEXT | - | Notas adicionales |
| `createdAt` | TIMESTAMP | DEFAULT=CURRENT_TIMESTAMP | Fecha de creación en BD |

**Índices:**
- `idx_clienteId` en (clienteId)
- `idx_loteId` en (loteId)
- `idx_fecha` en (fecha)

**Relaciones:**
- M:1 con USUARIOS (clienteId)
- M:1 con LOTES (loteId)

---

### 4. **PQRS**
Peticiones, Quejas, Reclamos y Sugerencias de clientes.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `clienteId` | INT | FK → USUARIOS(id), NULL | Cliente que envía (NULL si anónimo) |
| `clienteNombre` | VARCHAR(255) | - | Nombre del cliente |
| `tipo` | ENUM | NOT NULL | Tipo: peticion, queja, reclamo, sugerencia |
| `asunto` | VARCHAR(255) | NOT NULL | Asunto |
| `descripcion` | TEXT | NOT NULL | Descripción detallada |
| `estado` | ENUM | DEFAULT='pendiente' | Estados: pendiente, en_proceso, resuelto, cerrado |
| `respuesta` | TEXT | - | Respuesta del administrador |
| `fecha` | TIMESTAMP | DEFAULT=CURRENT_TIMESTAMP | Fecha de creación |

**Índices:**
- `idx_estado` en (estado)
- `idx_tipoIdx` en (tipo)
- `idx_clienteId` en (clienteId)

**Relaciones:**
- M:1 con USUARIOS (clienteId) [opcional]

---

### 5. **COMPRAS**
Registro de compras realizadas.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `clienteId` | INT | FK → USUARIOS(id) | Cliente comprador |
| `loteId` | INT | FK → LOTES(id) | Lote comprado |
| `fecha` | TIMESTAMP | DEFAULT=CURRENT_TIMESTAMP | Fecha de compra |
| `monto` | DECIMAL(14,2) | - | Monto de la compra |
| `estado` | ENUM | DEFAULT='completada' | Estados: completada, pendiente, cancelada |

**Índices:**
- `idx_clienteId` en (clienteId)
- `idx_loteId` en (loteId)

**Relaciones:**
- M:1 con USUARIOS (clienteId)
- M:1 con LOTES (loteId)

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

### Foreign Keys:

```sql
-- LOTES → USUARIOS
ALTER TABLE lotes ADD CONSTRAINT fk_lotes_clienteId
FOREIGN KEY (clienteId) REFERENCES usuarios(id) ON DELETE SET NULL;

-- PAGOS → USUARIOS
ALTER TABLE pagos ADD CONSTRAINT fk_pagos_clienteId
FOREIGN KEY (clienteId) REFERENCES usuarios(id) ON DELETE CASCADE;

-- PAGOS → LOTES
ALTER TABLE pagos ADD CONSTRAINT fk_pagos_loteId
FOREIGN KEY (loteId) REFERENCES lotes(id) ON DELETE CASCADE;

-- PQRS → USUARIOS
ALTER TABLE pqrs ADD CONSTRAINT fk_pqrs_clienteId
FOREIGN KEY (clienteId) REFERENCES usuarios(id) ON DELETE SET NULL;

-- COMPRAS → USUARIOS
ALTER TABLE compras ADD CONSTRAINT fk_compras_clienteId
FOREIGN KEY (clienteId) REFERENCES usuarios(id) ON DELETE CASCADE;

-- COMPRAS → LOTES
ALTER TABLE compras ADD CONSTRAINT fk_compras_loteId
FOREIGN KEY (loteId) REFERENCES lotes(id) ON DELETE CASCADE;
```

---

## 📊 Vistas (Consultas Frecuentes)

### Vista: Saldo de Clientes

```sql
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
```

### Query: Historial de Pagos por Cliente

```sql
SELECT 
  p.id,
  p.nCuota,
  p.monto,
  p.fecha,
  l.ubicacion,
  l.area,
  u.nombre,
  u.email
FROM pagos p
JOIN usuarios u ON p.clienteId = u.id
JOIN lotes l ON p.loteId = l.id
WHERE p.clienteId = ?
ORDER BY p.fecha DESC;
```

---

## 🔄 Flujos de Datos

### Compra de Lote (Reserva):

```
1. Cliente solicita reservar lote (ME INTERESA)
   ↓
2. Sistema valida usuario autenticado
   ↓
3. Sistema registra clienteId en lote
   ↓
4. Sistema registra primer pago (si aplica)
   ↓
5. Sistema cambia estado lote (disponible → reservado)
   ↓
6. Sistema envía confirmación por email
```

### Pago Posterior:

```
1. Cliente registra nuevo pago
   ↓
2. Sistema inserta registro en PAGOS
   ↓
3. Sistema recalcula credito_pagado (si es financiado)
   ↓
4. Sistema valida si lote está completamente pagado
   ↓
5. Sistema cambia estado lote a "vendido" si aplica
   ↓
6. Sistema envía comprobante por email
```

---

## 📋 Normalización

El modelo sigue **Tercera Forma Normal (3FN)**:

- ✅ 1FN: Todos los atributos son atómicos
- ✅ 2FN: No hay dependencias parciales de la clave
- ✅ 3FN: No hay dependencias transitivas
- ⚠️ Desnormalización intencional: `clienteNombre` en PAGOS y PQRS (para reportes)

---

## 🚀 Optimizaciones Futuras

1. **Tabla de auditoría** para cambios críticos
2. **Tabla de promociones** para descuentos
3. **Tabla de planos** para documentos de vivienda
4. **Particionamiento** por fecha en PAGOS (volumen alto)
5. **Índices adicionales** según análisis de queries

---

**Documento generado:** 13 de abril de 2026  
**Versión:** 1.0  
**Autor:** Sistema TerraVerde
