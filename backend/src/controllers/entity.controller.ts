// ===============================
// CONTROLADOR DE ENTIDADES
// ===============================

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { Entity, ApiResponse, PaginatedResponse } from '../../../shared/types';
import { query } from '../config/connection';

// ===============================
// FUNCIONES DE BASE DE DATOS
// ===============================

// Buscar entidad por ID
const findEntityById = async (entityId: string) => {
  const result = await query(
    `SELECT id, name, code, address, image_url, representative_name, 
            representative_phone, representative_email, institutional_phone,
            institutional_address, institutional_email, is_active, 
            created_at, updated_at
     FROM entities WHERE id = $1`,
    [entityId]
  );
  return result.rows[0];
};

// Convertir entidad BD a formato respuesta
const mapEntityToResponse = (dbEntity: any): Entity => {
  return {
    id: dbEntity.id,
    name: dbEntity.name,
    code: dbEntity.code,
    address: dbEntity.address,
    imageUrl: dbEntity.image_url,
    representativeName: dbEntity.representative_name,
    representativePhone: dbEntity.representative_phone,
    representativeEmail: dbEntity.representative_email,
    institutionalPhone: dbEntity.institutional_phone,
    institutionalAddress: dbEntity.institutional_address,
    institutionalEmail: dbEntity.institutional_email,
    isActive: dbEntity.is_active,
    createdAt: new Date(dbEntity.created_at),
    updatedAt: new Date(dbEntity.updated_at),
  };
};

// ===============================
// CONTROLADORES
// ===============================

// GET - Listar entidades (solo admin_general)
export const getEntities = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // REGLA: Solo admin_general puede ver todas las entidades
  if (req.user?.role !== 'admin_general') {
    throw createError('Solo admin_general puede ver las entidades', 403);
  }

  const { page = 1, limit = 10, isActive = 'true', search } = req.query;

  let whereClause = 'WHERE is_active = $1';
  const params: any[] = [isActive === 'true'];
  let paramIndex = 2;

  // Filtro de búsqueda
  if (search) {
    whereClause += ` AND (name ILIKE $${paramIndex} OR code ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Query para contar total
  const countQuery = `SELECT COUNT(id) as total FROM entities ${whereClause}`;
  const countResult = await query(countQuery, params.slice(0, paramIndex - 1));
  const total = parseInt(countResult.rows[0].total);

  // Query principal con paginación
  const entitiesQuery = `
    SELECT id, name, code, address, image_url, representative_name, 
           representative_phone, representative_email, institutional_phone,
           institutional_address, institutional_email, is_active, 
           created_at, updated_at
    FROM entities
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
  params.push(parseInt(limit as string), offset);

  const entitiesResult = await query(entitiesQuery, params);
  const entities = entitiesResult.rows.map(mapEntityToResponse);

  const response: PaginatedResponse<Entity> = {
    success: true,
    data: entities,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      totalPages: Math.ceil(total / parseInt(limit as string)),
    },
    message: 'Entidades obtenidas exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// GET - Obtener entidad por ID (solo admin_general)
export const getEntityById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // REGLA: Solo admin_general puede ver entidades
  if (req.user?.role !== 'admin_general') {
    throw createError('Solo admin_general puede ver las entidades', 403);
  }

  const { id } = req.params;

  const entity = await findEntityById(id);
  if (!entity) {
    throw createError('Entidad no encontrada', 404);
  }

  const entityData = mapEntityToResponse(entity);

  const response: ApiResponse<Entity> = {
    success: true,
    data: entityData,
    message: 'Entidad obtenida exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// POST - Crear entidad (solo admin_general)
export const createEntity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // REGLA: Solo admin_general puede crear entidades
  if (req.user?.role !== 'admin_general') {
    throw createError('Solo admin_general puede crear entidades', 403);
  }

  const {
    name,
    code,
    address,
    imageUrl,
    representativeName,
    representativePhone,
    representativeEmail,
    institutionalPhone,
    institutionalAddress,
    institutionalEmail,
  } = req.body;

  // Validaciones básicas
  if (!name || !code) {
    throw createError('name y code son requeridos', 400);
  }

  // Validar que el código sea único
  const existingEntity = await query(
    'SELECT id FROM entities WHERE code = $1',
    [code]
  );

  if (existingEntity.rows.length > 0) {
    throw createError('Ya existe una entidad con este código', 409);
  }

  try {
    const createResult = await query(
      `INSERT INTO entities (
        name, code, address, image_url, 
        representative_name, representative_phone, representative_email,
        institutional_phone, institutional_address, institutional_email,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
       RETURNING id, name, code, address, image_url, representative_name, 
                 representative_phone, representative_email, institutional_phone,
                 institutional_address, institutional_email, is_active, 
                 created_at, updated_at`,
      [
        name,
        code,
        address || null,
        imageUrl || null,
        representativeName || null,
        representativePhone || null,
        representativeEmail || null,
        institutionalPhone || null,
        institutionalAddress || null,
        institutionalEmail || null,
      ]
    );

    const newEntity = createResult.rows[0];
    const entityData = mapEntityToResponse(newEntity);

    const response: ApiResponse<Entity> = {
      success: true,
      data: entityData,
      message: 'Entidad creada exitosamente',
      timestamp: new Date(),
    };

    res.status(201).json(response);
  } catch (error: any) {
    if (error.code === '23505') {
      throw createError('Ya existe una entidad con este código', 409);
    }
    throw error;
  }
});

