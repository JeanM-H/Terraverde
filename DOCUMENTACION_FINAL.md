# TerraVerde — Documentación Técnica Final
## Sistema Web para Gestión de Venta de Lotes de Terreno
### ADSO-19 | Proyecto Finalizado

---

## TABLA DE CONTENIDOS

1. [Resumen del Sistema](#1-resumen-del-sistema)
2. [Arquitectura](#2-arquitectura)
3. [Estructura de Archivos](#3-estructura-de-archivos)
4. [Funcionalidades Implementadas](#4-funcionalidades-implementadas)
5. [Navegación y Flujo de Usuario](#5-navegación-y-flujo-de-usuario)
6. [Modelo de Datos y Base de Datos](#6-modelo-de-datos-y-base-de-datos)
7. [API REST](#7-api-rest)
8. [Middleware y Seguridad](#8-middleware-y-seguridad)
9. [Variables de Entorno](#9-variables-de-entorno)
10. [Despliegue](#10-despliegue)
11. [Cuentas Demo](#11-cuentas-demo)
12. [Estado de Entrega](#12-estado-de-entrega)

---

## 1. RESUMEN DEL SISTEMA

TerraVerde es un sistema web completo para la gestión de venta y reserva de lotes de terreno.
Permite a clientes comprar y pagar lotes, ver su historial, enviar PQRS y consultar su estado de cuenta.
Los administradores pueden gestionar lotes, pagos, usuarios y responder solicitudes.

El sistema combina:
- frontend estático en HTML/CSS/JavaScript
- backend Node.js + Express
- base de datos PostgreSQL
- despliegue serverless en Vercel

---

## 2. ARQUITECTURA

### Frontend
- Páginas HTML estáticas
- Estilos CSS responsivos
- JavaScript vanilla para:
  - validaciones de formularios
  - gestión de sesión
  - interacciones de UI
  - consumo de la API

### Backend
- `server.js`: servidor Express
- Rutas REST para usuarios, lotes, pagos, PQRS y auth
- Conexión PostgreSQL mediante `pg`
- Envío de correo con `nodemailer`
- Seguridad JWT para rutas protegidas

### Base de Datos
- PostgreSQL con tablas normalizadas:
  - `usuarios`
  - `lotes`
  - `pagos`
  - `pqrs`
  - `compras`

### Despliegue
- Plataforma: Vercel
- Configuración personalizada para rutas estáticas y API
- Variables de entorno configurables

---

## 3. ESTRUCTURA DE ARCHIVOS

```
/terraverde
├── api/              # Entrada Vercel para backend serverless
│   └── index.js
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── scripts/
│   ├── clean_db.js
│   └── schema.sql
├── index.html
├── login.html
├── registro.html
├── recuperar.html
├── lotes.html
├── proyecto.html
├── pqrs.html
├── dashboard.html
├── server.js
├── auth.js
├── vercel.json
├── package.json
├── DOCUMENTACION_FINAL.md
├── MODELO_ER_FINAL.md
└── README.md
```

---

## 4. FUNCIONALIDADES IMPLEMENTADAS

### Principal
- Registro de usuarios (clientes)
- Login y sesión persistente
- Recuperación de contraseña
- Catálogo público de lotes con filtros
- Reserva de lotes
- Registro de pagos por cuotas
- Historial de pagos y comprobantes
- PQRS con seguimiento y respuesta
- Panel administrativo completo

### Roles y permisos
- Cliente
- Administrador

### Experiencia de usuario
- UI responsiva
- Mensajes tipo toast
- Modal de confirmación
- Navegación clara por secciones

---

## 5. NAVEGACIÓN Y FLUJO DE USUARIO

### Público
- `index.html` → landing page
- `proyecto.html` → detalles del proyecto
- `lotes.html` → catálogo de lotes
- `pqrs.html` → formulario de PQRS
- `login.html` → login de usuario
- `registro.html` → registro de cliente

### Cliente autenticado
- `dashboard.html` → panel de cliente
- Interacciones desde lote: reservar, pagar, ver comprobantes

### Administrador autenticado
- `dashboard.html` → panel de gestión
- Acceso a gestión de usuarios, lotes, pagos y PQRS

---

## 6. MODELO DE DATOS Y BASE DE DATOS

### Entidades principales
- `usuarios`
- `lotes`
- `pagos`
- `pqrs`
- `compras`

### Relaciones clave
- Un usuario puede tener muchos lotes, pagos, PQRS y compras
- Un lote puede tener muchos pagos y compras

### Tabla `usuarios`
- `id` SERIAL PK
- `nombre` VARCHAR
- `email` VARCHAR UNIQUE
- `password` VARCHAR
- `telefono` VARCHAR
- `role` CHECK ('admin','cliente')
- `createdat`, `updatedat`

### Tabla `lotes`
- `id` SERIAL PK
- `area` INT
- `ubicacion` VARCHAR
- `valor` DECIMAL
- `estado` CHECK ('disponible','reservado','vendido')
- `etapa` CHECK ('Lanzamiento','Preventa','Construcción','Entrega')
- `clienteid` FK → `usuarios.id`
- `pago_tipo` CHECK ('contado','credito')
- `credito_meses`, `credito_tasa`, `credito_total`, `credito_mensual`, `credito_pagado`

### Tabla `pagos`
- `id` SERIAL PK
- `clienteid` FK → `usuarios.id`
- `loteid` FK → `lotes.id`
- `ncuota` INT
- `monto` DECIMAL
- `fecha` DATE
- `nota` TEXT

### Tabla `pqrs`
- `id` SERIAL PK
- `clienteid` FK → `usuarios.id` (opcional)
- `clienteNombre` VARCHAR
- `tipo` CHECK ('peticion','queja','reclamo','sugerencia')
- `asunto`, `descripcion`
- `estado` CHECK ('pendiente','en_proceso','resuelto','cerrado')
- `respuesta` TEXT
- `fecha` TIMESTAMP

### Tabla `compras`
- `id` SERIAL PK
- `clienteid` FK → `usuarios.id`
- `loteid` FK → `lotes.id`
- `fecha` TIMESTAMP
- `monto` DECIMAL
- `estado` CHECK ('completada','pendiente','cancelada')

---

## 7. API REST

### Autenticación
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/recover`
- `POST /api/auth/reset`

### Lotes
- `GET /api/lotes`
- `GET /api/lotes/:id`
- `POST /api/lotes` (admin)
- `PUT /api/lotes/:id` (admin)
- `POST /api/lotes/:id/reservar`

### Pagos
- `GET /api/pagos`
- `POST /api/pagos`

### PQRS
- `GET /api/pqrs`
- `POST /api/pqrs`
- `PUT /api/pqrs/:id`

### Usuarios
- `GET /api/usuarios`
- `GET /api/usuarios/:id`
- `PUT /api/usuarios/:id`

---

## 8. MIDDLEWARE Y SEGURIDAD

- Autenticación con JWT
- CORS configurado para origen seguro
- Validaciones de entrada en backend
- Manejo de errores con respuestas JSON claras
- Protección de rutas admin

---

## 9. VARIABLES DE ENTORNO

```env
DATABASE_URL=postgres://usuario:password@host:puerto/terraverde
JWT_SECRET=secreto_jwt_aqui
SMTP_HOST=smtp.host.com
SMTP_PORT=587
SMTP_USER=usuario_smtp
SMTP_PASS=password_smtp
EMAIL_FROM="TerraVerde <no-reply@terraverde.co>"
FRONTEND_URL=https://tu-dominio.vercel.app
NODE_ENV=production
```

---

## 10. DESPLIEGUE

### Vercel
- Conectar repositorio GitHub
- Configurar variables de entorno
- Dejar `vercel.json` para mapeo de rutas
- Deploy automático en cada push

### En local
1. `npm install`
2. `npm start`
3. Abrir `http://localhost:3000`

---

## 11. CUENTAS DEMO

- Admin: `admin@terraverde.co` / `admin123`
- Cliente: `carlos@gmail.com` / `carlos123`
- Cliente: `maria@gmail.com` / `maria123`

---

## 12. ESTADO DE ENTREGA

- Proyecto terminado
- Documentación técnica completa
- Modelo ER definido y validado
- Funcionalidades principales implementadas
- Preparado para despliegue y pruebas finales
