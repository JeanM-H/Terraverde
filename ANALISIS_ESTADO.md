# ANÁLISIS DE ESTADO - TerraVerde | ADSO-19

**Fecha:** 13 de abril de 2026  
**Versión:** 1.0  
**Estado General:** 60-70% completado

---

## 📊 MATRIZ DE REQUISITOS FUNCIONALES

| Requisito | Estado | Descripción |
|-----------|--------|-------------|
| **CU-01: Registro de Usuario** | ✅ **COMPLETO** | Formulario frontend con validaciones. Backend `/api/usuarios` POST funcional. Contraseñas hasheadas con bcrypt. |
| **CU-02: Inicio de Sesión** | ✅ **COMPLETO** | Autenticación frontend/backend. Recuperación de contraseña. Toggle de visibilidad. |
| **CU-03: Compra de Lote** | ✅ **COMPLETO** | Catálogo filtrable. Modal "Me Interesa". Cambio de estado de lote dinámico. |
| **CU-04: Pago y Comprobante** | ⚠️ **PARCIAL** | Modal de pago funcional. Comprobante visual. Envío de email configurado pero NO completamente testeado. |
| **CU-05: Historial de Pagos** | ⚠️ **PARCIAL** | Tabla de pagos visible. Backend `/api/pagos` existe pero frontend usa localStorage. |
| **CU-06: PQRS** | ✅ **COMPLETO** | Formulario público. 4 tipos de solicitud. Seguimiento de estado. Respuesta del admin. |

---

## 🔧 ESTADO TÉCNICO POR CAPAS

### 📱 Frontend (HTML/CSS/JS)
**Completitud: 85%**

#### ✅ Implementado:
- Todas las páginas HTML (10 vistas)
- Sistema de autenticación con sesiones
- Navegación responsiva con sidebar
- Diseño CSS moderno con variables personalizadas
- Toast notifications (alertas amigables)
- Validaciones de formularios en tiempo real
- Medidor de fortaleza de contraseña
- Sistema de modales reutilizable
- Filtros en catálogo de lotes

#### ⚠️ Incompleto:
- **Integración Backend:** Muchas páginas usan `localStorage` en lugar de consmir APIs
- **Lotes:** `lotes.html` no consume `/api/lotes` (usa datos demo locales)
- **Dashboard:** No obtiene datos reales de `/api/pagos` ni `/api/usuarios`
- **Estado de Cuenta:** No calcula saldo desde `/api/clientes/:id/saldo`
- **Plan de Financiación:** No muestra tabla de amortización (crédito)

---

### 🖥️ Backend (Node.js/Express)
**Completitud: 75%**

#### ✅ Implementado:
- **Servidor Express** corriendo en puerto 3000
- **20+ endpoints REST** creados
- **Conexión MySQL** con pool de conexiones
- **Encriptación bcrypt** para contraseñas
- **Envío de correos** con Nodemailer + Mailtrap
- **CORS** habilitado
- **Variables de entorno** con dotenv

#### Endpoints Implementados:
```javascript
// Lotes
GET    /api/lotes                    // Listar todos
POST   /api/lotes                    // Crear lote
PUT    /api/lotes/:id                // Editar lote
POST   /api/lotes/:id/reservar       // Reservar lote

// Pagos
GET    /api/pagos                    // Listar pagos
POST   /api/pagos                    // Registrar pago
GET    /api/clientes/:id/saldo       // Saldo del cliente

// Usuarios
POST   /api/usuarios                 // Registrar usuario
POST   /api/login                    // Iniciar sesión
GET    /api/usuarios                 // Listar usuarios
GET    /api/usuarios/:id             // Obtener usuario
PUT    /api/usuarios/:id             // Editar usuario
POST   /api/usuarios/cambiar-password // Cambiar contraseña

// PQRS
GET    /api/pqrs                     // Listar PQRS
POST   /api/pqrs                     // Crear PQRS

// Compras
POST   /api/compras                  // Registrar compra

// Otros
POST   /api/test-email               // Prueba de envío de email
```

#### ⚠️ Problemas Identificados:
1. **Sin autenticación en endpoints:** Cualquiera puede acceder a cualquier ruta
2. **Sin validación de roles:** No distingue admin de cliente
3. **Sin middleware de autenticación:** Falta JWT o sesiones del lado servidor
4. **CORS abierto a '*':** `origin: '*'` es riesgo de seguridad
5. **Try-catch incompleto:** Muchas rutas sin manejo de errores
6. **Lógica de crédito parcial:** Campos en BD pero cálculos de cuotas NO visible en frontend

---

### 🗄️ Base de Datos (MySQL)
**Completitud: 60%**

#### ✅ Tablas Creadas:
```sql
- usuarios (id, nombre, email, password, role, phone, createdAt)
- lotes (id, area, ubicacion, valor, estado, etapa, clienteId, 
         pago_tipo, credito_meses, credito_tasa, credito_total, 
         credito_mensual, credito_pagado)
- pagos (id, clienteId, clienteNombre, loteId, nCuota, monto, fecha, nota)
- pqrs (id, tipo, asunto, descripcion, status, respuesta, createdAt)
- compras (id, clienteId, loteId, fecha, monto, estado)
```

