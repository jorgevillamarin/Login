const request = require('supertest');
const app = require('../app.js');  // Asegúrate de que la ruta sea correcta
const db = require('../Database/config.js');  // Base de datos para pruebas

// Configura la base de datos para pruebas
beforeAll(async () => {
    await new Promise((resolve, reject) => {
        db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)', (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
});

afterAll(async () => {
    // Limpia la base de datos de pruebas
    await new Promise((resolve, reject) => {
        db.run('DROP TABLE IF EXISTS users', (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
});

describe('POST /register', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/register')
            .send({ username: 'testuser', password: 'testpass' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Usuario registrado con éxito');
    });

    it('should not register a user that already exists', async () => {
        // Inserta un usuario previamente
        await request(app)
            .post('/register')
            .send({ username: 'existinguser', password: 'testpass' });

        const res = await request(app)
            .post('/register')
            .send({ username: 'existinguser', password: 'testpass' });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'El usuario ya existe');
    });
});

describe('POST /login', () => {
    beforeAll(async () => {
        // Inserta un usuario para pruebas de login
        await request(app)
            .post('/register')
            .send({ username: 'loginuser', password: 'loginpass' });
    });

    it('should login successfully with correct credentials', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'loginuser', password: 'loginpass' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Inicio de sesión exitoso');
        expect(res.body).toHaveProperty('token');  // Verificar que haya un token
    });

    it('should fail to login with incorrect password', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'loginuser', password: 'wrongpass' });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Contraseña incorrecta');
    });

    it('should fail to login with non-existent user', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'nonexistentuser', password: 'password' });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Usuario no encontrado');
    });
});
