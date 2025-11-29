"use strict";
// ===============================
// CONTROLADOR DE CALIFICACIONES
// ===============================
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGradeStatistics = exports.deleteGrade = exports.updateGrade = exports.recordGradesBulk = exports.recordGrade = exports.getGrade = exports.getGrades = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const connection_1 = require("../config/connection");
// ===============================
// GRADES RECORDS
// ===============================
// GET - Listar calificaciones
exports.getGrades = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { class_id, student_id, assessment_id, page = 1, limit = 20 } = req.query;
    if (!class_id) {
        throw (0, errorHandler_1.createError)('class_id es requerido', 400);
    }
    // Validar que el usuario puede acceder a esta clase
    const classCheck = await (0, connection_1.query)(`SELECT entity_id, teacher_id FROM classes WHERE id = $1`, [class_id]);
    if (classCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Clase no encontrada', 404);
    }
    const classData = classCheck.rows[0];
    // REGLA: admin_entity solo ve su entidad, teacher solo sus clases
    if (req.user?.role === 'admin_entity' && classData.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para acceder a esta clase', 403);
    }
    if (req.user?.role === 'teacher' && classData.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para acceder a esta clase', 403);
    }
    let whereClause = 'WHERE a.class_id = $1';
    const params = [class_id];
    let paramIndex = 2;
    if (student_id) {
        whereClause += ` AND gr.student_id = $${paramIndex}`;
        params.push(student_id);
        paramIndex++;
    }
    if (assessment_id) {
        whereClause += ` AND gr.assessment_id = $${paramIndex}`;
        params.push(assessment_id);
        paramIndex++;
    }
    const countResult = await (0, connection_1.query)(`SELECT COUNT(*) as total FROM grades_records gr
     JOIN assessments a ON gr.assessment_id = a.id
     ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].total);
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const gradesResult = await (0, connection_1.query)(`SELECT gr.id, gr.assessment_id, gr.student_id, gr.score, gr.observations, gr.created_at, gr.updated_at,
            a.name as assessment_title, a.max_score,
            s.first_name, s.last_name, s.identification_number
     FROM grades_records gr
     JOIN assessments a ON gr.assessment_id = a.id
     JOIN students s ON gr.student_id = s.id
     ${whereClause}
     ORDER BY s.first_name, s.last_name, a.name
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`, [...params, parseInt(limit), offset]);
    const response = {
        success: true,
        data: gradesResult.rows,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
        },
        message: 'Calificaciones obtenidas exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// GET - Obtener calificación individual
exports.getGrade = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { gradeId } = req.params;
    const gradeResult = await (0, connection_1.query)(`SELECT gr.*, a.class_id, c.teacher_id, c.entity_id, 
            a.name as assessment_title, a.max_score,
            s.first_name, s.last_name
     FROM grades_records gr
     JOIN assessments a ON gr.assessment_id = a.id
     JOIN classes c ON a.class_id = c.id
     JOIN students s ON gr.student_id = s.id
     WHERE gr.id = $1`, [gradeId]);
    if (gradeResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Calificación no encontrada', 404);
    }
    const grade = gradeResult.rows[0];
    // Validar permisos
    if (req.user?.role === 'admin_entity' && grade.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para acceder a esta calificación', 403);
    }
    if (req.user?.role === 'teacher' && grade.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para acceder a esta calificación', 403);
    }
    const response = {
        success: true,
        data: grade,
        message: 'Calificación obtenida exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// POST - Registrar calificación
exports.recordGrade = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { assessment_id, student_id, score, observations } = req.body;
    if (!assessment_id || !student_id || score === undefined) {
        throw (0, errorHandler_1.createError)('assessment_id, student_id y score son requeridos', 400);
    }
    // Validar que el usuario puede registrar calificación
    const assessmentCheck = await (0, connection_1.query)(`SELECT a.class_id, a.max_score, c.teacher_id, c.entity_id
     FROM assessments a
     JOIN classes c ON a.class_id = c.id
     WHERE a.id = $1`, [assessment_id]);
    if (assessmentCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Evaluación no encontrada', 404);
    }
    const assessment = assessmentCheck.rows[0];
    if (req.user?.role === 'admin_entity' && assessment.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para registrar calificación', 403);
    }
    if (req.user?.role === 'teacher' && assessment.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para registrar calificación', 403);
    }
    // Validar que la calificación no exceda el total de puntos
    if (score > assessment.max_score) {
        throw (0, errorHandler_1.createError)(`La calificación no puede exceder ${assessment.max_score} puntos`, 400);
    }
    // Verificar si ya existe calificación
    const existingGrade = await (0, connection_1.query)(`SELECT id FROM grades_records
     WHERE assessment_id = $1 AND student_id = $2`, [assessment_id, student_id]);
    let result;
    if (existingGrade.rows.length > 0) {
        // Actualizar calificación existente
        result = await (0, connection_1.query)(`UPDATE grades_records
       SET score = $1, observations = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, assessment_id, student_id, score, observations, created_at, updated_at`, [score, observations || null, existingGrade.rows[0].id]);
    }
    else {
        // Crear nueva calificación
        result = await (0, connection_1.query)(`INSERT INTO grades_records (assessment_id, student_id, score, observations)
       VALUES ($1, $2, $3, $4)
       RETURNING id, assessment_id, student_id, score, observations, created_at`, [assessment_id, student_id, score, observations || null]);
    }
    const response = {
        success: true,
        data: result.rows[0],
        message: 'Calificación registrada exitosamente',
        timestamp: new Date(),
    };
    res.status(201).json(response);
});
// POST - Registrar calificaciones en lote
exports.recordGradesBulk = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { assessment_id, grades } = req.body;
    if (!assessment_id || !grades || !Array.isArray(grades) || grades.length === 0) {
        throw (0, errorHandler_1.createError)('assessment_id y grades (array) son requeridos', 400);
    }
    // Validar que el usuario puede registrar calificaciones
    const assessmentCheck = await (0, connection_1.query)(`SELECT a.class_id, a.max_score, c.teacher_id, c.entity_id
     FROM assessments a
     JOIN classes c ON a.class_id = c.id
     WHERE a.id = $1`, [assessment_id]);
    if (assessmentCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Evaluación no encontrada', 404);
    }
    const assessment = assessmentCheck.rows[0];
    if (req.user?.role === 'admin_entity' && assessment.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para registrar calificaciones', 403);
    }
    if (req.user?.role === 'teacher' && assessment.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para registrar calificaciones', 403);
    }
    // Validar todas las calificaciones
    for (const grade of grades) {
        if (!grade.student_id || grade.score === undefined) {
            throw (0, errorHandler_1.createError)('Cada calificación debe tener student_id y score', 400);
        }
        if (grade.score > assessment.max_score) {
            throw (0, errorHandler_1.createError)(`Calificación para estudiante ${grade.student_id} excede ${assessment.max_score} puntos`, 400);
        }
    }
    // Insertar/actualizar calificaciones
    const results = [];
    for (const grade of grades) {
        const existingGrade = await (0, connection_1.query)(`SELECT id FROM grades_records
       WHERE assessment_id = $1 AND student_id = $2`, [assessment_id, grade.student_id]);
        let result;
        if (existingGrade.rows.length > 0) {
            result = await (0, connection_1.query)(`UPDATE grades_records
         SET score = $1, observations = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING id, assessment_id, student_id, score, observations, updated_at`, [grade.score, grade.observations || null, existingGrade.rows[0].id]);
        }
        else {
            result = await (0, connection_1.query)(`INSERT INTO grades_records (assessment_id, student_id, score, observations)
         VALUES ($1, $2, $3, $4)
         RETURNING id, assessment_id, student_id, score, observations, created_at`, [assessment_id, grade.student_id, grade.score, grade.observations || null]);
        }
        results.push(result.rows[0]);
    }
    const response = {
        success: true,
        data: results,
        message: `${results.length} calificaciones registradas exitosamente`,
        timestamp: new Date(),
    };
    res.status(201).json(response);
});
// PUT - Actualizar calificación
exports.updateGrade = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { gradeId } = req.params;
    const { score, observations } = req.body;
    // Validar permisos
    const gradeCheck = await (0, connection_1.query)(`SELECT gr.assessment_id, a.class_id, a.max_score, c.teacher_id, c.entity_id
     FROM grades_records gr
     JOIN assessments a ON gr.assessment_id = a.id
     JOIN classes c ON a.class_id = c.id
     WHERE gr.id = $1`, [gradeId]);
    if (gradeCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Calificación no encontrada', 404);
    }
    const grade = gradeCheck.rows[0];
    if (req.user?.role === 'admin_entity' && grade.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para actualizar esta calificación', 403);
    }
    if (req.user?.role === 'teacher' && grade.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para actualizar esta calificación', 403);
    }
    // Validar que la calificación no exceda el total de puntos
    if (score !== undefined && score > grade.max_score) {
        throw (0, errorHandler_1.createError)(`La calificación no puede exceder ${grade.max_score} puntos`, 400);
    }
    const result = await (0, connection_1.query)(`UPDATE grades_records
     SET score = COALESCE($1, score), 
         observations = COALESCE($2, observations),
         updated_at = NOW()
     WHERE id = $3
     RETURNING id, assessment_id, student_id, score, observations, updated_at`, [score !== undefined ? score : null, observations || null, gradeId]);
    const response = {
        success: true,
        data: result.rows[0],
        message: 'Calificación actualizada exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// DELETE - Eliminar calificación
exports.deleteGrade = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    // Validar permisos
    const gradeCheck = await (0, connection_1.query)(`SELECT gr.assessment_id, a.class_id, c.teacher_id, c.entity_id
     FROM grades_records gr
     JOIN assessments a ON gr.assessment_id = a.id
     JOIN classes c ON a.class_id = c.id
     WHERE gr.id = $1`, [id]);
    if (gradeCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Calificación no encontrada', 404);
    }
    const grade = gradeCheck.rows[0];
    if (req.user?.role === 'admin_entity' && grade.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para eliminar esta calificación', 403);
    }
    if (req.user?.role === 'teacher' && grade.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para eliminar esta calificación', 403);
    }
    await (0, connection_1.query)('DELETE FROM grades_records WHERE id = $1', [id]);
    const response = {
        success: true,
        data: null,
        message: 'Calificación eliminada exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// ===============================
// ESTADÍSTICAS DE CALIFICACIONES
// ===============================
// GET - Obtener estadísticas de calificaciones por clase
exports.getGradeStatistics = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { class_id } = req.query;
    if (!class_id) {
        throw (0, errorHandler_1.createError)('class_id es requerido', 400);
    }
    // Validar permisos
    const classCheck = await (0, connection_1.query)(`SELECT entity_id, teacher_id FROM classes WHERE id = $1`, [class_id]);
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
    // Calcular estadísticas
    const statsResult = await (0, connection_1.query)(`SELECT 
       COUNT(DISTINCT gr.student_id) as total_students,
       COUNT(DISTINCT gr.assessment_id) as total_assessments,
       AVG(gr.score) as average_score,
       MIN(gr.score) as min_score,
       MAX(gr.score) as max_score,
       STDDEV(gr.score) as std_deviation
     FROM grades_records gr
     JOIN assessments a ON gr.assessment_id = a.id
     WHERE a.class_id = $1`, [class_id]);
    const response = {
        success: true,
        data: statsResult.rows[0],
        message: 'Estadísticas de calificaciones obtenidas exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
//# sourceMappingURL=grading.controller.js.map