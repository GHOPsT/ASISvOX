"use strict";
// ===============================
// CONTROLADOR DE ESTADÍSTICAS
// ===============================
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentStatistics = exports.getClassStatistics = exports.getEntityStatistics = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const connection_1 = require("../config/connection");
// ===============================
// ESTADÍSTICAS GENERALES
// ===============================
// GET - Estadísticas de la entidad (para admin_entity)
exports.getEntityStatistics = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (req.user?.role === 'admin_entity') {
        // Solo ver estadísticas de su entidad
        const entityId = req.user.entityId;
        // Total de clases
        const classesResult = await (0, connection_1.query)(`SELECT COUNT(*) as total FROM classes WHERE entity_id = $1`, [entityId]);
        // Total de profesores
        const teachersResult = await (0, connection_1.query)(`SELECT COUNT(DISTINCT user_id) as total FROM teacher_assignments WHERE entity_id = $1`, [entityId]);
        // Total de estudiantes
        const studentsResult = await (0, connection_1.query)(`SELECT COUNT(DISTINCT e.student_id) as total
       FROM enrollments e
       JOIN sections s ON e.section_id = s.id
       JOIN classes c ON s.id = c.section_id
       WHERE c.entity_id = $1`, [entityId]);
        // Promedio de calificaciones
        const gradesResult = await (0, connection_1.query)(`SELECT AVG(gr.score) as average_score
       FROM grades_records gr
       JOIN assessments a ON gr.assessment_id = a.id
       JOIN classes c ON a.class_id = c.id
       WHERE c.entity_id = $1`, [entityId]);
        // Asistencia promedio
        const attendanceResult = await (0, connection_1.query)(`SELECT 
        COUNT(ar.id) as total_records,
        SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN ar.status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN ar.status = 'late' THEN 1 ELSE 0 END) as late
       FROM attendance_records ar
       JOIN attendance_sessions a ON ar.attendance_session_id = a.id
       JOIN classes c ON a.class_id = c.id
       WHERE c.entity_id = $1`, [entityId]);
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
        const response = {
            success: true,
            data,
            message: 'Estadísticas de entidad obtenidas exitosamente',
            timestamp: new Date(),
        };
        res.status(200).json(response);
    }
    else if (req.user?.role === 'admin_general') {
        // Ver estadísticas globales
        const classesResult = await (0, connection_1.query)(`SELECT COUNT(*) as total FROM classes`);
        const teachersResult = await (0, connection_1.query)(`SELECT COUNT(DISTINCT user_id) as total FROM teacher_assignments`);
        const studentsResult = await (0, connection_1.query)(`SELECT COUNT(DISTINCT student_id) as total FROM enrollments`);
        const gradesResult = await (0, connection_1.query)(`SELECT AVG(score) as average_score FROM grades_records`);
        const entitiesResult = await (0, connection_1.query)(`SELECT COUNT(*) as total FROM entities WHERE is_active = true`);
        const data = {
            entities: parseInt(entitiesResult.rows[0].total),
            classes: parseInt(classesResult.rows[0].total),
            teachers: parseInt(teachersResult.rows[0].total),
            students: parseInt(studentsResult.rows[0].total),
            averageGrade: parseFloat(gradesResult.rows[0].average_score) || 0,
        };
        const response = {
            success: true,
            data,
            message: 'Estadísticas globales obtenidas exitosamente',
            timestamp: new Date(),
        };
        res.status(200).json(response);
    }
    else {
        throw (0, errorHandler_1.createError)('No tienes permiso para ver estadísticas', 403);
    }
});
// GET - Estadísticas de clase
exports.getClassStatistics = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { classId } = req.query;
    if (!classId) {
        throw (0, errorHandler_1.createError)('classId es requerido', 400);
    }
    // Validar que el usuario puede acceder a esta clase
    const classCheck = await (0, connection_1.query)(`SELECT entity_id, teacher_id FROM classes WHERE id = $1`, [classId]);
    if (classCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Clase no encontrada', 404);
    }
    const classData = classCheck.rows[0];
    if (req.user?.role === 'admin_entity' && classData.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para acceder a esta clase', 403);
    }
    if (req.user?.role === 'teacher' && classData.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para acceder a esta clase', 403);
    }
    // Total de estudiantes
    const studentsResult = await (0, connection_1.query)(`SELECT COUNT(DISTINCT e.student_id) as total
     FROM enrollments e
     JOIN sections s ON e.section_id = s.id
     WHERE s.id = (SELECT section_id FROM classes WHERE id = $1)`, [classId]);
    // Promedio de calificaciones
    const gradesResult = await (0, connection_1.query)(`SELECT 
      COUNT(*) as total_grades,
      AVG(gr.score) as average_score,
      MIN(gr.score) as min_score,
      MAX(gr.score) as max_score,
      STDDEV(gr.score) as std_deviation
     FROM grades_records gr
     JOIN assessments a ON gr.assessment_id = a.id
     WHERE a.class_id = $1`, [classId]);
    // Asistencia
    const attendanceResult = await (0, connection_1.query)(`SELECT 
      COUNT(ar.id) as total_records,
      SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN ar.status = 'absent' THEN 1 ELSE 0 END) as absent,
      SUM(CASE WHEN ar.status = 'late' THEN 1 ELSE 0 END) as late
     FROM attendance_records ar
     JOIN attendance_sessions a ON ar.attendance_session_id = a.id
     WHERE a.class_id = $1`, [classId]);
    // Evaluaciones completadas
    const assessmentsResult = await (0, connection_1.query)(`SELECT COUNT(*) as total FROM assessments WHERE class_id = $1`, [classId]);
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
    const response = {
        success: true,
        data,
        message: 'Estadísticas de clase obtenidas exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// GET - Estadísticas de estudiante por clase
exports.getStudentStatistics = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { classId, studentId } = req.query;
    if (!classId || !studentId) {
        throw (0, errorHandler_1.createError)('classId y studentId son requeridos', 400);
    }
    // Validar que el usuario puede acceder a esta clase
    const classCheck = await (0, connection_1.query)(`SELECT entity_id, teacher_id FROM classes WHERE id = $1`, [classId]);
    if (classCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Clase no encontrada', 404);
    }
    const classData = classCheck.rows[0];
    if (req.user?.role === 'admin_entity' && classData.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para acceder a esta clase', 403);
    }
    if (req.user?.role === 'teacher' && classData.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para acceder a esta clase', 403);
    }
    // Información del estudiante
    const studentResult = await (0, connection_1.query)(`SELECT id, first_name, last_name, identification_number FROM students WHERE id = $1`, [studentId]);
    if (studentResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Estudiante no encontrado', 404);
    }
    const student = studentResult.rows[0];
    // Calificaciones
    const gradesResult = await (0, connection_1.query)(`SELECT 
      AVG(gr.score) as average_score,
      MIN(gr.score) as min_score,
      MAX(gr.score) as max_score,
      COUNT(*) as total_grades
     FROM grades_records gr
     JOIN assessments a ON gr.assessment_id = a.id
     WHERE a.class_id = $1 AND gr.student_id = $2`, [classId, studentId]);
    // Asistencia
    const attendanceResult = await (0, connection_1.query)(`SELECT 
      COUNT(ar.id) as total_records,
      SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN ar.status = 'absent' THEN 1 ELSE 0 END) as absent,
      SUM(CASE WHEN ar.status = 'late' THEN 1 ELSE 0 END) as late
     FROM attendance_records ar
     JOIN attendance_sessions a ON ar.attendance_session_id = a.id
     WHERE a.class_id = $1 AND ar.student_id = $2`, [classId, studentId]);
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
    const response = {
        success: true,
        data,
        message: 'Estadísticas de estudiante obtenidas exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
//# sourceMappingURL=statistics.controller.js.map