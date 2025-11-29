"use strict";
// ===============================
// MIDDLEWARE DE AUTENTICACIÓN
// ===============================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTeacherOrAdmin = exports.requireTeacher = exports.requireAdmin = exports.requireAdminEntity = exports.requireAdminGeneral = exports.requireRole = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido',
                timestamp: new Date(),
            });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no válido',
                timestamp: new Date(),
            });
        }
        // Verificar el token JWT
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        // Agregar información del usuario al request
        req.user = {
            id: decoded.userId,
            role: decoded.role,
            email: decoded.email,
            entityId: decoded.entityId,
        };
        return next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido',
                timestamp: new Date(),
            });
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: 'Token expirado',
                timestamp: new Date(),
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            timestamp: new Date(),
        });
    }
};
exports.authMiddleware = authMiddleware;
// Middleware para verificar roles específicos
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado',
                timestamp: new Date(),
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para acceder a este recurso',
                timestamp: new Date(),
            });
        }
        return next();
    };
};
exports.requireRole = requireRole;
// Middleware específicos por rol
exports.requireAdminGeneral = (0, exports.requireRole)(['admin_general']);
exports.requireAdminEntity = (0, exports.requireRole)(['admin_entity']);
exports.requireAdmin = (0, exports.requireRole)(['admin_general', 'admin_entity']);
exports.requireTeacher = (0, exports.requireRole)(['teacher']);
exports.requireTeacherOrAdmin = (0, exports.requireRole)(['teacher', 'admin_general', 'admin_entity']);
//# sourceMappingURL=auth.js.map