const express = require('express');
const path = require('path');

// Este es el punto de entrada para Vercel (serverless)
const app = express();

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Importar las rutas del servidor
const serverModule = require('./server.js');

// El módulo server.js debería exportar la app de Express
// Si no lo hace, asegúrate de exportar al final de server.js:
// module.exports = app;

// Para Vercel, usamos esta exportación
module.exports = app;
