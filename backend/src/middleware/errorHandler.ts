// ===============================
// MIDDLEWARE DE MANEJO DE ERRORES
// ===============================

import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../../shared/types';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

  if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = 409;
    message = 'El recurso ya existe';
  }

  // Respuesta de error
  const errorResponse: ApiResponse = {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    timestamp: new Date(),
  };

  res.status(statusCode).json(errorResponse);
};

// Función para crear errores personalizados
export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

// Wrapper para manejar errores async
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};