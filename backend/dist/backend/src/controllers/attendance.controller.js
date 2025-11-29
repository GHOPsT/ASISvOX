"use strict";
// ===============================
// CONTROLADOR DE ASISTENCIA
// ===============================
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttendanceRecord = exports.updateAttendanceRecord = exports.recordAttendance = exports.getAttendanceRecords = exports.createAttendanceSession = exports.getAttendanceSession = exports.getAttendanceSessions = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const connection_1 = require("../config/connection");
// ===============================
// ATTENDANCE (Tabla única: attendance)
// ===============================
// GET - Listar registros de asistencia por clase y fecha
exports.getAttendanceSessions = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { class_id, start_date, end_date, page = 1, limit = 20 } = req.query;
    if (!class_id) {
        throw (0, errorHandler_1.createError)('class_id es requerido', 400);
    }
    // Validar que el usuario puede acceder a esta clase
    const classCheck = await (0, connection_1.query)(`SELECT entity_id, teacher_id FROM classes WHERE id = $1`, [class_id]);
    if (classCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Clase no encontrada', 404);
    }
    const classData = classCheck.rows[0];
    // REGLA: admin_entity solo ve su entidad, teacher solo sus clases, admin_general ve todo
    if (req.user?.role === 'admin_entity' && classData.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para acceder a esta clase', 403);
    }
    if (req.user?.role === 'teacher' && classData.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para acceder a esta clase', 403);
    }
    let whereClause = 'WHERE a.class_id = $1';
    const params = [class_id];
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
    const countResult = await (0, connection_1.query)(`SELECT COUNT(DISTINCT DATE(a.date)) as total FROM attendance a ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].total);
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const sessionsResult = await (0, connection_1.query)(`SELECT 
       DATE(a.date) as session_date,
       a.class_id,
       COUNT(*) as total_students,
       SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
       SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
       SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
       (ARRAY_AGG(DISTINCT a.recorded_by))[1] as created_by,
       MAX(a.created_at) as created_at
     FROM attendance a
     ${whereClause}
     GROUP BY DATE(a.date), a.class_id
     ORDER BY DATE(a.date) DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`, [...params, parseInt(limit), offset]);
    const response = {
        success: true,
        data: sessionsResult.rows,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
        },
        message: 'Sesiones de asistencia obtenidas exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// GET - Obtener detalles de una sesión de asistencia (por fecha)
exports.getAttendanceSession = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { class_id, date } = req.params;
    if (!class_id || !date) {
        throw (0, errorHandler_1.createError)('class_id y date son requeridos', 400);
    }
    const sessionResult = await (0, connection_1.query)(`SELECT a.*, c.teacher_id, c.entity_id
     FROM attendance a
     JOIN classes c ON a.class_id = c.id
     WHERE a.class_id = $1 AND DATE(a.date) = $2
     LIMIT 1`, [class_id, date]);
    if (sessionResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Sesión no encontrada', 404);
    }
    const session = sessionResult.rows[0];
    // Validar permisos
    if (req.user?.role === 'admin_entity' && session.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para acceder a esta sesión', 403);
    }
    if (req.user?.role === 'teacher' && session.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para acceder a esta sesión', 403);
    }
    // Obtener registros de asistencia para esa fecha
    const recordsResult = await (0, connection_1.query)(`SELECT a.id, a.class_id, a.student_id, a.status, a.notes, a.date, a.created_at,
            s.first_name, s.last_name
     FROM attendance a
     JOIN students s ON a.student_id = s.id
     WHERE a.class_id = $1 AND DATE(a.date) = $2
     ORDER BY s.first_name, s.last_name`, [class_id, date]);
    const response = {
        success: true,
        data: {
            session: session,
            records: recordsResult.rows,
        },
        message: 'Sesión de asistencia obtenida exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// POST - Crear sesión de asistencia (crear registros para todos los estudiantes de una clase en una fecha)
exports.createAttendanceSession = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { class_id, date } = req.body;
    if (!class_id || !date) {
        throw (0, errorHandler_1.createError)('class_id y date son requeridos', 400);
    }
    // Validar que el usuario puede crear sesión en esta clase
    const classCheck = await (0, connection_1.query)(`SELECT teacher_id, entity_id, section_id FROM classes WHERE id = $1`, [class_id]);
    if (classCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Clase no encontrada', 404);
    }
    const classData = classCheck.rows[0];
    if (req.user?.role === 'admin_entity' && classData.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para crear sesión en esta clase', 403);
    }
    if (req.user?.role === 'teacher' && classData.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para crear sesión en esta clase', 403);
    }
    // Obtener estudiantes activos de la sección
    const studentsResult = await (0, connection_1.query)(`SELECT s.id FROM students s
     JOIN enrollments e ON s.id = e.student_id
     WHERE e.section_id = $1 AND e.status = 'active'`, [classData.section_id]);
    const students = studentsResult.rows;
    // Crear registros de asistencia para todos los estudiantes (default: present)
    const createdRecords = [];
    for (const student of students) {
        const result = await (0, connection_1.query)(`INSERT INTO attendance (class_id, student_id, date, status, recorded_by)
       VALUES ($1, $2, $3, 'present', $4)
       ON CONFLICT (class_id, student_id, date) DO UPDATE SET updated_at = NOW()
       RETURNING id, class_id, student_id, date, status, created_at`, [class_id, student.id, date, req.user?.id]);
        createdRecords.push(result.rows[0]);
    }
    const response = {
        success: true,
        data: {
            session_date: date,
            class_id: class_id,
            total_students: createdRecords.length,
            records: createdRecords,
        },
        message: 'Sesión de asistencia creada exitosamente',
        timestamp: new Date(),
    };
    res.status(201).json(response);
});
// ===============================
// ATTENDANCE RECORDS
// ===============================
// GET - Obtener registros de asistencia
exports.getAttendanceRecords = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { class_id, date, student_id, status } = req.query;
    if (!class_id || !date) {
        throw (0, errorHandler_1.createError)('class_id y date son requeridos', 400);
    }
    // Validar permisos
    const classCheck = await (0, connection_1.query)(`SELECT teacher_id, entity_id
     FROM classes
     WHERE id = $1`, [class_id]);
    if (classCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Clase no encontrada', 404);
    }
    const classData = classCheck.rows[0];
    if (req.user?.role === 'admin_entity' && classData.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para acceder a estos registros', 403);
    }
    if (req.user?.role === 'teacher' && classData.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para acceder a estos registros', 403);
    }
    let whereClause = 'WHERE a.class_id = $1 AND DATE(a.date) = $2';
    const params = [class_id, date];
    let paramIndex = 3;
    if (status) {
        whereClause += ` AND a.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
    }
    if (student_id) {
        whereClause += ` AND a.student_id = $${paramIndex}`;
        params.push(student_id);
        paramIndex++;
    }
    const recordsResult = await (0, connection_1.query)(`SELECT a.id, a.class_id, a.student_id, a.status, a.notes, a.date, a.created_at,
            s.first_name, s.last_name, s.identification_number
     FROM attendance a
     JOIN students s ON a.student_id = s.id
     ${whereClause}
     ORDER BY s.first_name, s.last_name`, params);
    const response = {
        success: true,
        data: recordsResult.rows,
        message: 'Registros de asistencia obtenidos exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// POST - Registrar asistencia
exports.recordAttendance = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { class_id, student_id, date, status, notes } = req.body;
    if (!class_id || !student_id || !date || !status) {
        throw (0, errorHandler_1.createError)('class_id, student_id, date y status son requeridos', 400);
    }
    if (!['present', 'absent', 'late', 'excused'].includes(status)) {
        throw (0, errorHandler_1.createError)('Status debe ser: present, absent, late o excused', 400);
    }
    // Validar permisos
    const classCheck = await (0, connection_1.query)(`SELECT teacher_id, entity_id
     FROM classes
     WHERE id = $1`, [class_id]);
    if (classCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Clase no encontrada', 404);
    }
    const classData = classCheck.rows[0];
    if (req.user?.role === 'admin_entity' && classData.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para registrar asistencia', 403);
    }
    if (req.user?.role === 'teacher' && classData.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para registrar asistencia', 403);
    }
    // Insertar o actualizar registro
    const result = await (0, connection_1.query)(`INSERT INTO attendance (class_id, student_id, date, status, notes, recorded_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (class_id, student_id, date) DO UPDATE SET status = $4, notes = $5, updated_at = NOW()
     RETURNING id, class_id, student_id, date, status, notes, created_at`, [class_id, student_id, date, status, notes || null, req.user?.id]);
    const response = {
        success: true,
        data: result.rows[0],
        message: 'Asistencia registrada exitosamente',
        timestamp: new Date(),
    };
    res.status(201).json(response);
});
// PUT - Actualizar registro de asistencia
exports.updateAttendanceRecord = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { recordId } = req.params;
    const { status, notes } = req.body;
    // Validar permisos
    const recordCheck = await (0, connection_1.query)(`SELECT a.class_id, c.teacher_id, c.entity_id
     FROM attendance a
     JOIN classes c ON a.class_id = c.id
     WHERE a.id = $1`, [recordId]);
    if (recordCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Registro no encontrado', 404);
    }
    const record = recordCheck.rows[0];
    if (req.user?.role === 'admin_entity' && record.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para actualizar este registro', 403);
    }
    if (req.user?.role === 'teacher' && record.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para actualizar este registro', 403);
    }
    const result = await (0, connection_1.query)(`UPDATE attendance
     SET status = COALESCE($1, status), notes = COALESCE($2, notes), updated_at = NOW()
     WHERE id = $3
     RETURNING id, class_id, student_id, date, status, notes, created_at`, [status || null, notes || null, recordId]);
    const response = {
        success: true,
        data: result.rows[0],
        message: 'Registro actualizado exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// DELETE - Eliminar registro de asistencia
exports.deleteAttendanceRecord = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { recordId } = req.params;
    // Validar permisos
    const recordCheck = await (0, connection_1.query)(`SELECT a.class_id, c.teacher_id, c.entity_id
     FROM attendance a
     JOIN classes c ON a.class_id = c.id
     WHERE a.id = $1`, [recordId]);
    if (recordCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Registro no encontrado', 404);
    }
    const record = recordCheck.rows[0];
    if (req.user?.role === 'admin_entity' && record.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para eliminar este registro', 403);
    }
    if (req.user?.role === 'teacher' && record.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para eliminar este registro', 403);
    }
    await (0, connection_1.query)(`DELETE FROM attendance WHERE id = $1`, [recordId]);
    const response = {
        success: true,
        data: null,
        message: 'Registro eliminado exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
//# sourceMappingURL=attendance.controller.js.map