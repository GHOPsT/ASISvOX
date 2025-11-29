"use strict";
// ===============================
// CONTROLADOR DE AUTENTICACIÓN
// ===============================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.refreshToken = exports.logout = exports.register = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const errorHandler_1 = require("../middleware/errorHandler");
const connection_1 = require("../config/connection");
// ===============================
// FUNCIONES DE BASE DE DATOS
// ===============================
// Buscar usuario por email
const findUserByEmail = async (email) => {
    const result = await (0, connection_1.query)('SELECT id, email, password_hash, full_name, role, entity_id, max_teachers_allowed, phone, photo_url, is_active, created_at, updated_at, last_login FROM users WHERE email = $1', [email]);
    return result.rows[0];
};
// Crear nuevo usuario
const createUser = async (userData) => {
    const { name, email, password, role, entityId } = userData;
    const hashedPassword = await bcryptjs_1.default.hash(password, 12);
    const result = await (0, connection_1.query)(`INSERT INTO users (email, password_hash, full_name, role, entity_id, max_teachers_allowed) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING id, email, full_name, role, entity_id, max_teachers_allowed, phone, photo_url, is_active, created_at, updated_at`, [email, hashedPassword, name, role, entityId || null, role === 'admin_entity' ? 0 : null]);
    return result.rows[0];
};
// Actualizar último login
const updateLastLogin = async (userId) => {
    await (0, connection_1.query)('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
};
// Buscar usuario por ID
const findUserById = async (userId) => {
    const result = await (0, connection_1.query)('SELECT id, email, password_hash, full_name, role, entity_id, max_teachers_allowed, phone, photo_url, is_active, created_at, updated_at, last_login FROM users WHERE id = $1', [userId]);
    return result.rows[0];
};
// Generar JWT token - INCLUYE entityId
const generateToken = (user) => {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    return jsonwebtoken_1.default.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
        entityId: user.entity_id || undefined
    }, secret, { expiresIn: '24h' });
};
// Generar refresh token
const generateRefreshToken = (user) => {
    const secret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    return jsonwebtoken_1.default.sign({ userId: user.id }, secret, { expiresIn: '7d' });
};
// ===============================
// CONTROLADORES
// ===============================
// Login - Soporta los 3 roles: admin_general, admin_entity, teacher
exports.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    // Validación básica
    if (!email || !password) {
        throw (0, errorHandler_1.createError)('Email y contraseña son requeridos', 400);
    }
    // Buscar usuario en la base de datos
    const dbUser = await findUserByEmail(email);
    if (!dbUser || !dbUser.is_active) {
        throw (0, errorHandler_1.createError)('Credenciales inválidas', 401);
    }
    // Verificar contraseña
    const isValidPassword = await bcryptjs_1.default.compare(password, dbUser.password_hash);
    if (!isValidPassword) {
        throw (0, errorHandler_1.createError)('Credenciales inválidas', 401);
    }
    // ✅ NUEVA REGLA DE NEGOCIO: 
    // - admin_entity SIEMPRE debe tener entity_id (creado por sistema)
    // - teacher PUEDE ser independiente (auto-generado) o de una entidad
    // Por lo tanto, solo validar admin_entity
    if (dbUser.role === 'admin_entity' && !dbUser.entity_id) {
        throw (0, errorHandler_1.createError)('Error: admin_entity debe tener una entidad asignada', 500);
    }
    // Actualizar último login
    await updateLastLogin(dbUser.id);
    // Convertir formato de BD a formato de respuesta
    const user = {
        id: dbUser.id,
        name: dbUser.full_name,
        email: dbUser.email,
        role: dbUser.role,
        entityId: dbUser.entity_id,
        status: dbUser.is_active ? 'active' : 'inactive',
        createdAt: new Date(dbUser.created_at),
        updatedAt: new Date(dbUser.updated_at),
    };
    // Generar tokens - incluye entityId
    const token = generateToken(dbUser);
    const refreshToken = generateRefreshToken(dbUser);
    // Respuesta exitosa
    const authResponse = {
        user,
        token,
        refreshToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
    };
    const response = {
        success: true,
        data: authResponse,
        message: 'Inicio de sesión exitoso',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// Register - Solo para admin_entity y teacher
exports.register = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, password, role, entityId } = req.body;
    // Validación básica
    if (!name || !email || !password || !role) {
        throw (0, errorHandler_1.createError)('Todos los campos son requeridos', 400);
    }
    // REGLA: Solo admin_entity y teacher pueden auto-registrarse (no admin_general)
    if (role === 'admin_general') {
        throw (0, errorHandler_1.createError)('admin_general debe ser creado por el sistema', 403);
    }
    // Verificar si el usuario ya existe
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        throw (0, errorHandler_1.createError)('El usuario ya existe', 409);
    }
    // REGLA DE NEGOCIO: Generar entity_id para teachers independientes
    let finalEntityId = entityId;
    if (role === 'teacher') {
        if (entityId) {
            // Teacher creado por admin_entity: verificar que la entidad existe
            const entityResult = await (0, connection_1.query)('SELECT id FROM entities WHERE id = $1 AND is_active = true', [entityId]);
            if (entityResult.rows.length === 0) {
                throw (0, errorHandler_1.createError)('La entidad especificada no existe o está inactiva', 404);
            }
            finalEntityId = entityId;
        }
        else {
            // Teacher que se registra solo: usar NULL temporalmente, se genera después
            finalEntityId = null;
        }
    }
    else if (role === 'admin_entity') {
        // admin_entity DEBE tener entityId
        if (!entityId) {
            throw (0, errorHandler_1.createError)('entityId es requerido para admin_entity', 400);
        }
        // Verificar que la entidad existe
        const entityResult = await (0, connection_1.query)('SELECT id FROM entities WHERE id = $1 AND is_active = true', [entityId]);
        if (entityResult.rows.length === 0) {
            throw (0, errorHandler_1.createError)('La entidad especificada no existe o está inactiva', 404);
        }
        finalEntityId = entityId;
    }
    // Crear nuevo usuario en la base de datos
    const dbUser = await createUser({
        name,
        email,
        password,
        role: role,
        entityId: finalEntityId
    });
    // Si es un teacher independiente, dejar entity_id como NULL (se puede crear una entidad después)
    // No asignamos entity_id aquí porque no existe una entidad correspondiente
    // Los teachers independientes pueden operar sin entidad asignada
    if (role === 'teacher' && !entityId) {
        // entity_id permanece NULL - esto es válido en el schema
        dbUser.entity_id = null;
    }
    // Convertir formato de BD a formato de respuesta
    const newUser = {
        id: dbUser.id,
        name: dbUser.full_name,
        email: dbUser.email,
        role: dbUser.role,
        entityId: dbUser.entity_id,
        status: dbUser.is_active ? 'active' : 'inactive',
        createdAt: new Date(dbUser.created_at),
        updatedAt: new Date(dbUser.updated_at),
    };
    // Generar tokens
    const token = generateToken(dbUser);
    const refreshToken = generateRefreshToken(dbUser);
    // Respuesta exitosa
    const authResponse = {
        user: newUser,
        token,
        refreshToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    const response = {
        success: true,
        data: authResponse,
        message: 'Usuario registrado exitosamente',
        timestamp: new Date(),
    };
    res.status(201).json(response);
});
// Logout
exports.logout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // En una implementación real, aquí invalidarías el token en una blacklist
    const response = {
        success: true,
        message: 'Sesión cerrada exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// Refresh Token
exports.refreshToken = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw (0, errorHandler_1.createError)('Refresh token requerido', 400);
    }
    try {
        // Verificar refresh token
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
        // Buscar usuario en la base de datos
        const dbUser = await findUserById(decoded.userId);
        if (!dbUser || !dbUser.is_active) {
            throw (0, errorHandler_1.createError)('Usuario no encontrado', 404);
        }
        // Convertir formato de BD a formato de respuesta
        const user = {
            id: dbUser.id,
            name: dbUser.full_name,
            email: dbUser.email,
            role: dbUser.role,
            entityId: dbUser.entity_id,
            status: dbUser.is_active ? 'active' : 'inactive',
            createdAt: new Date(dbUser.created_at),
            updatedAt: new Date(dbUser.updated_at),
        };
        // Generar nuevos tokens
        const newToken = generateToken(dbUser);
        const newRefreshToken = generateRefreshToken(dbUser);
        // Respuesta exitosa
        const authResponse = {
            user,
            token: newToken,
            refreshToken: newRefreshToken,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
        const response = {
            success: true,
            data: authResponse,
            message: 'Token renovado exitosamente',
            timestamp: new Date(),
        };
        res.status(200).json(response);
    }
    catch (error) {
        throw (0, errorHandler_1.createError)('Refresh token inválido', 401);
    }
});
// Get Current User
exports.getCurrentUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw (0, errorHandler_1.createError)('Usuario no autenticado', 401);
    }
    // Buscar usuario completo en la base de datos
    const dbUser = await findUserById(req.user.id);
    if (!dbUser || !dbUser.is_active) {
        throw (0, errorHandler_1.createError)('Usuario no encontrado', 404);
    }
    // Convertir formato de BD a formato de respuesta
    const user = {
        id: dbUser.id,
        name: dbUser.full_name,
        email: dbUser.email,
        role: dbUser.role,
        entityId: dbUser.entity_id,
        status: dbUser.is_active ? 'active' : 'inactive',
        createdAt: new Date(dbUser.created_at),
        updatedAt: new Date(dbUser.updated_at),
    };
    const response = {
        success: true,
        data: user,
        message: 'Usuario obtenido exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
//# sourceMappingURL=auth.controller.js.map