# 🏠 TerraVerde — Sistema Web Inmobiliario

**Sistema Web para Gestión de Venta de Lotes de Terreno**  
**Proyecto ADSO-19 | Desarrollo de Software**

[![Estado](https://img.shields.io/badge/Estado-Completado%20100%25-brightgreen)](https://github.com/TU_USUARIO/terraverde)
[![Tecnologías](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Tecnologías](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)](https://mysql.com/)
[![Tecnologías](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-blue.svg)](LICENSE)

---

## 🌟 Características Principales

### 👥 **Gestión de Usuarios**
- ✅ Registro de usuarios con validación de email
- ✅ Autenticación segura con JWT
- ✅ Roles diferenciados (Administrador/Cliente)
- ✅ Recuperación de contraseña

### 🏡 **Catálogo de Lotes**
- ✅ Visualización de lotes disponibles (100-200 m²)
- ✅ Filtros avanzados por área, precio, etapa
- ✅ Información detallada de cada lote
- ✅ Sistema de reservas en tiempo real

### 💰 **Sistema de Pagos**
- ✅ Registro de pagos por cuotas
- ✅ Financiamiento automático (6, 12, 24 meses)
- ✅ Cálculo de intereses y saldos pendientes
- ✅ Historial completo de pagos

### 📧 **Comunicación Automática**
- ✅ Comprobantes de pago por email
- ✅ Notificaciones de reserva
- ✅ Sistema PQRS (Peticiones, Quejas, Reclamos, Sugerencias)
- ✅ Seguimiento de solicitudes

### 👨‍💼 **Panel Administrativo**
- ✅ Dashboard con métricas en tiempo real
- ✅ Gestión completa de usuarios y lotes
- ✅ Reportes de pagos y PQRS
- ✅ Configuración del sistema

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MySQL** - Base de datos relacional
- **JWT** - Autenticación segura
- **bcrypt** - Encriptación de contraseñas
- **Nodemailer** - Envío de correos

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Diseño responsivo moderno
- **JavaScript** - Interactividad vanilla
- **Fetch API** - Comunicación con backend

### Despliegue
- **Vercel** - Plataforma serverless
- **GitHub** - Control de versiones
- **PlanetScale** - Base de datos en la nube

---

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- MySQL 8.0+
- Git

### Instalación Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/TU_USUARIO/terraverde.git
   cd terraverde
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar base de datos**
   ```bash
   # Crear base de datos MySQL
   mysql -u root -p < scripts/schema.sql
   ```

4. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus credenciales
   ```

5. **Iniciar servidor**
   ```bash
   npm start
   ```

6. **Acceder a la aplicación**
   - Abrir: `http://localhost:3000`
   - Usuario admin: `admin@terraverde.co` / `admin123`
   - Usuario cliente: `carlos@gmail.com` / `carlos123`

---

## 📁 Estructura del Proyecto

```
terraverde/
├── 📁 scripts/           # Scripts de base de datos
│   ├── schema.sql       # Estructura completa BD
│   └── clean_db.js      # Utilidades BD
├── 📁 css/              # Estilos CSS
│   └── styles.css       # Estilos globales
├── 📁 js/               # JavaScript frontend
│   └── app.js          # Lógica principal
├── 📄 server.js         # Backend Express
├── 📄 auth.js           # Middleware JWT
├── 📄 api.js            # Configuración Vercel
├── 📄 vercel.json       # Configuración despliegue
├── 📄 *.html            # Páginas frontend
└── 📄 *.md              # Documentación
```

---

## 📊 Base de Datos

### Modelo Entidad-Relación
```
USUARIOS (1) ──────────────► (M) LOTES
           └──────────────► (M) PAGOS
           └──────────────► (M) PQRS
           └──────────────► (M) COMPRAS

LOTES  (1) ──────────────► (M) PAGOS
      └──────────────► (M) COMPRAS
```

### Tablas Principales
- **usuarios** - Información de clientes y administradores
- **lotes** - Catálogo de terrenos disponibles
- **pagos** - Historial de transacciones
- **pqrs** - Sistema de consultas y reclamos
- **compras** - Registro de adquisiciones

---

## 🌐 Despliegue en Producción

### Vercel (Recomendado)

1. **Importar proyecto**
   - Ir a [vercel.com](https://vercel.com)
   - Importar desde GitHub

2. **Configurar variables de entorno**
   ```
   DB_HOST=tu-host-mysql
   DB_USER=tu-usuario
   DB_PASSWORD=tu-password
   DB_NAME=tu-base-datos
   JWT_SECRET=tu-secreto-jwt
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=tu-usuario-smtp
   SMTP_PASS=tu-password-smtp
   EMAIL_FROM=TerraVerde <no-reply@terraverde.co>
   ```

3. **Desplegar**
   - Vercel detecta automáticamente la configuración
   - URL de producción generada automáticamente

### Costos de Producción
- **Vercel:** $0 (plan Hobby)
- **PlanetScale:** $0 (1 base de datos)
- **Mailtrap:** $0 (200 emails/mes)
- **Total:** **$0 gratis**

---

## 👥 Cuentas de Prueba

### Administrador
- **Email:** `admin@terraverde.co`
- **Contraseña:** `admin123`

### Clientes Demo
- **Carlos Rodríguez:** `carlos@gmail.com` / `carlos123`
- **María González:** `maria@gmail.com` / `maria123`
- **Juan Pérez:** `juan@gmail.com` / `juan123`
- **Ana López:** `ana@gmail.com` / `ana123`

---

## 📖 Documentación

- **[📋 Manual de Usuario](MANUAL_USUARIO.md)** - Guía completa para usuarios finales
- **[🔧 Guía de Despliegue](GUIA_DESPLIEGUE.md)** - Instalación y configuración
- **[📊 Modelo ER](MODELO_ER.md)** - Diagrama de base de datos
- **[🧪 Reporte de Testing](TEST_API.md)** - Validación de funcionalidades
- **[📈 Análisis de Estado](ANALISIS_ESTADO.md)** - Estado del proyecto

---

## 🎯 Casos de Uso Implementados

| CU | Descripción | Estado |
|----|-------------|--------|
| CU-01 | Registro de Usuario | ✅ Completo |
| CU-02 | Inicio de Sesión | ✅ Completo |
| CU-03 | Compra de Lote | ✅ Completo |
| CU-04 | Registro de Pago | ✅ Completo |
| CU-05 | Historial de Pagos | ✅ Completo |
| CU-06 | PQRS | ✅ Completo |

---

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**Proyecto ADSO-19** - Desarrollo de Software  
Institución Educativa

---

## 🙏 Agradecimientos

- **Express.js** por el framework backend
- **Vercel** por la plataforma de despliegue
- **PlanetScale** por la base de datos
- **Mailtrap** por el servicio de email

---

## 📞 Contacto

- **Email:** info@terraverde.co
- **Web:** [https://terraverde.vercel.app](https://terraverde.vercel.app)
- **Teléfono:** +57 300 123 4567

---

**¡Gracias por usar TerraVerde! 🏠✨**

*Construyendo sueños, lote a lote.*
