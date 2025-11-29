// ===============================
// CONTROLADOR DE REPORTES
// ===============================

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { ApiResponse, PaginatedResponse } from '../../../shared/types';
import { query } from '../config/connection';

// ===============================
// REPORTS
// ===============================

// GET - Listar reportes
export const getReports = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { class_id, report_type, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

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

  let whereClause = 'WHERE r.class_id = $1';
  const params: any[] = [class_id];
  let paramIndex = 2;

  if (report_type) {
    whereClause += ` AND r.report_type = $${paramIndex}`;
    params.push(report_type);
    paramIndex++;
  }

  if (dateFrom) {
    whereClause += ` AND r.created_at >= $${paramIndex}`;
    params.push(dateFrom);
    paramIndex++;
  }

  if (dateTo) {
    whereClause += ` AND r.created_at <= $${paramIndex}`;
    params.push(dateTo);
    paramIndex++;
  }

  const countResult = await query(
    `SELECT COUNT(*) as total FROM reports r ${whereClause}`,
    params
  );

  const total = parseInt(countResult.rows[0].total);
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  const reportsResult = await query(
    `SELECT r.id, r.class_id, r.report_type, r.title, r.format, r.data, r.generated_by, r.created_at,
            u.full_name as created_by_name
     FROM reports r
     LEFT JOIN users u ON r.generated_by = u.id
     ${whereClause}
     ORDER BY r.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, parseInt(limit as string), offset]
  );

  const response: PaginatedResponse<any> = {
    success: true,
    data: reportsResult.rows,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      totalPages: Math.ceil(total / parseInt(limit as string)),
    },
    message: 'Reportes obtenidos exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// GET - Obtener reporte detallado
export const getReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { reportId } = req.params;

  const result = await query(
    `SELECT r.id, r.class_id, r.title, r.report_type, r.format, COALESCE(r.data, '{}'::jsonb) as data, r.generated_by, r.created_at, c.teacher_id, c.entity_id, COALESCE(u.full_name, '') as created_by_name
     FROM reports r
     JOIN classes c ON r.class_id = c.id
     LEFT JOIN users u ON r.generated_by = u.id
     WHERE r.id = $1`,
    [reportId]
  );

  if (result.rows.length === 0) {
    throw createError('Reporte no encontrado', 404);
  }

  const report = result.rows[0];

  // Validar permisos
  if (req.user?.role === 'admin_entity' && report.entity_id !== req.user.entityId) {
    throw createError('No tienes permiso para acceder a este reporte', 403);
  }
  if (req.user?.role === 'teacher' && report.teacher_id !== req.user.id) {
    throw createError('No tienes permiso para acceder a este reporte', 403);
  }

  const response: ApiResponse<any> = {
    success: true,
    data: report,
    message: 'Reporte obtenido exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// POST - Crear reporte
export const createReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { class_id, report_type, title, data } = req.body;

  if (!class_id || !report_type || !title) {
    throw createError('class_id, report_type y title son requeridos', 400);
  }

  // Validar que el usuario puede crear reporte en esta clase
  const classCheck = await query(
    `SELECT teacher_id, entity_id FROM classes WHERE id = $1`,
    [class_id]
  );

  if (classCheck.rows.length === 0) {
    throw createError('Clase no encontrada', 404);
  }

  const classData = classCheck.rows[0];

  if (req.user?.role === 'admin_entity' && classData.entity_id !== req.user.entityId) {
    throw createError('No tienes permiso para crear reporte en esta clase', 403);
  }
  if (req.user?.role === 'teacher' && classData.teacher_id !== req.user.id) {
    throw createError('No tienes permiso para crear reporte en esta clase', 403);
  }

  const result = await query(
    `INSERT INTO reports (class_id, report_type, title, type, format, generated_by)
     VALUES ($1, $2, $3, $2, 'pdf', $4)
     RETURNING id, class_id, report_type, title, format, generated_by, created_at`,
    [class_id, report_type, title, req.user?.id]
  );

  const response: ApiResponse<any> = {
    success: true,
    data: result.rows[0],
    message: 'Reporte creado exitosamente',
    timestamp: new Date(),
  };

  res.status(201).json(response);
});

// PUT - Actualizar reporte
export const updateReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { reportId } = req.params;
  const { title, data } = req.body;

  // Validar permisos
  const reportCheck = await query(
    `SELECT r.class_id, c.teacher_id, c.entity_id
     FROM reports r
     JOIN classes c ON r.class_id = c.id
     WHERE r.id = $1`,
    [reportId]
  );

  if (reportCheck.rows.length === 0) {
    throw createError('Reporte no encontrado', 404);
  }

  const report = reportCheck.rows[0];

  if (req.user?.role === 'admin_entity' && report.entity_id !== req.user.entityId) {
    throw createError('No tienes permiso para actualizar este reporte', 403);
  }
  if (req.user?.role === 'teacher' && report.teacher_id !== req.user.id) {
    throw createError('No tienes permiso para actualizar este reporte', 403);
  }

  const result = await query(
    `UPDATE reports
     SET title = COALESCE($1, title),
         data = COALESCE($2, data)
     WHERE id = $3
     RETURNING id, class_id, report_type, title, data, created_at`,
    [title || null, data ? JSON.stringify(data) : null, reportId]
  );

  const response: ApiResponse<any> = {
    success: true,
    data: result.rows[0],
    message: 'Reporte actualizado exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// DELETE - Eliminar reporte
export const deleteReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Validar permisos
  const reportCheck = await query(
    `SELECT r.class_id, c.teacher_id, c.entity_id
     FROM reports r
     JOIN classes c ON r.class_id = c.id
     WHERE r.id = $1`,
    [id]
  );

  if (reportCheck.rows.length === 0) {
    throw createError('Reporte no encontrado', 404);
  }

  const report = reportCheck.rows[0];

  if (req.user?.role === 'admin_entity' && report.entity_id !== req.user.entityId) {
    throw createError('No tienes permiso para eliminar este reporte', 403);
  }
  if (req.user?.role === 'teacher' && report.teacher_id !== req.user.id) {
    throw createError('No tienes permiso para eliminar este reporte', 403);
  }

  await query('DELETE FROM reports WHERE id = $1', [id]);

  const response: ApiResponse<null> = {
    success: true,
    data: null,
    message: 'Reporte eliminado exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});
