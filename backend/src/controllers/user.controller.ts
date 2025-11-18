// ===============================
// CONTROLADOR DE USUARIOS
// ===============================

import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { User, ApiResponse, PaginatedResponse } from '../../../shared/types';
import { query } from '../config/connection';

// ===============================
// FUNCIONES DE BASE DE DATOS
// ===============================

// Buscar usuario por ID con entidad
const findUserWithEntity = async (userId: string) => {
  const result = await query(
    `SELECT u.id, u.email, u.full_name, u.role, u.entity_id, u.max_teachers_allowed, 
            u.phone, u.photo_url, u.is_active, u.created_at, u.updated_at,
            e.name as entity_name
     FROM users u
     LEFT JOIN entities e ON u.entity_id = e.id
     WHERE u.id = $1`,
    [userId]
  );
  return result.rows[0];
};

// Contar profesores creados por un admin_entity
const countTeachersByAdminEntity = async (adminEntityId: string): Promise<number> => {
  const result = await query(
    `SELECT COUNT(*) FROM users 
     WHERE role = 'teacher' 
     AND entity_id = (SELECT entity_id FROM users WHERE id = $1)`,
    [adminEntityId]
  );
  return parseInt(result.rows[0].count, 10);
};

// Convertir usuario BD a formato respuesta
const mapUserToResponse = (dbUser: any): User => {
  return {
    id: dbUser.id,
    name: dbUser.full_name,
    email: dbUser.email,
    role: dbUser.role as 'admin_general' | 'admin_entity' | 'teacher',
    entityId: dbUser.entity_id,
    status: dbUser.is_active ? 'active' : 'inactive',
    createdAt: new Date(dbUser.created_at),
    updatedAt: new Date(dbUser.updated_at),
  };
};

// ===============================
// CONTROLADORES
// ===============================

