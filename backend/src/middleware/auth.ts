// ===============================
// MIDDLEWARE DE AUTENTICACIÓN
// ===============================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../../../shared/types';

// Extender Request para incluir user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'admin_general' | 'admin_entity' | 'teacher' | 'student';
    email: string;
    entityId?: string;
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        timestamp: new Date(),
      } as ApiResponse);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no válido',
        timestamp: new Date(),
      } as ApiResponse);
    }

    // Verificar el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    // Agregar información del usuario al request
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      email: decoded.email,
      entityId: decoded.entityId,
    };

    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        timestamp: new Date(),
      } as ApiResponse);
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
        timestamp: new Date(),
      } as ApiResponse);
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      timestamp: new Date(),
    } as ApiResponse);
  }
};

// Middleware para verificar roles específicos
export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        timestamp: new Date(),
      } as ApiResponse);
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso',
        timestamp: new Date(),
      } as ApiResponse);
    }

    return next();
  };
};

// Middleware específicos por rol
export const requireAdminGeneral = requireRole(['admin_general']);
export const requireAdminEntity = requireRole(['admin_entity']);
export const requireAdmin = requireRole(['admin_general', 'admin_entity']);
export const requireTeacher = requireRole(['teacher']);
export const requireTeacherOrAdmin = requireRole(['teacher', 'admin_general', 'admin_entity']);