#### ⚠️ Falta:
- **Script SQL exportado** para instalar en nueva BD
- **Datos de ejemplo** (seed data)
- **Índices** para optimizar consultas
- **Restricciones de integridad** referencial (FOREIGN KEY)
- **Documento ER formal** (que exija PDF/imagen)

---

## 📋 REQUISITOS NO FUNCIONALES

| Requisito | Estado |
|-----------|--------|
| Encriptación de contraseñas (bcrypt) | ✅ Implementado |
| Control de sesiones | ⚠️ Frontend sí, backend no |
| Roles (Admin/Cliente) | ✅ Existe estructura, sin validación en API |
| Interfaz responsiva | ✅ Completamente responsiva |
| Despliegue Vercel | ❌ **No iniciado** |

---

## 🚀 ENTREGABLES REQUERIDOS Y ESTADO

| Entregable | Estado | Ubicación |
|-----------|--------|-----------|
| Código fuente Frontend | ✅ | `/*.html`, `css/`, `js/` |
| Código fuente Backend | ✅ | `server.js` |
| Base de datos SQL script | ❌ | **No existe** |
| Modelo Entidad-Relación | ❌ | **No existe documento** |
| Aplicación desplegada (URL) | ❌ | **No desplegada** |
| Manual de usuario | ❌ | **No existe** |

---

## 🎯 ACCIONES PRIORITARIAS PARA COMPLETAR

### ALTA PRIORIDAD (Bloquean entrega)

1. **✋ Generar script SQL (2 horas)**
   - Exportar estructura BD actual
   - Agregar `CREATE TABLE` con `IF NOT EXISTS`
   - Incluir datos de ejemplo (5-10 lotes, 3-5 usuarios)
   - Archivo: `scripts/schema.sql`

2. **👥 Integrar autenticación Backend (3 horas)**
   - Implementar JWT para sesiones del lado servidor
   - Crear middleware de autenticación para rutas
   - Proteger endpoints `/api/pagos`, `/api/lotes`, `/api/usuarios`

3. **🔗 Conectar Frontend ↔ Backend (4 horas)**
   - `lotes.html`: Reemplazar localStorage con `fetch('/api/lotes')`
   - `dashboard.html`: Conectar a `/api/usuarios`, `/api/pagos`
   - `estado.html`: Llamar `/api/clientes/:id/saldo`
   - Agregar manejo de errores en todas las llamadas

4. **📊 Documento ER (1 hora)**
   - Crear diagrama en Lucidchart o Draw.io
   - Exportar como PNG/PDF
   - Incluir cardinalidades y relaciones

5. **🌐 Despliegue Vercel (2 horas)**
   - Crear `vercel.json`
   - Configurar variables de entorno en Vercel
   - Hacer push a GitHub
   - Desplegar y testear

### MEDIA PRIORIDAD

6. **📮 Validar envío de emails** (1 hora)
   - Verificar credenciales Mailtrap
   - Testear endpoint `/api/test-email`
   - Registrar pago y validar que llegue email

7. **🛡️ Hardening de Seguridad** (2 horas)
   - CORS restringido a dominio
   - Input validation en todos los endpoints
   - Rate limiting
   - Validación de roles en cada endpoint

### BAJA PRIORIDAD

8. **📘 Manual de usuario** (2 horas)
   - Screenshots de cada flujo
   - Instrucciones paso a paso

---

## 📋 VERIFICACIÓN RÁPIDA

Para validar el estado actual:

```bash
# 1. Terminal 1: Iniciar servidor
cd c:\Users\Administrator\Downloads\terraverde
npm install
node server.js

# 2. Terminal 2: Verificar base de datos
mysql -u root -p terraverde
SHOW TABLES;
SELECT COUNT(*) FROM usuarios;

# 3. Navegador: Ir a cada página
http://localhost:3000/index.html
http://localhost:3000/login.html
http://localhost:3000/dashboard.html

# 4. Verificar APIs
curl http://localhost:3000/api/lotes
curl http://localhost:3000/api/usuarios
```

---

## 🎓 CONCLUSIÓN

**TerraVerde está ~70% funcional.** Las características principales existen pero necesitan:
1. ✋ **Base de datos SQL exportada**
2. 👥 **Autenticación Backend con JWT**
3. 🔗 **Integración completa Frontend-Backend**
4. 📊 **Documentación ER y manual usuario**
5. 🌐 **Despliegue en Vercel**

Con estos cambios, el proyecto estará **100% listo para entregar en 10-12 horas de trabajo intenso.**

---

**Próximos pasos recomendados:**
1. Generar script SQL
2. Implementar JWT
3. Integrar APIs faltantes
4. Desplegar en Vercel
5. Documentar todo