// GET - Listar usuarios con filtros
export const getUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { role, entityId, status, search, page = 1, limit = 10 } = req.query;

  // REGLA: admin_general ve todos, admin_entity solo ve su entidad
  let query_str = `SELECT u.id, u.email, u.full_name, u.role, u.entity_id, u.max_teachers_allowed,
                          u.phone, u.photo_url, u.is_active, u.created_at, u.updated_at
                   FROM users u
                   WHERE 1=1`;
  const params: any[] = [];
  let paramCount = 1;

  // Si es admin_entity, filtrar por su entidad
  if (req.user?.role === 'admin_entity') {
    query_str += ` AND u.entity_id = $${paramCount}`;
    params.push(req.user.entityId);
    paramCount++;
  }

  // Filtro por role
  if (role && role !== '') {
    query_str += ` AND u.role = $${paramCount}`;
    params.push(role);
    paramCount++;
  }

  // Filtro por entity_id
  if (entityId && entityId !== '' && req.user?.role === 'admin_general') {
    query_str += ` AND u.entity_id = $${paramCount}`;
    params.push(entityId);
    paramCount++;
  }

  // Filtro por status
  if (status && status !== '') {
    const is_active = status === 'active';
    query_str += ` AND u.is_active = $${paramCount}`;
    params.push(is_active);
    paramCount++;
  }

  // Filtro por búsqueda (email o nombre)
  if (search && search !== '') {
    query_str += ` AND (u.email ILIKE $${paramCount} OR u.full_name ILIKE $${paramCount})`;
    params.push(`%${search}%`);
    paramCount++;
  }

  // Contar total
  const countResult = await query(`SELECT COUNT(*) FROM (${query_str}) as counted`, params);
  const total = parseInt(countResult.rows[0].count, 10);

  // Paginación
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
  query_str += ` ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await query(query_str, params);
  const users = result.rows.map(mapUserToResponse);

  const response: PaginatedResponse<User> = {
    success: true,
    data: users,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      totalPages: Math.ceil(total / parseInt(limit as string)),
    },
    message: 'Usuarios obtenidos exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// GET - Obtener usuario por ID
export const getUserById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const dbUser = await findUserWithEntity(id);
  if (!dbUser) {
    throw createError('Usuario no encontrado', 404);
  }

  // REGLA: admin_entity solo puede ver usuarios de su entidad
  if (req.user?.role === 'admin_entity' && dbUser.entity_id !== req.user.entityId) {
    throw createError('No tienes permisos para ver este usuario', 403);
  }

  const user = mapUserToResponse(dbUser);

  const response: ApiResponse<User> = {
    success: true,
    data: user,
    message: 'Usuario obtenido exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// PUT - Actualizar max_teachers_allowed (SOLO admin_general)
export const updateMaxTeachersAllowed = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { maxTeachersAllowed } = req.body;

  // REGLA: Solo admin_general puede hacer esto
  if (req.user?.role !== 'admin_general') {
    throw createError('Solo admin_general puede actualizar max_teachers_allowed', 403);
  }

  // Validación
  if (maxTeachersAllowed === undefined || maxTeachersAllowed === null) {
    throw createError('maxTeachersAllowed es requerido', 400);
  }

  if (typeof maxTeachersAllowed !== 'number' || maxTeachersAllowed < 0) {
    throw createError('maxTeachersAllowed debe ser un número mayor o igual a 0', 400);
  }

  // Buscar usuario
  const dbUser = await findUserWithEntity(id);
  if (!dbUser) {
    throw createError('Usuario no encontrado', 404);
  }

  // REGLA: Solo se puede actualizar admin_entity
  if (dbUser.role !== 'admin_entity') {
    throw createError('Solo se puede actualizar max_teachers_allowed de admin_entity', 400);
  }

  // Actualizar
  const updateResult = await query(
    `UPDATE users 
     SET max_teachers_allowed = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, email, full_name, role, entity_id, max_teachers_allowed, 
               phone, photo_url, is_active, created_at, updated_at`,
    [maxTeachersAllowed, id]
  );

  if (updateResult.rows.length === 0) {
    throw createError('Error al actualizar usuario', 500);
  }

  const updatedUser = mapUserToResponse(updateResult.rows[0]);

  const response: ApiResponse<User> = {
    success: true,
    data: updatedUser,
    message: `max_teachers_allowed actualizado a ${maxTeachersAllowed}`,
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// PUT - Actualizar usuario
export const updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { email, fullName, phone } = req.body;

  // REGLA: admin_entity solo puede actualizar usuarios de su entidad
  if (req.user?.role === 'admin_entity') {
    const dbUser = await findUserWithEntity(id);
    if (!dbUser || dbUser.entity_id !== req.user.entityId) {
      throw createError('No tienes permisos para actualizar este usuario', 403);
    }
  }

  // Buscar usuario
  const dbUser = await findUserWithEntity(id);
  if (!dbUser) {
    throw createError('Usuario no encontrado', 404);
  }

  // Validaciones
  if (email && email !== dbUser.email) {
    const emailExists = await query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
    if (emailExists.rows.length > 0) {
      throw createError('El email ya está en uso', 409);
    }
  }

  // Construir UPDATE dinámico
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (email) {
    updates.push(`email = $${paramCount}`);
    values.push(email);
    paramCount++;
  }
  if (fullName) {
    updates.push(`full_name = $${paramCount}`);
    values.push(fullName);
    paramCount++;
  }
  if (phone) {
    updates.push(`phone = $${paramCount}`);
    values.push(phone);
    paramCount++;
  }

  if (updates.length === 0) {
    throw createError('No hay campos para actualizar', 400);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const updateResult = await query(
    `UPDATE users 
     SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING id, email, full_name, role, entity_id, max_teachers_allowed,
               phone, photo_url, is_active, created_at, updated_at`,
    values
  );

  if (updateResult.rows.length === 0) {
    throw createError('Error al actualizar usuario', 500);
  }

  const updatedUser = mapUserToResponse(updateResult.rows[0]);

  const response: ApiResponse<User> = {
    success: true,
    data: updatedUser,
    message: 'Usuario actualizado exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// PUT - Activar usuario
export const activateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // REGLA: Solo admin_general puede activar/desactivar
  if (req.user?.role !== 'admin_general') {
    throw createError('Solo admin_general puede activar usuarios', 403);
  }

  const dbUser = await findUserWithEntity(id);
  if (!dbUser) {
    throw createError('Usuario no encontrado', 404);
  }

  const result = await query(
    `UPDATE users 
     SET is_active = true, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, email, full_name, role, entity_id, max_teachers_allowed,
               phone, photo_url, is_active, created_at, updated_at`,
    [id]
  );

  const updatedUser = mapUserToResponse(result.rows[0]);

  const response: ApiResponse<User> = {
    success: true,
    data: updatedUser,
    message: 'Usuario activado exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// PUT - Desactivar usuario
export const deactivateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // REGLA: Solo admin_general puede activar/desactivar
  if (req.user?.role !== 'admin_general') {
    throw createError('Solo admin_general puede desactivar usuarios', 403);
  }

  const dbUser = await findUserWithEntity(id);
  if (!dbUser) {
    throw createError('Usuario no encontrado', 404);
  }

  const result = await query(
    `UPDATE users 
     SET is_active = false, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, email, full_name, role, entity_id, max_teachers_allowed,
               phone, photo_url, is_active, created_at, updated_at`,
    [id]
  );

  const updatedUser = mapUserToResponse(result.rows[0]);

  const response: ApiResponse<User> = {
    success: true,
    data: updatedUser,
    message: 'Usuario desactivado exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// DELETE - Eliminar usuario (SOLO admin_general)
export const deleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // REGLA: Solo admin_general puede eliminar
  if (req.user?.role !== 'admin_general') {
    throw createError('Solo admin_general puede eliminar usuarios', 403);
  }

  // No permitir eliminar a admin_general
  const dbUser = await findUserWithEntity(id);
  if (!dbUser) {
    throw createError('Usuario no encontrado', 404);
  }

  if (dbUser.role === 'admin_general') {
    throw createError('No se puede eliminar un admin_general', 400);
  }

  // Eliminar usuario
  const result = await query('DELETE FROM users WHERE id = $1', [id]);

  const response: ApiResponse<void> = {
    success: true,
    message: 'Usuario eliminado exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});
