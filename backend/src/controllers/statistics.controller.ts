// ===============================
// CONTROLADOR DE ESTADÍSTICAS
// ===============================

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { ApiResponse } from '../../../shared/types';
import { query } from '../config/connection';

// ===============================
// ESTADÍSTICAS GENERALES
// ===============================

// GET - Estadísticas de la entidad (para admin_entity)
export const getEntityStatistics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role === 'admin_entity') {
    // Solo ver estadísticas de su entidad
    const entityId = req.user.entityId;

    // Total de clases
    const classesResult = await query(
      `SELECT COUNT(*) as total FROM classes WHERE entity_id = $1`,
      [entityId]
    );

    // Total de profesores - Count distinct teachers from classes
    const teachersResult = await query(
      `SELECT COUNT(DISTINCT c.teacher_id) as total FROM classes c WHERE c.entity_id = $1`,
      [entityId]
    );

    // Total de estudiantes
    const studentsResult = await query(
      `SELECT COUNT(DISTINCT e.student_id) as total
       FROM enrollments e
       JOIN sections s ON e.section_id = s.id
       JOIN classes c ON s.id = c.section_id
       WHERE c.entity_id = $1`,
      [entityId]
    );

    // Promedio de calificaciones
    const gradesResult = await query(
      `SELECT AVG(gr.score) as average_score
       FROM grades_records gr
       JOIN assessments a ON gr.assessment_id = a.id
       JOIN classes c ON a.class_id = c.id
       WHERE c.entity_id = $1`,
      [entityId]
    );

    // Asistencia promedio
    const attendanceResult = await query(
      `SELECT 
        COUNT(a.id) as total_records,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late
       FROM attendance a
       JOIN classes c ON a.class_id = c.id
       WHERE c.entity_id = $1`,
      [entityId]
    );

    const data = {
      classes: parseInt(classesResult.rows[0].total),
      teachers: parseInt(teachersResult.rows[0].total),
      students: parseInt(studentsResult.rows[0].total),
      averageGrade: parseFloat(gradesResult.rows[0].average_score) || 0,
      attendance: {
        total: parseInt(attendanceResult.rows[0].total_records) || 0,
        present: parseInt(attendanceResult.rows[0].present) || 0,
        absent: parseInt(attendanceResult.rows[0].absent) || 0,
        late: parseInt(attendanceResult.rows[0].late) || 0,
        presentPercentage: attendanceResult.rows[0].total_records > 0 
          ? ((attendanceResult.rows[0].present / attendanceResult.rows[0].total_records) * 100).toFixed(2)
          : 0,
      },
    };

    const response: ApiResponse<any> = {
      success: true,
      data,
      message: 'Estadísticas de entidad obtenidas exitosamente',
      timestamp: new Date(),
    };

    res.status(200).json(response);
  } else if (req.user?.role === 'admin_general') {
    // Ver estadísticas globales
    const classesResult = await query(`SELECT COUNT(*) as total FROM classes`);
    const teachersResult = await query(`SELECT COUNT(DISTINCT c.teacher_id) as total FROM classes c`);
    const studentsResult = await query(`SELECT COUNT(DISTINCT student_id) as total FROM enrollments`);
    const gradesResult = await query(`SELECT AVG(score) as average_score FROM grades_records`);
    const entitiesResult = await query(`SELECT COUNT(*) as total FROM entities WHERE is_active = true`);

    const data = {
      entities: parseInt(entitiesResult.rows[0].total),
      classes: parseInt(classesResult.rows[0].total),
      teachers: parseInt(teachersResult.rows[0].total),
      students: parseInt(studentsResult.rows[0].total),
      averageGrade: parseFloat(gradesResult.rows[0].average_score) || 0,
    };

    const response: ApiResponse<any> = {
      success: true,
      data,
      message: 'Estadísticas globales obtenidas exitosamente',
      timestamp: new Date(),
    };

    res.status(200).json(response);
  } else {
    throw createError('No tienes permiso para ver estadísticas', 403);
  }
});

