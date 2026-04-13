/**
 * ============================================================
 * Middleware de Autenticación JWT
 * ============================================================
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu-super-secreto-jwt-2024-terraverde';

/**
 * Genera un token JWT
 */
function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      nombre: user.nombre 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Middleware para verificar JWT en rutas protegidas
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(403).json({ error: 'Token inválido' });
  }
}

/**
 * Middleware para verificar que el usuario es admin
 */
function verifyAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: se requiere ser administrador' });
  }
  next();
}

/**
 * Middleware para verificar que es el mismo usuario o admin
 */
function verifySameUserOrAdmin(req, res, next) {
  const userId = parseInt(req.params.id);
  if (!req.user || (req.user.id !== userId && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  verifyAdmin,
  verifySameUserOrAdmin,
  JWT_SECRET
};
