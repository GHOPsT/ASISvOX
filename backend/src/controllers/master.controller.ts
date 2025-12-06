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
  // Ya no aceptamos grade_id ni academic_year_id como filtros
  // Las secciones son globales: A, B, C, Sin Sección

  const sectionsResult = await query(
    `SELECT sec.id, sec.name, sec.max_students, sec.is_active
     FROM sections sec
     WHERE sec.is_active = true
     ORDER BY sec.name ASC`
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