// GET - Estadísticas de clase
export const getClassStatistics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { class_id } = req.query;

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

  if (req.user?.role === 'admin_entity' && classData.entity_id !== req.user.entityId) {
    throw createError('No tienes permiso para acceder a esta clase', 403);
  }
  if (req.user?.role === 'teacher' && classData.teacher_id !== req.user.id) {
    throw createError('No tienes permiso para acceder a esta clase', 403);
  }

  // Total de estudiantes
  const studentsResult = await query(
    `SELECT COUNT(DISTINCT e.student_id) as total
     FROM enrollments e
     JOIN sections s ON e.section_id = s.id
     WHERE s.id = (SELECT section_id FROM classes WHERE id = $1)`,
    [class_id]
  );

  // Promedio de calificaciones
  const gradesResult = await query(
    `SELECT 
      COUNT(*) as total_grades,
      AVG(gr.score) as average_score,
      MIN(gr.score) as min_score,
      MAX(gr.score) as max_score,
      STDDEV(gr.score) as std_deviation
     FROM grades_records gr
     JOIN assessments a ON gr.assessment_id = a.id
     WHERE a.class_id = $1`,
    [class_id]
  );

  // Asistencia
  const attendanceResult = await query(
    `SELECT 
      COUNT(a.id) as total_records,
      SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent,
      SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late
     FROM attendance a
     WHERE a.class_id = $1`,
    [class_id]
  );

  // Evaluaciones completadas
  const assessmentsResult = await query(
    `SELECT COUNT(*) as total FROM assessments WHERE class_id = $1`,
    [class_id]
  );

  const grades = gradesResult.rows[0];
  const attendance = attendanceResult.rows[0];

  const data = {
    totalStudents: parseInt(studentsResult.rows[0].total),
    gradeStatistics: {
      totalGrades: parseInt(grades.total_grades) || 0,
      averageScore: parseFloat(grades.average_score) || 0,
      minScore: parseFloat(grades.min_score) || 0,
      maxScore: parseFloat(grades.max_score) || 0,
      stdDeviation: parseFloat(grades.std_deviation) || 0,
    },
    attendance: {
      totalRecords: parseInt(attendance.total_records) || 0,
      present: parseInt(attendance.present) || 0,
      absent: parseInt(attendance.absent) || 0,
      late: parseInt(attendance.late) || 0,
      presentPercentage: attendance.total_records > 0
        ? ((attendance.present / attendance.total_records) * 100).toFixed(2)
        : 0,
    },
    totalAssessments: parseInt(assessmentsResult.rows[0].total),
  };

  const response: ApiResponse<any> = {
    success: true,
    data,
    message: 'Estadísticas de clase obtenidas exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// GET - Estadísticas de estudiante por clase
export const getStudentStatistics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { class_id, student_id } = req.query;

  if (!class_id || !student_id) {
    throw createError('class_id y student_id son requeridos', 400);
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

  if (req.user?.role === 'admin_entity' && classData.entity_id !== req.user.entityId) {
    throw createError('No tienes permiso para acceder a esta clase', 403);
  }
  if (req.user?.role === 'teacher' && classData.teacher_id !== req.user.id) {
    throw createError('No tienes permiso para acceder a esta clase', 403);
  }

  // Información del estudiante
  const studentResult = await query(
    `SELECT id, first_name, last_name, identification_number FROM students WHERE id = $1`,
    [student_id]
  );

  if (studentResult.rows.length === 0) {
    throw createError('Estudiante no encontrado', 404);
  }

  const student = studentResult.rows[0];

  // Calificaciones
  const gradesResult = await query(
    `SELECT 
      AVG(gr.score) as average_score,
      MIN(gr.score) as min_score,
      MAX(gr.score) as max_score,
      COUNT(*) as total_grades
     FROM grades_records gr
     JOIN assessments a ON gr.assessment_id = a.id
     WHERE a.class_id = $1 AND gr.student_id = $2`,
    [class_id, student_id]
  );

  // Asistencia
  const attendanceResult = await query(
    `SELECT 
      COUNT(a.id) as total_records,
      SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent,
      SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late
     FROM attendance a
     WHERE a.class_id = $1 AND a.student_id = $2`,
    [class_id, student_id]
  );

  const grades = gradesResult.rows[0];
  const attendance = attendanceResult.rows[0];

  const data = {
    student: {
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      identificationNumber: student.identification_number,
    },
    gradeStatistics: {
      averageScore: parseFloat(grades.average_score) || 0,
      minScore: parseFloat(grades.min_score) || 0,
      maxScore: parseFloat(grades.max_score) || 0,
      totalGrades: parseInt(grades.total_grades) || 0,
    },
    attendance: {
      totalRecords: parseInt(attendance.total_records) || 0,
      present: parseInt(attendance.present) || 0,
      absent: parseInt(attendance.absent) || 0,
      late: parseInt(attendance.late) || 0,
      presentPercentage: attendance.total_records > 0
        ? ((attendance.present / attendance.total_records) * 100).toFixed(2)
        : 0,
    },
  };

  const response: ApiResponse<any> = {
    success: true,
    data,
    message: 'Estadísticas de estudiante obtenidas exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});
