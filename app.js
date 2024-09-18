const express = require('express');
const router = require('./Router/routers.js');  // Asegúrate de incluir la extensión .js si estás usando CommonJS

const app = express();

// Middleware para analizar JSON y datos enviados desde formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar el router para manejar las rutas de registro
app.use(router);

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

module.exports = app;  // Exportar el app para pruebas y otros usos
