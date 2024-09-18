const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../Database/config.js');  // Usa require en lugar de import

const router = express.Router();

// Ruta de registro
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Verificar si el usuario ya existe
    db.get('SELECT username FROM users WHERE username = ?', [username], async (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Error en la base de datos' });
        }

        if (row) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Encriptar la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        // Guardar el nuevo usuario en la base de datos
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
            if (err) {
                return res.status(500).json({ message: 'Error al guardar el usuario' });
            }

            res.json({ message: 'Usuario registrado con éxito' });
        });
    });
});

// Ruta de login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Verificar si el usuario existe
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Error en la base de datos' });
        }

        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        // Verificar la contraseña
        const passwordValida = await bcrypt.compare(password, user.password);
        if (!passwordValida) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        // Generar un token JWT
        const token = jwt.sign({ username: user.username }, 'secretkey', { expiresIn: '1h' });

        res.json({ message: 'Inicio de sesión exitoso', token });
    });
});

module.exports = router;  // Exportación usando CommonJS
