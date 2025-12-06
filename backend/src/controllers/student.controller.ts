// ===============================
// CONTROLADOR DE ESTUDIANTES
// ===============================

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { query } from '../config/connection';

// ===============================
// CREAR ESTUDIANTE(S)
// ===============================
export const createStudents = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { students } = req.body;

  if (!students || !Array.isArray(students) || students.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Debes proporcionar un array de estudiantes'
    });
  }

  const createdStudents: any[] = [];
  const errors: any[] = [];

  for (const student of students) {
    try {
      const { first_name, last_name, identification_number, date_of_birth, gender } = student;

      // Validaciones básicas
      if (!first_name || !last_name) {
        errors.push({
          student: `${student.first_name} ${student.last_name}`,
          error: 'Nombre y apellido son requeridos'
        });
        continue;
      }

      // Verificar si el estudiante ya existe por identification_number
      if (identification_number) {
        const existingStudent = await query(
          'SELECT id FROM students WHERE identification_number = $1',
          [identification_number]
        );

        if (existingStudent.rows.length > 0) {
          createdStudents.push({
            id: existingStudent.rows[0].id,
            first_name,
            last_name,
            identification_number,
            status: 'existing'
          });
          continue;
        }
      }

      // Crear estudiante nuevo
      const result = await query(
        `INSERT INTO students (first_name, last_name, identification_number, date_of_birth, gender, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING id, first_name, last_name, identification_number, gender, date_of_birth`,
        [first_name, last_name, identification_number || null, date_of_birth || null, gender || null]
      );

      createdStudents.push({
        ...result.rows[0],
        status: 'created'
      });
    } catch (error: any) {
      // Capturar errores de UNIQUE constraint
      if (error.code === '23505') {
        errors.push({
          student: `${student.first_name} ${student.last_name}`,
          error: 'El documento de identidad ya existe'
        });
      } else {
        errors.push({
          student: `${student.first_name} ${student.last_name}`,
          error: error.message
        });
      }
    }
  }

  res.status(201).json({
    success: true,
    message: `${createdStudents.length} estudiante(s) procesado(s)`,
    data: createdStudents,
    errors: errors.length > 0 ? errors : undefined
  });
});

// ===============================
// OBTENER ESTUDIANTE POR ID
// ===============================
export const getStudentById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const result = await query(
    `SELECT id, first_name, last_name, identification_number, date_of_birth, gender, 
            email, phone, address, is_active, created_at
     FROM students WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Estudiante no encontrado'
    });
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
});

// ===============================
// OBTENER TODOS LOS ESTUDIANTES
// ===============================
export const getStudents = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { limit = 100, offset = 0 } = req.query;

  const result = await query(
    `SELECT id, first_name, last_name, identification_number, date_of_birth, gender, 
            email, phone, is_active, created_at
     FROM students 
     WHERE is_active = true
     ORDER BY last_name, first_name
     LIMIT $1 OFFSET $2`,
    [parseInt(limit as string), parseInt(offset as string)]
  );

  const countResult = await query('SELECT COUNT(*) FROM students WHERE is_active = true', []);

  res.json({
    success: true,
    data: result.rows,
    total: parseInt(countResult.rows[0].count)
  });
});

// ===============================
// ACTUALIZAR ESTUDIANTE
// ===============================
export const updateStudent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { first_name, last_name, date_of_birth, gender, email, phone, address } = req.body;

  // Verificar que el estudiante existe
  const checkResult = await query('SELECT id FROM students WHERE id = $1', [id]);
  if (checkResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Estudiante no encontrado'
    });
  }

  const result = await query(
    `UPDATE students 
     SET first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         date_of_birth = COALESCE($3, date_of_birth),
         gender = COALESCE($4, gender),
         email = COALESCE($5, email),
         phone = COALESCE($6, phone),
         address = COALESCE($7, address),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $8
     RETURNING id, first_name, last_name, identification_number, gender, date_of_birth`,
    [first_name, last_name, date_of_birth, gender, email, phone, address, id]
  );

  res.json({
    success: true,
    message: 'Estudiante actualizado',
    data: result.rows[0]
  });
});

// ===============================
// OBTENER ESTUDIANTES DE UNA CLASE
// ===============================
export const getStudentsByClassId = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { classId } = req.params;

  const result = await query(
    `SELECT DISTINCT s.id, s.first_name, s.last_name, s.identification_number, 
            s.gender, s.date_of_birth, s.email, s.phone
     FROM students s
     JOIN enrollments en ON s.id = en.student_id
     JOIN sections sec ON en.section_id = sec.id
     JOIN classes c ON c.section_id = sec.id
     WHERE c.id = $1 AND en.status = 'active' AND s.is_active = true
     ORDER BY s.last_name, s.first_name`,
    [classId]
  );

  res.json({
    success: true,
    data: result.rows,
    count: result.rows.length
  });
});
