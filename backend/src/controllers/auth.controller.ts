// ===============================
// CONTROLADOR DE AUTENTICACIÓN
// ===============================

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthCredentials, AuthResponse, RegisterData, User, ApiResponse } from '../../../shared/types';

// Mock de usuarios para desarrollo (reemplazar con base de datos)
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Prof. María González',
    email: 'maria.gonzalez@asisVox.com',
    role: 'teacher',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Admin Principal',
    email: 'admin@asisVox.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
];

// Contraseñas hasheadas mock (en producción usar bcrypt)
const mockPasswords: { [email: string]: string } = {
  'maria.gonzalez@asisVox.com': '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewOvgOcJ94VK6T5W', // password: teacher123
  'admin@asisVox.com': '$2a$12$7Z1v3Qr5BwVHxkd0LHAkCOYz6TtxMQJqhN8/lewOvgOcJ94VK6T5W', // password: admin123
};

// Generar JWT token
const generateToken = (user: User): string => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    }
  );
};

// Generar refresh token
const generateRefreshToken = (user: User): string => {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    }
  );
};

// ===============================
// CONTROLADORES
// ===============================

// Login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: AuthCredentials = req.body;

  // Validación básica
  if (!email || !password) {
    throw createError('Email y contraseña son requeridos', 400);
  }

  // Buscar usuario
  const user = mockUsers.find(u => u.email === email && u.status === 'active');
  
  if (!user) {
    throw createError('Credenciales inválidas', 401);
  }

  // Verificar contraseña
  const storedPassword = mockPasswords[email];
  if (!storedPassword) {
    throw createError('Credenciales inválidas', 401);
  }

  const isValidPassword = await bcrypt.compare(password, storedPassword);
  if (!isValidPassword) {
    throw createError('Credenciales inválidas', 401);
  }

  // Generar tokens
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  // Respuesta exitosa
  const authResponse: AuthResponse = {
    user,
    token,
    refreshToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
  };

  const response: ApiResponse<AuthResponse> = {
    success: true,
    data: authResponse,
    message: 'Inicio de sesión exitoso',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// Register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, subjects }: RegisterData = req.body;

  // Validación básica
  if (!name || !email || !password || !role) {
    throw createError('Todos los campos son requeridos', 400);
  }

  // Verificar si el usuario ya existe
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    throw createError('El usuario ya existe', 409);
  }

  // Crear nuevo usuario
  const newUser: User = {
    id: (mockUsers.length + 1).toString(),
    name,
    email,
    role,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Hashear contraseña
  const hashedPassword = await bcrypt.hash(password, 12);
  mockPasswords[email] = hashedPassword;

  // Agregar a la lista mock
  mockUsers.push(newUser);

  // Generar tokens
  const token = generateToken(newUser);
  const refreshToken = generateRefreshToken(newUser);

  // Respuesta exitosa
  const authResponse: AuthResponse = {
    user: newUser,
    token,
    refreshToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };

  const response: ApiResponse<AuthResponse> = {
    success: true,
    data: authResponse,
    message: 'Usuario registrado exitosamente',
    timestamp: new Date(),
  };

  res.status(201).json(response);
});

// Logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // En una implementación real, aquí invalidarías el token en una blacklist
  
  const response: ApiResponse<void> = {
    success: true,
    message: 'Sesión cerrada exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// Refresh Token
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createError('Refresh token requerido', 400);
  }

  try {
    // Verificar refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
    ) as any;

    // Buscar usuario
    const user = mockUsers.find(u => u.id === decoded.userId && u.status === 'active');
    if (!user) {
      throw createError('Usuario no encontrado', 404);
    }

    // Generar nuevos tokens
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Respuesta exitosa
    const authResponse: AuthResponse = {
      user,
      token: newToken,
      refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: authResponse,
      message: 'Token renovado exitosamente',
      timestamp: new Date(),
    };

    res.status(200).json(response);
  } catch (error) {
    throw createError('Refresh token inválido', 401);
  }
});

// Get Current User
export const getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  // Buscar usuario completo
  const user = mockUsers.find(u => u.id === req.user!.id && u.status === 'active');
  if (!user) {
    throw createError('Usuario no encontrado', 404);
  }

  const response: ApiResponse<User> = {
    success: true,
    data: user,
    message: 'Usuario obtenido exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});