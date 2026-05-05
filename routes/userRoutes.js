const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth'); // Importamos la seguridad
const { 
    registerUser, 
    loginUser, 
    getUsers, 
    deleteUser, 
    updateUser,
    getSecurityQuestion,
    resetPassword
} = require('../controllers/userController');

// --- RUTAS PÚBLICAS (Cualquiera puede entrar) ---

// 1. Login (Es la puerta de entrada para obtener el Token)
router.post('/login', loginUser);

// 2. Obtener pregunta de seguridad por nombre de usuario
router.get('/security-question/:username', getSecurityQuestion);

// 3. Verificar respuesta y actualizar a nueva contraseña
router.post('/reset-password', resetPassword);


// --- RUTAS PRIVADAS (Requieren Token JWT) ---
// Aplicamos verifyToken a partir de aquí para que nadie haga muladas

// 4. Obtener lista completa (Solo personal autorizado)
router.get('/', verifyToken, getUsers);

// 5. Registrar usuario (Normalmente un admin crea a otros)
router.post('/register', verifyToken, registerUser);

// 6. Eliminar usuario
router.delete('/:id', verifyToken, deleteUser);

// 7. Actualizar usuario (Perfil/Admin)
router.put('/:id', verifyToken, updateUser);

module.exports = router;