"use strict";
// ===============================
// CONTROLADOR DE ASISTENCIA
// ===============================
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAttendanceRecord = exports.recordAttendance = exports.getAttendanceRecords = exports.createAttendanceSession = exports.getAttendanceSession = exports.getAttendanceSessions = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const connection_1 = require("../config/connection");
// ===============================
// ATTENDANCE SESSIONS
// ===============================
// GET - Listar sesiones de asistencia
exports.getAttendanceSessions = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { classId, startDate, endDate, page = 1, limit = 20 } = req.query;
    if (!classId) {
        throw (0, errorHandler_1.createError)('classId es requerido', 400);
    }
    // Validar que el usuario puede acceder a esta clase
    let classCheck = await (0, connection_1.query)(`SELECT entity_id, teacher_id FROM classes WHERE id = $1`, [classId]);
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
    const params = [classId];
    let paramIndex = 2;
    if (startDate) {
        whereClause += ` AND DATE(a.session_date) >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
    }
    if (endDate) {
        whereClause += ` AND DATE(a.session_date) <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
    }
    const countResult = await (0, connection_1.query)(`SELECT COUNT(*) as total FROM attendance_sessions a ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].total);
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const sessionsResult = await (0, connection_1.query)(`SELECT id, class_id, session_date, created_by, total_students, 
            present_count, absent_count, late_count, created_at
     FROM attendance_sessions
     ${whereClause}
     ORDER BY session_date DESC
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
// GET - Obtener detalles de una sesión de asistencia
exports.getAttendanceSession = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { sessionId } = req.params;
    const sessionResult = await (0, connection_1.query)(`SELECT a.*, c.teacher_id, c.entity_id
     FROM attendance_sessions a
     JOIN classes c ON a.class_id = c.id
     WHERE a.id = $1`, [sessionId]);
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
    // Obtener registros de asistencia
    const recordsResult = await (0, connection_1.query)(`SELECT ar.id, ar.attendance_session_id, ar.student_id, ar.status,
            s.first_name, s.last_name
     FROM attendance_records ar
     JOIN students s ON ar.student_id = s.id
     WHERE ar.attendance_session_id = $1
     ORDER BY s.first_name, s.last_name`, [sessionId]);
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
// POST - Crear sesión de asistencia
exports.createAttendanceSession = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { classId, sessionDate } = req.body;
    if (!classId || !sessionDate) {
        throw (0, errorHandler_1.createError)('classId y sessionDate son requeridos', 400);
    }
    // Validar que el usuario puede crear sesión en esta clase
    const classCheck = await (0, connection_1.query)(`SELECT teacher_id, entity_id FROM classes WHERE id = $1`, [classId]);
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
    // Obtener estudiantes de la sección
    const studentsResult = await (0, connection_1.query)(`SELECT COUNT(*) as total FROM enrollments
     WHERE section_id = (SELECT section_id FROM classes WHERE id = $1)
     AND status = 'active'`, [classId]);
    const totalStudents = parseInt(studentsResult.rows[0].total);
    // Crear sesión
    const sessionResult = await (0, connection_1.query)(`INSERT INTO attendance_sessions (class_id, session_date, created_by, total_students)
     VALUES ($1, $2, $3, $4)
     RETURNING id, class_id, session_date, created_by, total_students, created_at`, [classId, sessionDate, req.user?.id, totalStudents]);
    const response = {
        success: true,
        data: sessionResult.rows[0],
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
    const { sessionId, studentId, status } = req.query;
    if (!sessionId) {
        throw (0, errorHandler_1.createError)('sessionId es requerido', 400);
    }
    // Validar permisos
    const sessionCheck = await (0, connection_1.query)(`SELECT a.class_id, c.teacher_id, c.entity_id
     FROM attendance_sessions a
     JOIN classes c ON a.class_id = c.id
     WHERE a.id = $1`, [sessionId]);
    if (sessionCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Sesión no encontrada', 404);
    }
    const session = sessionCheck.rows[0];
    if (req.user?.role === 'admin_entity' && session.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para acceder a estos registros', 403);
    }
    if (req.user?.role === 'teacher' && session.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para acceder a estos registros', 403);
    }
    let whereClause = 'WHERE ar.attendance_session_id = $1';
    const params = [sessionId];
    let paramIndex = 2;
    if (status) {
        whereClause += ` AND ar.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
    }
    if (studentId) {
        whereClause += ` AND ar.student_id = $${paramIndex}`;
        params.push(studentId);
        paramIndex++;
    }
    const recordsResult = await (0, connection_1.query)(`SELECT ar.id, ar.attendance_session_id, ar.student_id, ar.status, ar.notes, ar.created_at,
            s.first_name, s.last_name, s.identification_number
     FROM attendance_records ar
     JOIN students s ON ar.student_id = s.id
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
    const { sessionId, studentId, status, notes } = req.body;
    if (!sessionId || !studentId || !status) {
        throw (0, errorHandler_1.createError)('sessionId, studentId y status son requeridos', 400);
    }
    if (!['present', 'absent', 'late', 'justified_absence'].includes(status)) {
        throw (0, errorHandler_1.createError)('Status debe ser: present, absent, late o justified_absence', 400);
    }
    // Validar permisos
    const sessionCheck = await (0, connection_1.query)(`SELECT a.class_id, c.teacher_id, c.entity_id
     FROM attendance_sessions a
     JOIN classes c ON a.class_id = c.id
     WHERE a.id = $1`, [sessionId]);
    if (sessionCheck.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Sesión no encontrada', 404);
    }
    const session = sessionCheck.rows[0];
    if (req.user?.role === 'admin_entity' && session.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permiso para registrar asistencia', 403);
    }
    if (req.user?.role === 'teacher' && session.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permiso para registrar asistencia', 403);
    }
    // Verificar si ya existe registro
    const existingRecord = await (0, connection_1.query)(`SELECT id FROM attendance_records
     WHERE attendance_session_id = $1 AND student_id = $2`, [sessionId, studentId]);
    let result;
    if (existingRecord.rows.length > 0) {
        // Actualizar registro existente
        result = await (0, connection_1.query)(`UPDATE attendance_records
       SET status = $1, notes = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, attendance_session_id, student_id, status, notes, created_at`, [status, notes || null, existingRecord.rows[0].id]);
    }
    else {
        // Crear nuevo registro
        result = await (0, connection_1.query)(`INSERT INTO attendance_records (attendance_session_id, student_id, status, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING id, attendance_session_id, student_id, status, notes, created_at`, [sessionId, studentId, status, notes || null]);
    }
    // Actualizar estadísticas de sesión
    const statsResult = await (0, connection_1.query)(`SELECT 
       COUNT(*) as total,
       SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
       SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
       SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count
     FROM attendance_records
     WHERE attendance_session_id = $1`, [sessionId]);
    const stats = statsResult.rows[0];
    await (0, connection_1.query)(`UPDATE attendance_sessions
     SET present_count = $1, absent_count = $2, late_count = $3
     WHERE id = $4`, [stats.present_count || 0, stats.absent_count || 0, stats.late_count || 0, sessionId]);
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
    const recordCheck = await (0, connection_1.query)(`SELECT ar.attendance_session_id, a.class_id, c.teacher_id, c.entity_id
     FROM attendance_records ar
     JOIN attendance_sessions a ON ar.attendance_session_id = a.id
     JOIN classes c ON a.class_id = c.id
     WHERE ar.id = $1`, [recordId]);
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
    const result = await (0, connection_1.query)(`UPDATE attendance_records
     SET status = COALESCE($1, status), notes = COALESCE($2, notes), updated_at = NOW()
     WHERE id = $3
     RETURNING id, attendance_session_id, student_id, status, notes, created_at`, [status || null, notes || null, recordId]);
    const response = {
        success: true,
        data: result.rows[0],
        message: 'Registro actualizado exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
//# sourceMappingURL=attendance.controller.js.map