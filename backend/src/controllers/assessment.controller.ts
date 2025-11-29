// ===============================
// CONTROLADOR DE EVALUACIONES
// ===============================

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { ApiResponse, PaginatedResponse } from '../../../shared/types';
import { query } from '../config/connection';

// ===============================
// ASSESSMENTS
// ===============================

// GET - Listar evaluaciones
export const getAssessments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { class_id, type_id, page = 1, limit = 20 } = req.query;

  if (!class_id) {
    throw createError('class_id es requerido', 400);
  }

  // Validar que el usuario puede acceder a esta clase
  const classCheck = await query(
    `SELECT entity_id, teacher_id FROM classes WHERE id = $1`,
    [class_id]
  );

  if (classCheck.rows.length === 0) {
    throw createError('Clase no encontrada', 404);
  }

  const classData = classCheck.rows[0];

  // REGLA: admin_entity solo ve su entidad, teacher solo sus clases
  if (req.user?.role === 'admin_entity' && classData.entity_id !== req.user.entityId) {
    throw createError('No tienes permiso para acceder a esta clase', 403);
  }
  if (req.user?.role === 'teacher' && classData.teacher_id !== req.user.id) {
    throw createError('No tienes permiso para acceder a esta clase', 403);
  }

  let whereClause = 'WHERE a.class_id = $1';
  const params: any[] = [class_id];
  let paramIndex = 2;

  if (type_id) {
    whereClause += ` AND a.assessment_type_id = $${paramIndex}`;
    params.push(type_id);
    paramIndex++;
  }

  const countResult = await query(
    `SELECT COUNT(*) as total FROM assessments a ${whereClause}`,
    params
  );

  const total = parseInt(countResult.rows[0].total);
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  const assessmentsResult = await query(
    `SELECT a.id, a.class_id, a.assessment_type_id, a.name, a.description, 
            a.date, a.due_date, a.max_score, a.weight, a.is_published, a.created_at, a.updated_at,
            at.name as type_name
     FROM assessments a
     LEFT JOIN assessment_types at ON a.assessment_type_id = at.id
     ${whereClause}
     ORDER BY a.due_date DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, parseInt(limit as string), offset]
  );

  const response: PaginatedResponse<any> = {
    success: true,
    data: assessmentsResult.rows,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      totalPages: Math.ceil(total / parseInt(limit as string)),
    },
    message: 'Evaluaciones obtenidas exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// GET - Obtener detalles de una evaluación
export const getAssessment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { assessmentId } = req.params;

  const assessmentResult = await query(
    `SELECT a.*, at.name as type_name, c.teacher_id, c.entity_id
     FROM assessments a
     LEFT JOIN assessment_types at ON a.assessment_type_id = at.id
     JOIN classes c ON a.class_id = c.id
     WHERE a.id = $1`,
    [assessmentId]
  );

  if (assessmentResult.rows.length === 0) {
    throw createError('Evaluación no encontrada', 404);
  }

  const assessment = assessmentResult.rows[0];

  // Validar permisos
  if (req.user?.role === 'admin_entity' && assessment.entity_id !== req.user.entityId) {
    throw createError('No tienes permiso para acceder a esta evaluación', 403);
  }
  if (req.user?.role === 'teacher' && assessment.teacher_id !== req.user.id) {
    throw createError('No tienes permiso para acceder a esta evaluación', 403);
  }

  const response: ApiResponse<any> = {
    success: true,
    data: assessment,
    message: 'Evaluación obtenida exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// POST - Crear evaluación
export const createAssessment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { class_id, assessment_type_id, name, description, due_date, max_score } = req.body;

  if (!class_id || !name || !max_score) {
    throw createError('class_id, name y max_score son requeridos', 400);
  }

  // Validar que el usuario puede crear evaluación en esta clase
  const classCheck = await query(
    `SELECT teacher_id, entity_id FROM classes WHERE id = $1`,
    [class_id]
  );

  if (classCheck.rows.length === 0) {
    throw createError('Clase no encontrada', 404);
  }

  const classData = classCheck.rows[0];

  if (req.user?.role === 'admin_entity' && classData.entity_id !== req.user.entityId) {
    throw createError('No tienes permiso para crear evaluación en esta clase', 403);
  }
  if (req.user?.role === 'teacher' && classData.teacher_id !== req.user.id) {
    throw createError('No tienes permiso para crear evaluación en esta clase', 403);
  }

  const result = await query(
    `INSERT INTO assessments (class_id, assessment_type_id, name, description, due_date, max_score)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, class_id, assessment_type_id, name, description, due_date, max_score, created_at`,
    [class_id, assessment_type_id || null, name, description || null, due_date || null, max_score]
  );

  const response: ApiResponse<any> = {
    success: true,
    data: result.rows[0],
    message: 'Evaluación creada exitosamente',
    timestamp: new Date(),
  };

  res.status(201).json(response);
});

// PUT - Actualizar evaluación
export const updateAssessment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { assessmentId } = req.params;
  const { name, description, due_date, max_score, is_active } = req.body;

  // Validar permisos
  const assessmentCheck = await query(
    `SELECT a.class_id, c.teacher_id, c.entity_id
     FROM assessments a
     JOIN classes c ON a.class_id = c.id
     WHERE a.id = $1`,
    [assessmentId]
  );

  if (assessmentCheck.rows.length === 0) {
    throw createError('Evaluación no encontrada', 404);
  }

  const assessment = assessmentCheck.rows[0];

  if (req.user?.role === 'admin_entity' && assessment.entity_id !== req.user.entityId) {
    throw createError('No tienes permiso para actualizar esta evaluación', 403);
  }
  if (req.user?.role === 'teacher' && assessment.teacher_id !== req.user.id) {
    throw createError('No tienes permiso para actualizar esta evaluación', 403);
  }

  const result = await query(
    `UPDATE assessments
     SET name = COALESCE($1, name), 
         description = COALESCE($2, description),
         due_date = COALESCE($3, due_date),
         max_score = COALESCE($4, max_score),
         updated_at = NOW()
     WHERE id = $5
     RETURNING id, class_id, assessment_type_id, name, description, due_date, max_score, is_published, updated_at`,
    [name || null, description || null, due_date || null, max_score || null, assessmentId]
  );

  const response: ApiResponse<any> = {
    success: true,
    data: result.rows[0],
    message: 'Evaluación actualizada exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// DELETE - Eliminar evaluación
export const deleteAssessment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { assessment_id } = req.params;

  // Validar permisos
  const assessmentCheck = await query(
    `SELECT a.class_id, c.teacher_id, c.entity_id
     FROM assessments a
     JOIN classes c ON a.class_id = c.id
     WHERE a.id = $1`,
    [assessment_id]
  );

  if (assessmentCheck.rows.length === 0) {
    throw createError('Evaluación no encontrada', 404);
  }

  const assessment = assessmentCheck.rows[0];

  if (req.user?.role === 'admin_entity' && assessment.entity_id !== req.user.entityId) {
    throw createError('No tienes permiso para eliminar esta evaluación', 403);
  }
  if (req.user?.role === 'teacher' && assessment.teacher_id !== req.user.id) {
    throw createError('No tienes permiso para eliminar esta evaluación', 403);
  }

  await query('DELETE FROM assessments WHERE id = $1', [assessment_id]);

  const response: ApiResponse<null> = {
    success: true,
    data: null,
    message: 'Evaluación eliminada exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// ===============================
// ASSESSMENT TYPES
// ===============================

// GET - Listar tipos de evaluación
export const getAssessmentTypes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const typesResult = await query(
    `SELECT id, name, description, is_active
     FROM assessment_types
     WHERE is_active = true
     ORDER BY name ASC`
  );

  const response: ApiResponse<any> = {
    success: true,
    data: typesResult.rows,
    message: 'Tipos de evaluación obtenidos exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});