// PUT - Actualizar entidad (solo admin_general)
export const updateEntity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // REGLA: Solo admin_general puede actualizar entidades
  if (req.user?.role !== 'admin_general') {
    throw createError('Solo admin_general puede actualizar entidades', 403);
  }

  const { id } = req.params;
  const {
    name,
    code,
    address,
    imageUrl,
    representativeName,
    representativePhone,
    representativeEmail,
    institutionalPhone,
    institutionalAddress,
    institutionalEmail,
    isActive,
  } = req.body;

  const entity = await findEntityById(id);
  if (!entity) {
    throw createError('Entidad no encontrada', 404);
  }

  // Construir UPDATE dinámico
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramCount}`);
    values.push(name);
    paramCount++;
  }

  if (code !== undefined) {
    updates.push(`code = $${paramCount}`);
    values.push(code);
    paramCount++;
  }

  if (address !== undefined) {
    updates.push(`address = $${paramCount}`);
    values.push(address || null);
    paramCount++;
  }

  if (imageUrl !== undefined) {
    updates.push(`image_url = $${paramCount}`);
    values.push(imageUrl || null);
    paramCount++;
  }

  if (representativeName !== undefined) {
    updates.push(`representative_name = $${paramCount}`);
    values.push(representativeName || null);
    paramCount++;
  }

  if (representativePhone !== undefined) {
    updates.push(`representative_phone = $${paramCount}`);
    values.push(representativePhone || null);
    paramCount++;
  }

  if (representativeEmail !== undefined) {
    updates.push(`representative_email = $${paramCount}`);
    values.push(representativeEmail || null);
    paramCount++;
  }

  if (institutionalPhone !== undefined) {
    updates.push(`institutional_phone = $${paramCount}`);
    values.push(institutionalPhone || null);
    paramCount++;
  }

  if (institutionalAddress !== undefined) {
    updates.push(`institutional_address = $${paramCount}`);
    values.push(institutionalAddress || null);
    paramCount++;
  }

  if (institutionalEmail !== undefined) {
    updates.push(`institutional_email = $${paramCount}`);
    values.push(institutionalEmail || null);
    paramCount++;
  }

  if (isActive !== undefined) {
    updates.push(`is_active = $${paramCount}`);
    values.push(isActive);
    paramCount++;
  }

  if (updates.length === 0) {
    throw createError('No hay campos para actualizar', 400);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const updateResult = await query(
    `UPDATE entities 
     SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING id, name, code, address, image_url, representative_name, 
               representative_phone, representative_email, institutional_phone,
               institutional_address, institutional_email, is_active, 
               created_at, updated_at`,
    values
  );

  const updatedEntity = mapEntityToResponse(updateResult.rows[0]);

  const response: ApiResponse<Entity> = {
    success: true,
    data: updatedEntity,
    message: 'Entidad actualizada exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// DELETE - Eliminar entidad (solo admin_general)
export const deleteEntity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // REGLA: Solo admin_general puede eliminar entidades
  if (req.user?.role !== 'admin_general') {
    throw createError('Solo admin_general puede eliminar entidades', 403);
  }

  const { id } = req.params;

  const entity = await findEntityById(id);
  if (!entity) {
    throw createError('Entidad no encontrada', 404);
  }

  // REGLA: Verificar que no hay usuarios asociados a esta entidad
  const usersResult = await query(
    'SELECT COUNT(id) as count FROM users WHERE entity_id = $1',
    [id]
  );

  const usersCount = parseInt(usersResult.rows[0].count);
  if (usersCount > 0) {
    throw createError(`No se puede eliminar la entidad: tiene ${usersCount} usuarios asociados`, 409);
  }

  await query('DELETE FROM entities WHERE id = $1', [id]);

  const response: ApiResponse<void> = {
    success: true,
    message: 'Entidad eliminada exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// POST - Activar entidad (solo admin_general)
export const activateEntity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // REGLA: Solo admin_general puede activar entidades
  if (req.user?.role !== 'admin_general') {
    throw createError('Solo admin_general puede activar entidades', 403);
  }

  const { id } = req.params;

  const entity = await findEntityById(id);
  if (!entity) {
    throw createError('Entidad no encontrada', 404);
  }

  const updateResult = await query(
    `UPDATE entities SET is_active = true, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1
     RETURNING id, name, code, address, image_url, representative_name, 
               representative_phone, representative_email, institutional_phone,
               institutional_address, institutional_email, is_active, 
               created_at, updated_at`,
    [id]
  );

  const updatedEntity = mapEntityToResponse(updateResult.rows[0]);

  const response: ApiResponse<Entity> = {
    success: true,
    data: updatedEntity,
    message: 'Entidad activada exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// POST - Desactivar entidad (solo admin_general)
export const deactivateEntity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // REGLA: Solo admin_general puede desactivar entidades
  if (req.user?.role !== 'admin_general') {
    throw createError('Solo admin_general puede desactivar entidades', 403);
  }

  const { id } = req.params;

  const entity = await findEntityById(id);
  if (!entity) {
    throw createError('Entidad no encontrada', 404);
  }

  const updateResult = await query(
    `UPDATE entities SET is_active = false, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1
     RETURNING id, name, code, address, image_url, representative_name, 
               representative_phone, representative_email, institutional_phone,
               institutional_address, institutional_email, is_active, 
               created_at, updated_at`,
    [id]
  );

  const updatedEntity = mapEntityToResponse(updateResult.rows[0]);

  const response: ApiResponse<Entity> = {
    success: true,
    data: updatedEntity,
    message: 'Entidad desactivada exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// GET - Obtener estadísticas de una entidad (solo admin_general)
export const getEntityStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // REGLA: Solo admin_general puede ver estadísticas
  if (req.user?.role !== 'admin_general') {
    throw createError('Solo admin_general puede ver las estadísticas', 403);
  }

  const { id } = req.params;

  const entity = await findEntityById(id);
  if (!entity) {
    throw createError('Entidad no encontrada', 404);
  }

  // Contar usuarios por rol
  const usersStatsResult = await query(
    `SELECT role, COUNT(id) as count 
     FROM users 
     WHERE entity_id = $1 
     GROUP BY role`,
    [id]
  );

  // Contar clases
  const classesResult = await query(
    `SELECT COUNT(DISTINCT c.id) as count 
     FROM classes c
     WHERE c.entity_id = $1`,
    [id]
  );

  // Contar estudiantes por entidad
  const studentsResult = await query(
    `SELECT COUNT(DISTINCT s.id) as count
     FROM students s
     JOIN enrollments e ON s.id = e.student_id
     JOIN sections sec ON e.section_id = sec.id
     JOIN grades g ON sec.grade_id = g.id
     -- Aquí necesitarías tener una relación entre estudiantes y entidades
     -- Por ahora, contaremos todos los estudiantes inscritos
     WHERE e.status = 'active'`,
    []
  );

  // Estadísticas de calificaciones
  const gradesStatsResult = await query(
    `SELECT AVG(gr.score) as average_grade, 
            MAX(gr.score) as max_grade, 
            MIN(gr.score) as min_grade
     FROM grades_records gr
     JOIN enrollments e ON gr.student_id = e.student_id
     WHERE e.status = 'active'`,
    []
  );

  const usersByRole: Record<string, number> = {};
  usersStatsResult.rows.forEach((row: any) => {
    usersByRole[row.role] = parseInt(row.count);
  });

  const stats = {
    entityId: id,
    totalAdmins: (usersByRole['admin_entity'] || 0),
    totalTeachers: (usersByRole['teacher'] || 0),
    totalClasses: parseInt(classesResult.rows[0]?.count || 0),
    totalStudents: parseInt(studentsResult.rows[0]?.count || 0),
    averageGrade: parseFloat(gradesStatsResult.rows[0]?.average_grade || 0),
    maxGrade: parseFloat(gradesStatsResult.rows[0]?.max_grade || 0),
    minGrade: parseFloat(gradesStatsResult.rows[0]?.min_grade || 0),
  };

  const response: ApiResponse<any> = {
    success: true,
    data: stats,
    message: 'Estadísticas de la entidad obtenidas exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});
