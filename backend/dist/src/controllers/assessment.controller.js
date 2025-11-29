"use strict";
// ===============================
// CONTROLADOR DE EVALUACIONES
// ===============================
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssessmentTypes = exports.deleteAssessment = exports.updateAssessment = exports.createAssessment = exports.getAssessment = exports.getAssessments = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const connection_1 = require("../config/connection");
// ===============================
// ASSESSMENTS
// ===============================
// GET - Listar evaluaciones
exports.getAssessments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { classId, typeId, page = 1, limit = 20 } = req.query;
    if (!classId) {
        throw (0, errorHandler_1.createError)('classId es requerido', 400);
    }
    // Validar que el usuario puede acceder a esta clase
    const classCheck = await (0, connection_1.query)(`SELECT entity_id, teacher_id FROM classes WHERE id = $1`, [classId]);
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
    const params = [classId];
    let paramIndex = 2;
    if (typeId) {
        whereClause += ` AND a.assessment_type_id = $${paramIndex}`;
        params.push(typeId);
        paramIndex++;
    }
    const countResult = await (0, connection_1.query)(`SELECT COUNT(*) as total FROM assessments a ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].total);
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const assessmentsResult = await (0, connection_1.query)(`SELECT a.id, a.class_id, a.assessment_type_id, a.title, a.description, 
            a.due_date, a.total_points, a.is_active, a.created_at, a.updated_at,
            at.name as type_name
     FROM assessments a
     LEFT JOIN assessment_types at ON a.assessment_type_id = at.id
     ${whereClause}
     ORDER BY a.due_date DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`, [...params, parseInt(limit), offset]);
    const response = {
        success: true,
        data: assessmentsResult.rows,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
        },
        message: 'Evaluaciones obtenidas exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// GET - Obtener detalles de una evaluación
exports.getAssessment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { assessmentId } = req.params;
    const assessmentResult = await (0, connection_1.query)(`SELECT a.*, at.name as type_name, c.teacher_id, c.entity_id
     FROM assessments a
     LEFT JOIN assessment_types at ON a.assessment_type_id = at.id
     JOIN classes c ON a.class_id = c.id
     WHERE a.id = $1`, [assessmentId]);
    if (assessmentResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Evaluación no encontrada', 404);
    }
    const assessment = assessmentResult.rows[0];
    // Validar permisos
    if (req.user?.role === 'admin_entity' && assessment.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para acceder a esta evaluación', 403);
    }
    if (req.user?.role === 'teacher' && assessment.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para acceder a esta evaluación', 403);
    }
    const response = {
        success: true,
        data: assessment,
        message: 'Evaluación obtenida exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// POST - Crear evaluación
exports.createAssessment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { classId, assessmentTypeId, title, description, dueDate, totalPoints } = req.body;
    if (!classId || !title || !totalPoints) {
        throw (0, errorHandler_1.createError)('classId, title y totalPoints son requeridos', 400);
    }
    // Validar que el usuario puede crear evaluación en esta clase
    const classCheck = await (0, connection_1.query)(`SELECT teacher_id, entity_id FROM classes WHERE id = $1`, [classId]);
    if (classCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Clase no encontrada', 404);
    }
    const classData = classCheck.rows[0];
    if (req.user?.role === 'admin_entity' && classData.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para crear evaluación en esta clase', 403);
    }
    if (req.user?.role === 'teacher' && classData.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para crear evaluación en esta clase', 403);
    }
    const result = await (0, connection_1.query)(`INSERT INTO assessments (class_id, assessment_type_id, title, description, due_date, total_points)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, class_id, assessment_type_id, title, description, due_date, total_points, created_at`, [classId, assessmentTypeId || null, title, description || null, dueDate || null, totalPoints]);
    const response = {
        success: true,
        data: result.rows[0],
        message: 'Evaluación creada exitosamente',
        timestamp: new Date(),
    };
    res.status(201).json(response);
});
// PUT - Actualizar evaluación
exports.updateAssessment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { assessmentId } = req.params;
    const { title, description, dueDate, totalPoints, isActive } = req.body;
    // Validar permisos
    const assessmentCheck = await (0, connection_1.query)(`SELECT a.class_id, c.teacher_id, c.entity_id
     FROM assessments a
     JOIN classes c ON a.class_id = c.id
     WHERE a.id = $1`, [assessmentId]);
    if (assessmentCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Evaluación no encontrada', 404);
    }
    const assessment = assessmentCheck.rows[0];
    if (req.user?.role === 'admin_entity' && assessment.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para actualizar esta evaluación', 403);
    }
    if (req.user?.role === 'teacher' && assessment.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para actualizar esta evaluación', 403);
    }
    const result = await (0, connection_1.query)(`UPDATE assessments
     SET title = COALESCE($1, title), 
         description = COALESCE($2, description),
         due_date = COALESCE($3, due_date),
         total_points = COALESCE($4, total_points),
         is_active = COALESCE($5, is_active),
         updated_at = NOW()
     WHERE id = $6
     RETURNING id, class_id, assessment_type_id, title, description, due_date, total_points, is_active, updated_at`, [title || null, description || null, dueDate || null, totalPoints || null, isActive !== undefined ? isActive : null, assessmentId]);
    const response = {
        success: true,
        data: result.rows[0],
        message: 'Evaluación actualizada exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// DELETE - Eliminar evaluación
exports.deleteAssessment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { assessmentId } = req.params;
    // Validar permisos
    const assessmentCheck = await (0, connection_1.query)(`SELECT a.class_id, c.teacher_id, c.entity_id
     FROM assessments a
     JOIN classes c ON a.class_id = c.id
     WHERE a.id = $1`, [assessmentId]);
    if (assessmentCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Evaluación no encontrada', 404);
    }
    const assessment = assessmentCheck.rows[0];
    if (req.user?.role === 'admin_entity' && assessment.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para eliminar esta evaluación', 403);
    }
    if (req.user?.role === 'teacher' && assessment.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para eliminar esta evaluación', 403);
    }
    await (0, connection_1.query)('DELETE FROM assessments WHERE id = $1', [assessmentId]);
    const response = {
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
exports.getAssessmentTypes = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const typesResult = await (0, connection_1.query)(`SELECT id, name, description, is_active
     FROM assessment_types
     WHERE is_active = true
     ORDER BY name ASC`);
    const response = {
        success: true,
        data: typesResult.rows,
        message: 'Tipos de evaluación obtenidos exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
//# sourceMappingURL=assessment.controller.js.map