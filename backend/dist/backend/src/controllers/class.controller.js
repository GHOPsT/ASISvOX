"use strict";
// ===============================
// CONTROLADOR DE CLASES
// ===============================
Object.defineProperty(exports, "__esModule", { value: true });
exports.addStudentsToClass = exports.deleteSchedule = exports.updateSchedule = exports.getSchedules = exports.createSchedules = exports.getTeacherClasses = exports.getClassStudents = exports.deleteClass = exports.updateClass = exports.createClass = exports.getClassById = exports.getClasses = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const connection_1 = require("../config/connection");
// ===============================
// FUNCIONES DE BASE DE DATOS
// ===============================
// Buscar clase con detalles completos
const findClassWithDetails = async (classId) => {
    const result = await (0, connection_1.query)(`SELECT 
        c.id, c.entity_id, c.section_id, c.subject_id, c.teacher_id, 
        c.academic_year_id, c.classroom, c.weeks_duration, c.is_active, c.created_at, c.updated_at,
        sub.name as subject_name, sub.code as subject_code,
        sec.name as section_name, g.name as grade_name,
        ay.name as academic_year_name,
        u.full_name as teacher_name, u.email as teacher_email,
        e.name as entity_name,
        COUNT(DISTINCT CASE WHEN en.student_id IS NOT NULL THEN en.student_id END) as student_count,
        0 as average_grade
     FROM classes c
     JOIN subjects sub ON c.subject_id = sub.id
     JOIN sections sec ON c.section_id = sec.id
     JOIN grades g ON sec.grade_id = g.id
     JOIN academic_years ay ON c.academic_year_id = ay.id
     JOIN users u ON c.teacher_id = u.id
     JOIN entities e ON c.entity_id = e.id
     LEFT JOIN enrollments en ON sec.id = en.section_id 
       AND en.academic_year_id = c.academic_year_id 
       AND en.status = 'active'
     WHERE c.id = $1
     GROUP BY c.id, sub.id, sec.id, g.id, ay.id, u.id, e.id`, [classId]);
    return result.rows[0];
};
// Convertir clase BD a formato respuesta
const mapClassToResponse = (dbClass) => {
    return {
        id: dbClass.id,
        entityId: dbClass.entity_id,
        name: `${dbClass.subject_name} ${dbClass.grade_name}°${dbClass.section_name}`,
        subject: dbClass.subject_name,
        teacherId: dbClass.teacher_id,
        teacher: {
            id: dbClass.teacher_id,
            name: dbClass.teacher_name,
            email: dbClass.teacher_email,
            role: 'teacher',
            entityId: dbClass.entity_id,
            status: 'active',
            subjects: [dbClass.subject_name],
            classes: [dbClass.id],
            totalStudents: 0,
            lastActivity: new Date(),
            schedule: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        students: [],
        classroom: dbClass.classroom,
        weeksDuration: dbClass.weeks_duration || 52,
        studentCount: parseInt(dbClass.student_count) || 0,
        averageGrade: parseFloat(dbClass.average_grade) || 0,
        academicYear: dbClass.academic_year_name,
        isActive: dbClass.is_active,
        schedules: dbClass.schedules && Array.isArray(dbClass.schedules)
            ? dbClass.schedules.filter((sch) => sch && sch.id)
            : [],
        createdAt: new Date(dbClass.created_at),
        updatedAt: new Date(dbClass.updated_at),
    };
};
// ===============================
// CONTROLADORES
// ===============================
// GET - Listar clases con filtros
exports.getClasses = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10, teacherId, entityId, subject, isActive = 'true' } = req.query;
    let whereClause = 'WHERE c.is_active = $1';
    const params = [isActive === 'true'];
    let paramIndex = 2;
    // REGLA: admin_entity ve solo su entidad, teacher ve solo sus clases
    if (req.user?.role === 'admin_entity') {
        whereClause += ` AND c.entity_id = $${paramIndex}`;
        params.push(req.user.entityId);
        paramIndex++;
    }
    else if (req.user?.role === 'teacher') {
        whereClause += ` AND c.teacher_id = $${paramIndex}`;
        params.push(req.user.id);
        paramIndex++;
    }
    // Filtro adicional por teacher
    if (teacherId && req.user?.role === 'admin_general') {
        whereClause += ` AND c.teacher_id = $${paramIndex}`;
        params.push(teacherId);
        paramIndex++;
    }
    // Filtro por subject
    if (subject) {
        whereClause += ` AND sub.name ILIKE $${paramIndex}`;
        params.push(`%${subject}%`);
        paramIndex++;
    }
    // Query para contar total
    const countQuery = `
    SELECT COUNT(DISTINCT c.id) as total
    FROM classes c
    JOIN subjects sub ON c.subject_id = sub.id
    ${whereClause}
  `;
    const countResult = await (0, connection_1.query)(countQuery, params.slice(0, paramIndex - 1));
    const total = parseInt(countResult.rows[0].total);
    // Query principal con paginación
    const classesQuery = `
    SELECT 
      c.id, c.entity_id, c.section_id, c.subject_id, c.teacher_id, 
      c.academic_year_id, c.classroom, c.weeks_duration, c.is_active, c.created_at, c.updated_at,
      sub.name as subject_name, sub.code as subject_code,
      sec.name as section_name, g.name as grade_name,
      ay.name as academic_year_name,
      u.full_name as teacher_name, u.email as teacher_email,
      e.name as entity_name,
      COUNT(DISTINCT CASE WHEN en.student_id IS NOT NULL THEN en.student_id END) as student_count,
      0 as average_grade,
      json_agg(json_build_object(
        'id', sch.id,
        'classId', sch.class_id,
        'dayOfWeek', sch.day_of_week,
        'startTime', sch.start_time,
        'endTime', sch.end_time
      ) ORDER BY sch.day_of_week) FILTER (WHERE sch.id IS NOT NULL) as schedules
    FROM classes c
    JOIN subjects sub ON c.subject_id = sub.id
    JOIN sections sec ON c.section_id = sec.id
    JOIN grades g ON sec.grade_id = g.id
    JOIN academic_years ay ON c.academic_year_id = ay.id
    JOIN users u ON c.teacher_id = u.id
    JOIN entities e ON c.entity_id = e.id
    LEFT JOIN enrollments en ON sec.id = en.section_id 
      AND en.academic_year_id = c.academic_year_id 
      AND en.status = 'active'
    LEFT JOIN schedules sch ON c.id = sch.class_id
    ${whereClause}
    GROUP BY c.id, sub.id, sec.id, g.id, ay.id, u.id, e.id
    ORDER BY c.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);
    const classesResult = await (0, connection_1.query)(classesQuery, params);
    const classes = classesResult.rows.map(mapClassToResponse);
    const response = {
        success: true,
        data: classes,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
        },
        message: 'Clases obtenidas exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// GET - Obtener clase por ID
exports.getClassById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const dbClass = await findClassWithDetails(id);
    if (!dbClass) {
        throw (0, errorHandler_1.createError)('Clase no encontrada', 404);
    }
    // REGLA: Validar permisos
    if (req.user?.role === 'admin_entity' && dbClass.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permisos para ver esta clase', 403);
    }
    if (req.user?.role === 'teacher' && dbClass.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permisos para ver esta clase', 403);
    }
    const classData = mapClassToResponse(dbClass);
    const response = {
        success: true,
        data: classData,
        message: 'Clase obtenida exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// POST - Crear clase (⭐ AUTO-ASIGNACIÓN PARA TEACHERS)
exports.createClass = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { subject_id, section_id, academic_year_id, classroom, weeks_duration } = req.body;
    // Validaciones básicas
    if (!subject_id || !section_id || !academic_year_id) {
        throw (0, errorHandler_1.createError)('subject_id, section_id y academic_year_id son requeridos', 400);
    }
    // Validar weeks_duration si se proporciona
    const weeksValue = weeks_duration ? parseInt(weeks_duration, 10) : 52;
    if (isNaN(weeksValue) || weeksValue < 1 || weeksValue > 52) {
        throw (0, errorHandler_1.createError)('weeksDuration debe ser un número entre 1 y 52', 400);
    }
    // ⭐ REGLA: Solo teachers pueden crear clases (auto-asignadas)
    if (req.user?.role !== 'teacher') {
        throw (0, errorHandler_1.createError)('Solo teachers pueden crear clases', 403);
    }
    // REGLA: Teacher debe tener entityId
    // Tanto profesores de entidad como independientes tienen entity_id asignado
    if (!req.user.entityId) {
        throw (0, errorHandler_1.createError)('Profesor debe estar asociado a una entidad o ser independiente con entidad asignada', 400);
    }
    // Validar que la sección existe y pertenece a la entidad
    const sectionResult = await (0, connection_1.query)(`SELECT sec.id, sec.grade_id 
     FROM sections sec
     JOIN grades g ON sec.grade_id = g.id
     WHERE sec.id = $1 AND sec.academic_year_id = $2`, [section_id, academic_year_id]);
    if (sectionResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Sección no encontrada', 404);
    }
    // Validar que la materia existe
    const subjectResult = await (0, connection_1.query)('SELECT id FROM subjects WHERE id = $1 AND is_active = true', [subject_id]);
    if (subjectResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Materia no encontrada o no está activa', 404);
    }
    // Validar que el año académico existe
    const yearResult = await (0, connection_1.query)('SELECT id FROM academic_years WHERE id = $1', [academic_year_id]);
    if (yearResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Año académico no encontrado', 404);
    }
    // REGLA: Crear clase con auto-asignación
    // teacher_id = req.user.id (el profesor que crea)
    // entity_id = req.user.entityId (la entidad del profesor)
    try {
        const createResult = await (0, connection_1.query)(`INSERT INTO classes (section_id, subject_id, teacher_id, academic_year_id, entity_id, classroom, weeks_duration, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING id, entity_id, section_id, subject_id, teacher_id, academic_year_id, classroom, weeks_duration, is_active, created_at, updated_at`, [section_id, subject_id, req.user.id, academic_year_id, req.user.entityId, classroom || null, weeksValue]);
        if (createResult.rows.length === 0) {
            throw (0, errorHandler_1.createError)('Error al crear la clase', 500);
        }
        const newClass = createResult.rows[0];
        // Obtener detalles completos de la clase
        const fullClass = await findClassWithDetails(newClass.id);
        const classData = mapClassToResponse(fullClass);
        const response = {
            success: true,
            data: classData,
            message: `Clase creada exitosamente y asignada a ${req.user.email}`,
            timestamp: new Date(),
        };
        res.status(201).json(response);
    }
    catch (error) {
        // Manejar violación de UNIQUE constraint
        if (error.code === '23505') {
            throw (0, errorHandler_1.createError)('Ya existe una clase con esta combinación de sección, materia y año académico', 409);
        }
        throw error;
    }
});
// PUT - Actualizar clase
exports.updateClass = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { classroom, isActive, weeksDuration } = req.body;
    const dbClass = await findClassWithDetails(id);
    if (!dbClass) {
        throw (0, errorHandler_1.createError)('Clase no encontrada', 404);
    }
    // REGLA: Solo el profesor asignado puede actualizar, o admin_general
    if (req.user?.role === 'teacher' && dbClass.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permisos para actualizar esta clase', 403);
    }
    if (req.user?.role === 'admin_entity' && dbClass.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permisos para actualizar esta clase', 403);
    }
    // Validar weeksDuration si se proporciona
    if (weeksDuration !== undefined) {
        const weeksValue = weeksDuration ? parseInt(weeksDuration, 10) : 52;
        if (isNaN(weeksValue) || weeksValue < 1 || weeksValue > 52) {
            throw (0, errorHandler_1.createError)('weeksDuration debe ser un número entre 1 y 52', 400);
        }
    }
    // Construir UPDATE dinámico
    const updates = [];
    const values = [];
    let paramCount = 1;
    if (classroom !== undefined) {
        updates.push(`classroom = $${paramCount}`);
        values.push(classroom);
        paramCount++;
    }
    if (isActive !== undefined) {
        updates.push(`is_active = $${paramCount}`);
        values.push(isActive);
        paramCount++;
    }
    if (weeksDuration !== undefined) {
        updates.push(`weeks_duration = $${paramCount}`);
        values.push(parseInt(weeksDuration, 10));
        paramCount++;
    }
    if (updates.length === 0) {
        throw (0, errorHandler_1.createError)('No hay campos para actualizar', 400);
    }
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    const updateResult = await (0, connection_1.query)(`UPDATE classes 
     SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING id, entity_id, section_id, subject_id, teacher_id, academic_year_id, classroom, weeks_duration, is_active, created_at, updated_at`, values);
    const updatedClass = await findClassWithDetails(updateResult.rows[0].id);
    const classData = mapClassToResponse(updatedClass);
    const response = {
        success: true,
        data: classData,
        message: 'Clase actualizada exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// DELETE - Eliminar clase
exports.deleteClass = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const dbClass = await findClassWithDetails(id);
    if (!dbClass) {
        throw (0, errorHandler_1.createError)('Clase no encontrada', 404);
    }
    // REGLA: Solo admin_general o el profesor asignado puede eliminar
    if (req.user?.role === 'teacher' && dbClass.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permisos para eliminar esta clase', 403);
    }
    if (req.user?.role === 'admin_entity' && dbClass.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permisos para eliminar esta clase', 403);
    }
    await (0, connection_1.query)('DELETE FROM classes WHERE id = $1', [id]);
    const response = {
        success: true,
        message: 'Clase eliminada exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// GET - Obtener estudiantes de una clase
exports.getClassStudents = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const dbClass = await findClassWithDetails(id);
    if (!dbClass) {
        throw (0, errorHandler_1.createError)('Clase no encontrada', 404);
    }
    // REGLA: Validar permisos
    if (req.user?.role === 'teacher' && dbClass.teacher_id !== req.user.id) {
        throw (0, errorHandler_1.createError)('No tienes permisos para ver los estudiantes de esta clase', 403);
    }
    if (req.user?.role === 'admin_entity' && dbClass.entity_id !== req.user.entityId) {
        throw (0, errorHandler_1.createError)('No tienes permisos para ver los estudiantes de esta clase', 403);
    }
    const studentsResult = await (0, connection_1.query)(`SELECT DISTINCT s.id, s.first_name, s.last_name, s.identification_number, s.email, s.phone
     FROM students s
     JOIN enrollments e ON s.id = e.student_id
     WHERE e.section_id = $1 AND e.academic_year_id = $2 AND e.status = 'active'
     ORDER BY s.last_name, s.first_name`, [dbClass.section_id, dbClass.academic_year_id]);
    const students = studentsResult.rows.map(row => ({
        id: row.id,
        name: `${row.first_name} ${row.last_name}`,
        identificationNumber: row.identification_number,
        email: row.email,
        phone: row.phone,
    }));
    const response = {
        success: true,
        data: students,
        message: 'Estudiantes obtenidos exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// GET - Obtener clases de un docente específico (para dashboard)
exports.getTeacherClasses = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { teacherId } = req.params;
    // REGLA: Un teacher solo puede ver sus propias clases
    // Un admin_general o admin_entity puede ver las clases de cualquier teacher
    if (req.user?.role === 'teacher' && req.user.id !== teacherId) {
        throw (0, errorHandler_1.createError)('No tienes permisos para acceder a este recurso', 403);
    }
    // Verificar que el docente existe
    const teacherResult = await (0, connection_1.query)(`SELECT id, full_name, email, role, entity_id
     FROM users
     WHERE id = $1 AND role = 'teacher' AND is_active = true`, [teacherId]);
    if (teacherResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Docente no encontrado', 404);
    }
    const teacher = teacherResult.rows[0];
    // Obtener las clases del docente con información completa
    const classesQuery = `
    SELECT 
      c.id, c.entity_id, c.section_id, c.subject_id, c.teacher_id, 
      c.academic_year_id, c.classroom, c.weeks_duration, c.is_active, c.created_at, c.updated_at,
      sub.name as subject_name, sub.code as subject_code,
      sec.name as section_name, g.name as grade_name,
      ay.name as academic_year_name, ay.is_current,
      u.full_name as teacher_name, u.email as teacher_email,
      e.name as entity_name,
      COUNT(DISTINCT CASE WHEN en.student_id IS NOT NULL THEN en.student_id END) as student_count,
      0 as average_grade
    FROM classes c
    JOIN subjects sub ON c.subject_id = sub.id
    JOIN sections sec ON c.section_id = sec.id
    JOIN grades g ON sec.grade_id = g.id
    JOIN academic_years ay ON c.academic_year_id = ay.id
    JOIN users u ON c.teacher_id = u.id
    JOIN entities e ON c.entity_id = e.id
    LEFT JOIN enrollments en ON sec.id = en.section_id 
      AND en.academic_year_id = c.academic_year_id 
      AND en.status = 'active'
    WHERE c.teacher_id = $1 AND c.is_active = true
    GROUP BY c.id, sub.id, sec.id, g.id, ay.id, u.id, e.id
    ORDER BY ay.is_current DESC, c.created_at DESC
  `;
    const classesResult = await (0, connection_1.query)(classesQuery, [teacherId]);
    const classes = classesResult.rows.map(mapClassToResponse);
    const response = {
        success: true,
        data: classes,
        message: 'Clases del docente obtenidas exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// ===============================
// ENDPOINTS DE HORARIOS
// ===============================
// Crear horarios para una clase
exports.createSchedules = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { classId } = req.params;
    const { schedules } = req.body;
    if (!classId || !schedules || !Array.isArray(schedules) || schedules.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'classId y schedules (array no vacío) son requeridos',
            timestamp: new Date(),
        });
    }
    // Validar que la clase existe y pertenece al usuario o su entidad
    const classResult = await (0, connection_1.query)('SELECT id, entity_id, teacher_id FROM classes WHERE id = $1', [classId]);
    if (classResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Clase no encontrada',
            timestamp: new Date(),
        });
    }
    const dbClass = classResult.rows[0];
    // Validar permisos: el usuario debe ser el profesor o admin de la entidad
    if (req.user.role === 'teacher' && dbClass.teacher_id !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'No tiene permiso para agregar horarios a esta clase',
            timestamp: new Date(),
        });
    }
    // Validar cada horario
    const createdSchedules = [];
    for (const schedule of schedules) {
        const { day_of_week, start_time, end_time } = schedule;
        // Validar campos requeridos
        if (day_of_week === undefined || !start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'Cada horario debe tener: day_of_week, start_time, end_time',
                timestamp: new Date(),
            });
        }
        // Validar day_of_week (0-6)
        if (!Number.isInteger(day_of_week) || day_of_week < 0 || day_of_week > 6) {
            return res.status(400).json({
                success: false,
                message: 'day_of_week debe ser un número entre 0 (domingo) y 6 (sábado)',
                timestamp: new Date(),
            });
        }
        // Validar que end_time > start_time
        if (end_time <= start_time) {
            return res.status(400).json({
                success: false,
                message: `La hora de fin debe ser mayor que la hora de inicio (${start_time} - ${end_time})`,
                timestamp: new Date(),
            });
        }
        // Validar que no exista un horario duplicado para el mismo día
        const existingSchedule = await (0, connection_1.query)('SELECT id FROM schedules WHERE class_id = $1 AND day_of_week = $2', [classId, day_of_week]);
        if (existingSchedule.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Ya existe un horario para el día ${day_of_week}`,
                timestamp: new Date(),
            });
        }
        // Insertar el horario
        const scheduleResult = await (0, connection_1.query)(`INSERT INTO schedules (class_id, day_of_week, start_time, end_time, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, class_id, day_of_week, start_time, end_time, created_at, updated_at`, [classId, day_of_week, start_time, end_time]);
        createdSchedules.push(scheduleResult.rows[0]);
    }
    const response = {
        success: true,
        data: createdSchedules,
        message: `${createdSchedules.length} horarios creados exitosamente`,
        timestamp: new Date(),
    };
    res.status(201).json(response);
});
// Obtener horarios de una clase
exports.getSchedules = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { classId } = req.params;
    if (!classId) {
        return res.status(400).json({
            success: false,
            message: 'classId es requerido',
            timestamp: new Date(),
        });
    }
    // Validar que la clase existe
    const classResult = await (0, connection_1.query)('SELECT id, entity_id, teacher_id FROM classes WHERE id = $1', [classId]);
    if (classResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Clase no encontrada',
            timestamp: new Date(),
        });
    }
    // Obtener los horarios
    const schedulesResult = await (0, connection_1.query)(`SELECT id, class_id, day_of_week, start_time, end_time, created_at, updated_at
     FROM schedules
     WHERE class_id = $1
     ORDER BY day_of_week ASC, start_time ASC`, [classId]);
    const response = {
        success: true,
        data: schedulesResult.rows,
        message: 'Horarios obtenidos exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// Actualizar un horario
exports.updateSchedule = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { classId, scheduleId } = req.params;
    const { day_of_week, start_time, end_time } = req.body;
    if (!classId || !scheduleId) {
        return res.status(400).json({
            success: false,
            message: 'classId y scheduleId son requeridos',
            timestamp: new Date(),
        });
    }
    // Validar que la clase existe y pertenece al usuario o su entidad
    const classResult = await (0, connection_1.query)('SELECT id, entity_id, teacher_id FROM classes WHERE id = $1', [classId]);
    if (classResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Clase no encontrada',
            timestamp: new Date(),
        });
    }
    const dbClass = classResult.rows[0];
    // Validar permisos
    if (req.user.role === 'teacher' && dbClass.teacher_id !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'No tiene permiso para actualizar horarios de esta clase',
            timestamp: new Date(),
        });
    }
    // Validar que el horario existe
    const scheduleResult = await (0, connection_1.query)('SELECT id FROM schedules WHERE id = $1 AND class_id = $2', [scheduleId, classId]);
    if (scheduleResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Horario no encontrado',
            timestamp: new Date(),
        });
    }
    // Validar que end_time > start_time si se actualizan
    if (start_time && end_time && end_time <= start_time) {
        return res.status(400).json({
            success: false,
            message: 'La hora de fin debe ser mayor que la hora de inicio',
            timestamp: new Date(),
        });
    }
    // Actualizar el horario
    const updatedScheduleResult = await (0, connection_1.query)(`UPDATE schedules 
     SET day_of_week = COALESCE($1, day_of_week),
         start_time = COALESCE($2, start_time),
         end_time = COALESCE($3, end_time),
         updated_at = NOW()
     WHERE id = $4 AND class_id = $5
     RETURNING id, class_id, day_of_week, start_time, end_time, created_at, updated_at`, [day_of_week, start_time, end_time, scheduleId, classId]);
    const response = {
        success: true,
        data: updatedScheduleResult.rows[0],
        message: 'Horario actualizado exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// Eliminar un horario
exports.deleteSchedule = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { classId, scheduleId } = req.params;
    if (!classId || !scheduleId) {
        return res.status(400).json({
            success: false,
            message: 'classId y scheduleId son requeridos',
            timestamp: new Date(),
        });
    }
    // Validar que la clase existe y pertenece al usuario o su entidad
    const classResult = await (0, connection_1.query)('SELECT id, entity_id, teacher_id FROM classes WHERE id = $1', [classId]);
    if (classResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Clase no encontrada',
            timestamp: new Date(),
        });
    }
    const dbClass = classResult.rows[0];
    // Validar permisos
    if (req.user.role === 'teacher' && dbClass.teacher_id !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'No tiene permiso para eliminar horarios de esta clase',
            timestamp: new Date(),
        });
    }
    // Validar que el horario existe
    const scheduleResult = await (0, connection_1.query)('SELECT id FROM schedules WHERE id = $1 AND class_id = $2', [scheduleId, classId]);
    if (scheduleResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Horario no encontrado',
            timestamp: new Date(),
        });
    }
    // Eliminar el horario
    await (0, connection_1.query)('DELETE FROM schedules WHERE id = $1 AND class_id = $2', [scheduleId, classId]);
    const response = {
        success: true,
        message: 'Horario eliminado exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// ===============================
// AGREGAR ESTUDIANTES A UNA CLASE
// ===============================
exports.addStudentsToClass = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { classId } = req.params;
    const { studentIds } = req.body;
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Debes proporcionar un array de IDs de estudiantes'
        });
    }
    // Verificar que la clase existe
    const classResult = await (0, connection_1.query)('SELECT id, section_id, academic_year_id FROM classes WHERE id = $1', [classId]);
    if (classResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Clase no encontrada'
        });
    }
    const { section_id: sectionId, academic_year_id: academicYearId } = classResult.rows[0];
    // Obtener información de la sección para validar límite
    const sectionResult = await (0, connection_1.query)('SELECT max_students FROM sections WHERE id = $1', [sectionId]);
    const maxStudents = sectionResult.rows[0]?.max_students || 30;
    // Contar estudiantes ya enrollados en esta sección
    const countResult = await (0, connection_1.query)(`SELECT COUNT(DISTINCT student_id) as count 
     FROM enrollments 
     WHERE section_id = $1 AND academic_year_id = $2 AND status = 'active'`, [sectionId, academicYearId]);
    const currentCount = parseInt(countResult.rows[0].count);
    // Validar que no exceda el límite
    if (currentCount + studentIds.length > maxStudents) {
        return res.status(400).json({
            success: false,
            message: `No se pueden agregar ${studentIds.length} estudiantes. La clase tiene máximo ${maxStudents} lugares. Estudiantes actuales: ${currentCount}`
        });
    }
    const addedEnrollments = [];
    const errors = [];
    // Agregar cada estudiante a la sección (enrollments)
    for (const studentId of studentIds) {
        try {
            // Verificar que el estudiante existe
            const studentResult = await (0, connection_1.query)('SELECT id, first_name, last_name FROM students WHERE id = $1 AND is_active = true', [studentId]);
            if (studentResult.rows.length === 0) {
                errors.push({
                    studentId,
                    error: 'Estudiante no encontrado o inactivo'
                });
                continue;
            }
            // Verificar si ya está enrollado en esta sección
            const existingEnrollment = await (0, connection_1.query)(`SELECT id FROM enrollments 
         WHERE student_id = $1 AND section_id = $2 AND academic_year_id = $3`, [studentId, sectionId, academicYearId]);
            if (existingEnrollment.rows.length > 0) {
                addedEnrollments.push({
                    studentId,
                    status: 'already_enrolled',
                    message: `${studentResult.rows[0].first_name} ${studentResult.rows[0].last_name} ya está enrollado`
                });
                continue;
            }
            // Crear enrollment
            const enrollmentResult = await (0, connection_1.query)(`INSERT INTO enrollments (student_id, section_id, academic_year_id, enrollment_date, status)
         VALUES ($1, $2, $3, CURRENT_DATE, 'active')
         RETURNING id, student_id, enrollment_date`, [studentId, sectionId, academicYearId]);
            addedEnrollments.push({
                enrollmentId: enrollmentResult.rows[0].id,
                studentId,
                studentName: `${studentResult.rows[0].first_name} ${studentResult.rows[0].last_name}`,
                status: 'enrolled'
            });
        }
        catch (error) {
            errors.push({
                studentId,
                error: error.message
            });
        }
    }
    res.status(201).json({
        success: true,
        message: `${addedEnrollments.length} estudiante(s) agregado(s) a la clase`,
        data: addedEnrollments,
        errors: errors.length > 0 ? errors : undefined
    });
});
//# sourceMappingURL=class.controller.js.map