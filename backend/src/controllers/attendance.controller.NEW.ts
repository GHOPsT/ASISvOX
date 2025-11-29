// ===============================
// CONTROLADOR DE ASISTENCIA
// ===============================

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { ApiResponse, PaginatedResponse } from '../../../shared/types';
import { query } from '../config/connection';

// ===============================
// ATTENDANCE - Registro diario de asistencia por estudiante
// ===============================

// GET - Listar registros de asistencia de una clase
export const getAttendanceSessions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { class_id, start_date, end_date, page = 1, limit = 20 } = req.query;

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

  // REGLA: admin_entity solo ve su entidad, teacher solo sus clases, admin_general ve todo
  if (req.user?.role === 'admin_entity' && classData.entity_id !== req.user.entityId) {
    throw createError('No tienes permiso para acceder a esta clase', 403);
  }
  if (req.user?.role === 'teacher' && classData.teacher_id !== req.user.id) {
    throw createError('No tienes permiso para acceder a esta clase', 403);
  }

  let whereClause = 'WHERE a.class_id = $1';
  const params: any[] = [class_id];
  let paramIndex = 2;

  if (start_date) {
    whereClause += ` AND DATE(a.date) >= $${paramIndex}`;
    params.push(start_date);
    paramIndex++;
  }

  if (end_date) {
    whereClause += ` AND DATE(a.date) <= $${paramIndex}`;
    params.push(end_date);
    paramIndex++;
  }

  const countResult = await query(
    `SELECT COUNT(DISTINCT a.date) as total FROM attendance a ${whereClause}`,
    params
  );

  const total = parseInt(countResult.rows[0].total);
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  // Obtener fechas de sesiones (agrupadas por día)
  const sessionsResult = await query(
    `SELECT DISTINCT a.date as session_date, 
            COUNT(*) as total_records,
            SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
            SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
            SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
            MAX(a.recorded_by) as created_by,
            MAX(a.created_at) as created_at
     FROM attendance a
     ${whereClause}
     GROUP BY a.date
     ORDER BY a.date DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, parseInt(limit as string), offset]
  );

  const response: PaginatedResponse<any> = {
    success: true,
    data: sessionsResult.rows,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      totalPages: Math.ceil(total / parseInt(limit as string)),
    },
    message: 'Sesiones de asistencia obtenidas exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// GET - Obtener registros de asistencia de una clase para una fecha específica
export const getAttendanceSession = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { class_id, date } = req.query;

  if (!class_id || !date) {
    throw createError('class_id y date son requeridos', 400);
  }

  const classCheck = await query(
    `SELECT entity_id, teacher_id FROM classes WHERE id = $1`,
    [class_id]
  );

  if (classCheck.rows.length === 0) {
    throw createError('Clase no encontrada', 404);
  }

  const classData = classCheck.rows[0];

  if (req.user?.role === 'admin_entity' && classData.entity_id !== req.user.entityId) {
    throw createError('No tienes permiso para acceder a esta clase', 403);
  }
  if (req.user?.role === 'teacher' && classData.teacher_id !== req.user.id) {
    throw createError('No tienes permiso para acceder a esta clase', 403);
  }

  // Obtener registros de esa fecha
  const recordsResult = await query(
    `SELECT a.id, a.class_id, a.date, a.student_id, a.status, a.notes, a.recorded_by, a.created_at,
            s.first_name, s.last_name, s.identification_number
     FROM attendance a
     JOIN students s ON a.student_id = s.id
     WHERE a.class_id = $1 AND DATE(a.date) = $2
     ORDER BY s.first_name, s.last_name`,
    [class_id, date]
  );

  const response: ApiResponse<any> = {
    success: true,
    data: recordsResult.rows,
    message: 'Registros de asistencia obtenidos exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// POST - Crear/registrar asistencia de estudiante
export const createAttendanceSession = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { class_id, date, student_id, status, notes } = req.body;

  if (!class_id || !date || !student_id || !status) {
    throw createError('class_id, date, student_id y status son requeridos', 400);
  }

  if (!['present', 'absent', 'late', 'excused'].includes(status)) {
    throw createError('Status debe ser: present, absent, late o excused', 400);
  }

  // Validar que el usuario puede crear en esta clase
  const classCheck = await query(
    `SELECT teacher_id, entity_id FROM classes WHERE id = $1`,
    [class_id]
  );

  if (classCheck.rows.length === 0) {
    throw createError('Clase no encontrada', 404);
  }

  const classData = classCheck.rows[0];

  if (req.user?.role === 'admin_entity' && classData.entity_id !== req.user.entityId) {
    throw createError('No tienes permiso', 403);
  }
  if (req.user?.role === 'teacher' && classData.teacher_id !== req.user.id) {
    throw createError('No tienes permiso', 403);
  }

  // Verificar si ya existe un registro para este estudiante en esa fecha
  const existingCheck = await query(
    `SELECT id FROM attendance 
     WHERE class_id = $1 AND student_id = $2 AND DATE(date) = $3`,
    [class_id, student_id, date]
  );

  let result;
  if (existingCheck.rows.length > 0) {
    // Actualizar
    result = await query(
      `UPDATE attendance 
       SET status = $1, notes = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, class_id, date, student_id, status, notes, recorded_by, created_at`,
      [status, notes || null, existingCheck.rows[0].id]
    );
  } else {
    // Insertar
    result = await query(
      `INSERT INTO attendance (class_id, student_id, date, status, notes, recorded_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, class_id, date, student_id, status, notes, recorded_by, created_at`,
      [class_id, student_id, date, status, notes || null, req.user?.id]
    );
  }

  const response: ApiResponse<any> = {
    success: true,
    data: result.rows[0],
    message: 'Asistencia registrada exitosamente',
    timestamp: new Date(),
  };

  res.status(201).json(response);
});

// GET - Obtener registros de asistencia con filtros
export const getAttendanceRecords = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { class_id, date, student_id, status } = req.query;

  if (!class_id) {
    throw createError('class_id es requerido', 400);
  }

  // Validar permisos
  const classCheck = await query(
    `SELECT teacher_id, entity_id FROM classes WHERE id = $1`,
    [class_id]
  );

  if (classCheck.rows.length === 0) {
    throw createError('Clase no encontrada', 404);
  }

  const classData = classCheck.rows[0];

  if (req.user?.role === 'admin_entity' && classData.entity_id !== req.user.entityId) {
    throw createError('No tienes permiso', 403);
  }
  if (req.user?.role === 'teacher' && classData.teacher_id !== req.user.id) {
    throw createError('No tienes permiso', 403);
  }

  let whereClause = 'WHERE a.class_id = $1';
  const params: any[] = [class_id];
  let paramIndex = 2;

  if (date) {
    whereClause += ` AND DATE(a.date) = $${paramIndex}`;
    params.push(date);
    paramIndex++;
  }

  if (student_id) {
    whereClause += ` AND a.student_id = $${paramIndex}`;
    params.push(student_id);
    paramIndex++;
  }

  if (status) {
    whereClause += ` AND a.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  const recordsResult = await query(
    `SELECT a.id, a.class_id, a.date, a.student_id, a.status, a.notes, a.recorded_by, a.created_at,
            s.first_name, s.last_name, s.identification_number
     FROM attendance a
     JOIN students s ON a.student_id = s.id
     ${whereClause}
     ORDER BY a.date DESC, s.first_name, s.last_name`,
    params
  );

  const response: ApiResponse<any> = {
    success: true,
    data: recordsResult.rows,
    message: 'Registros de asistencia obtenidos exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// POST - Registrar asistencia masiva para una clase en una fecha
export const recordAttendance = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { class_id, date, records } = req.body;

  if (!class_id || !date || !records || !Array.isArray(records)) {
    throw createError('class_id, date y records (array) son requeridos', 400);
  }

  // Validar permisos
  const classCheck = await query(
    `SELECT teacher_id, entity_id FROM classes WHERE id = $1`,
    [class_id]
  );

  if (classCheck.rows.length === 0) {
    throw createError('Clase no encontrada', 404);
  }

  const classData = classCheck.rows[0];

  if (req.user?.role === 'admin_entity' && classData.entity_id !== req.user.entityId) {
    throw createError('No tienes permiso', 403);
  }
  if (req.user?.role === 'teacher' && classData.teacher_id !== req.user.id) {
    throw createError('No tienes permiso', 403);
  }

  // Insertar registros
  const insertedRecords = [];
  for (const record of records) {
    const { student_id, status, notes } = record;
    
    if (!student_id || !status) continue;

    const result = await query(
      `INSERT INTO attendance (class_id, student_id, date, status, notes, recorded_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (class_id, student_id, date) DO UPDATE 
       SET status = $4, notes = $5, updated_at = NOW()
       RETURNING id, class_id, date, student_id, status, notes, recorded_by, created_at`,
      [class_id, student_id, date, status, notes || null, req.user?.id]
    );

    if (result.rows.length > 0) {
      insertedRecords.push(result.rows[0]);
    }
  }

  const response: ApiResponse<any> = {
    success: true,
    data: insertedRecords,
    message: `${insertedRecords.length} registros de asistencia procesados exitosamente`,
    timestamp: new Date(),
  };

  res.status(201).json(response);
});

// PUT - Actualizar registro de asistencia
export const updateAttendanceRecord = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { record_id } = req.params;
  const { status, notes } = req.body;

  // Validar permisos
  const recordCheck = await query(
    `SELECT a.class_id, c.teacher_id, c.entity_id
     FROM attendance a
     JOIN classes c ON a.class_id = c.id
     WHERE a.id = $1`,
    [record_id]
  );

  if (recordCheck.rows.length === 0) {
    throw createError('Registro no encontrado', 404);
  }

  const record = recordCheck.rows[0];

  if (req.user?.role === 'admin_entity' && record.entity_id !== req.user.entityId) {
    throw createError('No tienes permiso', 403);
  }
  if (req.user?.role === 'teacher' && record.teacher_id !== req.user.id) {
    throw createError('No tienes permiso', 403);
  }

  const result = await query(
    `UPDATE attendance
     SET status = COALESCE($1, status), notes = COALESCE($2, notes), updated_at = NOW()
     WHERE id = $3
     RETURNING id, class_id, date, student_id, status, notes, recorded_by, created_at`,
    [status || null, notes || null, record_id]
  );

  const response: ApiResponse<any> = {
    success: true,
    data: result.rows[0],
    message: 'Registro actualizado exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});
