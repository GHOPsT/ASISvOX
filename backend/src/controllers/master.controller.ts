// ===============================
// CONTROLADOR DE DATOS MAESTROS
// ===============================

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { ApiResponse, PaginatedResponse } from '../../../shared/types';
import { query } from '../config/connection';

// ===============================
// SUBJECTS (ASIGNATURAS)
// ===============================

// GET - Obtener todas las asignaturas
export const getSubjects = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const subjectsResult = await query(
    `SELECT id, name, code, is_active 
     FROM subjects 
     WHERE is_active = true
     ORDER BY name ASC`
  );

  const response: ApiResponse<any[]> = {
    success: true,
    data: subjectsResult.rows,
    message: 'Asignaturas obtenidas exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// ===============================
// SECTIONS (SECCIONES)
// ===============================

// GET - Obtener todas las secciones
export const getSections = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { grade_id, academic_year_id } = req.query;

  let whereClause = 'WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (grade_id) {
    whereClause += ` AND grade_id = $${paramIndex}`;
    params.push(grade_id);
    paramIndex++;
  }

  if (academic_year_id) {
    whereClause += ` AND academic_year_id = $${paramIndex}`;
    params.push(academic_year_id);
    paramIndex++;
  }

  const sectionsResult = await query(
    `SELECT sec.id, sec.name, sec.grade_id, sec.academic_year_id,
            g.name as grade_name, ay.name as academic_year_name
     FROM sections sec
     JOIN grades g ON sec.grade_id = g.id
     JOIN academic_years ay ON sec.academic_year_id = ay.id
     ${whereClause}
     ORDER BY g.level DESC, sec.name ASC`,
    params
  );

  const response: ApiResponse<any[]> = {
    success: true,
    data: sectionsResult.rows,
    message: 'Secciones obtenidas exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// ===============================
// ACADEMIC YEARS (AÑOS ACADÉMICOS)
// ===============================

// GET - Obtener todos los años académicos
export const getAcademicYears = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const academicYearsResult = await query(
    `SELECT id, name, start_date, end_date, is_current
     FROM academic_years
     ORDER BY name DESC`
  );

  const response: ApiResponse<any[]> = {
    success: true,
    data: academicYearsResult.rows,
    message: 'Años académicos obtenidos exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// ===============================
// GRADES (GRADOS)
// ===============================

// GET - Obtener todos los grados
export const getGrades = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const gradesResult = await query(
    `SELECT id, name, level, is_active
     FROM grades
     WHERE is_active = true
     ORDER BY level ASC`
  );

  const response: ApiResponse<any[]> = {
    success: true,
    data: gradesResult.rows,
    message: 'Grados obtenidos exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});
