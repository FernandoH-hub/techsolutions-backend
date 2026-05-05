const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); 
const rateLimit = require('express-rate-limit'); 
const verifyToken = require('./middleware/auth'); 
require('dotenv').config();

const app = express();

// --- MIDDLEWARES ---
app.use(helmet()); 
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Demasiadas peticiones, intenta más tarde.' }
});
app.use('/api/', limiter);

// --- 1. IMPORTAR RUTAS ---
const clientRoutes = require('./routes/clientRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes'); // Aquí está tu login
const projectTeamRoutes = require('./routes/projectTeamRoutes');
const logRoutes = require('./routes/logRoutes');

// --- 2. USAR RUTAS ---

// La ruta de usuarios/login debe ser pública para poder entrar
app.use('/api/users', userRoutes); 

// El resto de rutas son privadas y requieren el token de JWT
app.use('/api/clients', verifyToken, clientRoutes);
app.use('/api/projects', verifyToken, projectRoutes);
app.use('/api/tasks', verifyToken, taskRoutes);
app.use('/api/project_team', verifyToken, projectTeamRoutes);
app.use('/api/logs', verifyToken, logRoutes);

// --- 3. MANEJO DE ERRORES ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        status: 'error',
        message: 'Ocurrió un error interno en el servidor' 
    });
});

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('API de TechSolutions 🚀');
});

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});