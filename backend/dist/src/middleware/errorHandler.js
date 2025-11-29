"use strict";
// ===============================
// MIDDLEWARE DE MANEJO DE ERRORES
// ===============================
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.createError = exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    console.error('Error Stack:', error.stack);
    // Error por defecto
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Error interno del servidor';
    // Manejar errores específicos
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Datos de entrada inválidos';
    }
    if (error.name === 'CastError') {
        statusCode = 400;
        message = 'ID inválido';
    }
    if (error.name === 'MongoError' && error.code === 11000) {
        statusCode = 409;
        message = 'El recurso ya existe';
    }
    // Respuesta de error
    const errorResponse = {
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        timestamp: new Date(),
    };
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
// Función para crear errores personalizados
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
// Wrapper para manejar errores async
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map