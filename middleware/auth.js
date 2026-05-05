const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Formato: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_aqui');
        req.user = verified;
        next(); // Si el token es bueno, deja pasar al controlador
    } catch (err) {
        res.status(403).json({ error: 'Token no válido o expirado.' });
    }
};

module.exports = verifyToken;