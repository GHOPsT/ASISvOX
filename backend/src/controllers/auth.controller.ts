// ===============================
// CONTROLADOR DE AUTENTICACIÓN
// ===============================

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthCredentials, AuthResponse, RegisterData, User, ApiResponse } from '../../../shared/types';
import { query } from '../config/connection';

// ===============================
// FUNCIONES DE BASE DE DATOS
// ===============================

// Buscar usuario por email
const findUserByEmail = async (email: string) => {
  const result = await query(
    'SELECT id, email, password_hash, full_name, role, phone, photo_url, is_active, created_at, updated_at, last_login FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

// Crear nuevo usuario
const createUser = async (userData: RegisterData) => {
  const { name, email, password, role } = userData;
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const result = await query(
    `INSERT INTO users (email, password_hash, full_name, role) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, email, full_name, role, phone, photo_url, is_active, created_at, updated_at`,
    [email, hashedPassword, name, role]
  );
  
  return result.rows[0];
};

// Actualizar último login
const updateLastLogin = async (userId: string) => {
  await query(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [userId]
  );
};

// Buscar usuario por ID
const findUserById = async (userId: string) => {
  const result = await query(
    'SELECT id, email, password_hash, full_name, role, phone, photo_url, is_active, created_at, updated_at, last_login FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0];
};

// Generar JWT token
const generateToken = (user: User): string => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, secret, { expiresIn: '24h' });
};

// Generar refresh token
const generateRefreshToken = (user: User): string => {
  const secret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  return jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' });
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

  // Buscar usuario en la base de datos
  const dbUser = await findUserByEmail(email);
  
  if (!dbUser || !dbUser.is_active) {
    throw createError('Credenciales inválidas', 401);
  }

  // Verificar contraseña
  const isValidPassword = await bcrypt.compare(password, dbUser.password_hash);
  if (!isValidPassword) {
    throw createError('Credenciales inválidas', 401);
  }

  // Actualizar último login
  await updateLastLogin(dbUser.id);

  // Convertir formato de BD a formato de respuesta
  const user: User = {
    id: dbUser.id,
    name: dbUser.full_name,
    email: dbUser.email,
    role: dbUser.role,
    status: dbUser.is_active ? 'active' : 'inactive',
    createdAt: new Date(dbUser.created_at),
    updatedAt: new Date(dbUser.updated_at),
  };

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
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw createError('El usuario ya existe', 409);
  }

  // Crear nuevo usuario en la base de datos
  const dbUser = await createUser({ name, email, password, role, subjects });

  // Convertir formato de BD a formato de respuesta
  const newUser: User = {
    id: dbUser.id,
    name: dbUser.full_name,
    email: dbUser.email,
    role: dbUser.role,
    status: dbUser.is_active ? 'active' : 'inactive',
    createdAt: new Date(dbUser.created_at),
    updatedAt: new Date(dbUser.updated_at),
  };

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

    // Buscar usuario en la base de datos
    const dbUser = await findUserById(decoded.userId);
    if (!dbUser || !dbUser.is_active) {
      throw createError('Usuario no encontrado', 404);
    }

    // Convertir formato de BD a formato de respuesta
    const user: User = {
      id: dbUser.id,
      name: dbUser.full_name,
      email: dbUser.email,
      role: dbUser.role,
      status: dbUser.is_active ? 'active' : 'inactive',
      createdAt: new Date(dbUser.created_at),
      updatedAt: new Date(dbUser.updated_at),
    };

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

  // Buscar usuario completo en la base de datos
  const dbUser = await findUserById(req.user!.id);
  if (!dbUser || !dbUser.is_active) {
    throw createError('Usuario no encontrado', 404);
  }

  // Convertir formato de BD a formato de respuesta
  const user: User = {
    id: dbUser.id,
    name: dbUser.full_name,
    email: dbUser.email,
    role: dbUser.role,
    status: dbUser.is_active ? 'active' : 'inactive',
    createdAt: new Date(dbUser.created_at),
    updatedAt: new Date(dbUser.updated_at),
  };

  const response: ApiResponse<User> = {
    success: true,
    data: user,
    message: 'Usuario obtenido exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});