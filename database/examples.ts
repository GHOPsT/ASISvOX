/**
 * ASISvOX - Ejemplos de Uso de la Base de Datos PostgreSQL
 * Ejemplos prácticos de consultas y operaciones comunes
 */

import {
  query,
  transaction,
  getClient,
  findById,
  findAll,
  insert,
  update,
  deleteById,
} from './connection';

// ============================================
// EJEMPLOS DE AUTENTICACIÓN
// ============================================

/**
 * Registrar un nuevo usuario (profesor)
 */
export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  role: 'admin' | 'teacher'
) {
  const result = await query(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1, crypt($2, gen_salt('bf')), $3, $4)
     RETURNING id, email, full_name, role, created_at`,
    [email, password, fullName, role]
  );
  return result.rows[0];
}

/**
 * Iniciar sesión (verificar credenciales)
 */
export async function login(email: string, password: string) {
  const result = await query(
    `SELECT id, email, full_name, role, phone, photo_url, is_active
     FROM users
     WHERE email = $1
       AND password_hash = crypt($2, password_hash)
       AND is_active = true`,
    [email, password]
  );

  if (result.rows.length === 0) {
    throw new Error('Credenciales inválidas');
  }

  // Actualizar último login
  await query(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [result.rows[0].id]
  );

  return result.rows[0];
}

/**
 * Cambiar contraseña
 */
export async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
) {
  // Verificar contraseña actual
  const verify = await query(
    `SELECT id FROM users
     WHERE id = $1 AND password_hash = crypt($2, password_hash)`,
    [userId, oldPassword]
  );

  if (verify.rows.length === 0) {
    throw new Error('Contraseña actual incorrecta');
  }

  // Actualizar contraseña
  await query(
    `UPDATE users
     SET password_hash = crypt($1, gen_salt('bf'))
     WHERE id = $2`,
    [newPassword, userId]
  );

  return true;
}

// ============================================
// EJEMPLOS DE GESTIÓN DE ESTUDIANTES
// ============================================

/**
 * Crear un nuevo estudiante
 */
export async function createStudent(studentData: {
  firstName: string;
  lastName: string;
  identificationNumber?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  email?: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
}) {
  return await insert('students', {
    first_name: studentData.firstName,
    last_name: studentData.lastName,
    identification_number: studentData.identificationNumber,
    date_of_birth: studentData.dateOfBirth,
    gender: studentData.gender,
    email: studentData.email,
    phone: studentData.phone,
    parent_name: studentData.parentName,
    parent_phone: studentData.parentPhone,
    parent_email: studentData.parentEmail,
  });
}

/**
 * Obtener todos los estudiantes activos
 */
export async function getActiveStudents() {
  return await findAll('students', { is_active: true });
}

/**
 * Buscar estudiantes por nombre
 */
export async function searchStudentsByName(searchTerm: string) {
  const result = await query(
    `SELECT * FROM students
     WHERE (first_name ILIKE $1 OR last_name ILIKE $1)
       AND is_active = true
     ORDER BY last_name, first_name`,
    [`%${searchTerm}%`]
  );
  return result.rows;
}

/**
 * Obtener estudiantes de una sección específica
 */
export async function getStudentsBySection(sectionId: string) {
  const result = await query(
    `SELECT s.*, e.enrollment_date, e.status as enrollment_status
     FROM students s
     JOIN enrollments e ON s.id = e.student_id
     WHERE e.section_id = $1
       AND e.status = 'active'
     ORDER BY s.last_name, s.first_name`,
    [sectionId]
  );
  return result.rows;
}

/**
 * Matricular estudiante en una sección
 */
export async function enrollStudent(
  studentId: string,
  sectionId: string,
  academicYearId: string
) {
  return await insert('enrollments', {
    student_id: studentId,
    section_id: sectionId,
    academic_year_id: academicYearId,
    enrollment_date: new Date(),
    status: 'active',
  });
}

// ============================================
// EJEMPLOS DE GESTIÓN DE CLASES
// ============================================

/**
 * Obtener todas las clases de un profesor
 */
export async function getTeacherClasses(teacherId: string) {
  const result = await query(
    `SELECT
       c.id,
       c.classroom,
       sub.name as subject_name,
       sub.code as subject_code,
       sub.color as subject_color,
       g.name as grade_name,
       sec.name as section_name,
       ay.name as academic_year,
       COUNT(DISTINCT e.student_id) as student_count
     FROM classes c
     JOIN subjects sub ON c.subject_id = sub.id
     JOIN sections sec ON c.section_id = sec.id
     JOIN grades g ON sec.grade_id = g.id
     JOIN academic_years ay ON c.academic_year_id = ay.id
     LEFT JOIN enrollments e ON sec.id = e.section_id AND e.status = 'active'
     WHERE c.teacher_id = $1
       AND c.is_active = true
       AND ay.is_current = true
     GROUP BY c.id, c.classroom, sub.name, sub.code, sub.color, g.name, sec.name, ay.name
     ORDER BY g.level, sec.name, sub.name`,
    [teacherId]
  );
  return result.rows;
}

/**
 * Obtener horario de una clase
 */
export async function getClassSchedule(classId: string) {
  const result = await query(
    `SELECT
       s.id,
       s.day_of_week,
       s.start_time,
       s.end_time,
       CASE s.day_of_week
         WHEN 0 THEN 'Domingo'
         WHEN 1 THEN 'Lunes'
         WHEN 2 THEN 'Martes'
         WHEN 3 THEN 'Miércoles'
         WHEN 4 THEN 'Jueves'
         WHEN 5 THEN 'Viernes'
         WHEN 6 THEN 'Sábado'
       END as day_name
     FROM schedules s
     WHERE s.class_id = $1
     ORDER BY s.day_of_week, s.start_time`,
    [classId]
  );
  return result.rows;
}

/**
 * Verificar conflictos de horario antes de crear un horario
 */
export async function checkScheduleConflicts(
  teacherId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string
) {
  const result = await query(
    'SELECT check_schedule_conflict($1, $2, $3::time, $4::time) as has_conflict',
    [teacherId, dayOfWeek, startTime, endTime]
  );
  return result.rows[0].has_conflict;
}

/**
 * Crear horario para una clase
 */
export async function createSchedule(
  classId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string
) {
  // Primero obtener el profesor de la clase
  const classInfo = await query(
    'SELECT teacher_id FROM classes WHERE id = $1',
    [classId]
  );

  if (classInfo.rows.length === 0) {
    throw new Error('Clase no encontrada');
  }

  const teacherId = classInfo.rows[0].teacher_id;

  // Verificar conflictos
  const hasConflict = await checkScheduleConflicts(
    teacherId,
    dayOfWeek,
    startTime,
    endTime
  );

  if (hasConflict) {
    throw new Error('El profesor ya tiene una clase en este horario');
  }

  // Crear el horario
  return await insert('schedules', {
    class_id: classId,
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
  });
}

// ============================================
// EJEMPLOS DE ASISTENCIA
// ============================================

/**
 * Registrar asistencia de múltiples estudiantes
 */
export async function recordAttendance(
  classId: string,
  date: Date,
  attendanceRecords: Array<{
    studentId: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
  }>,
  recordedBy: string,
  method: 'manual' | 'voice' = 'manual'
) {
  return await transaction(async (client) => {
    const results = [];

    for (const record of attendanceRecords) {
      const result = await client.query(
        `INSERT INTO attendance (class_id, student_id, date, status, method, notes, recorded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (class_id, student_id, date)
         DO UPDATE SET
           status = EXCLUDED.status,
           method = EXCLUDED.method,
           notes = EXCLUDED.notes,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          classId,
          record.studentId,
          date,
          record.status,
          method,
          record.notes,
          recordedBy,
        ]
      );
      results.push(result.rows[0]);
    }

    return results;
  });
}

/**
 * Obtener asistencia de una clase en una fecha específica
 */
export async function getAttendanceByDate(classId: string, date: Date) {
  const result = await query(
    `SELECT
       a.*,
       s.first_name,
       s.last_name,
       s.identification_number
     FROM attendance a
     JOIN students s ON a.student_id = s.id
     WHERE a.class_id = $1 AND a.date = $2
     ORDER BY s.last_name, s.first_name`,
    [classId, date]
  );
  return result.rows;
}

/**
 * Obtener resumen de asistencia de un estudiante en una clase
 */
export async function getStudentAttendanceSummary(
  studentId: string,
  classId: string
) {
  const result = await query(
    `SELECT * FROM v_attendance_summary
     WHERE student_id = $1 AND class_id = $2`,
    [studentId, classId]
  );
  return result.rows[0];
}

/**
 * Obtener reporte de asistencia mensual
 */
export async function getMonthlyAttendanceReport(
  classId: string,
  year: number,
  month: number
) {
  const result = await query(
    `SELECT
       s.id as student_id,
       s.first_name,
       s.last_name,
       COUNT(*) FILTER (WHERE a.status = 'present') as days_present,
       COUNT(*) FILTER (WHERE a.status = 'absent') as days_absent,
       COUNT(*) FILTER (WHERE a.status = 'late') as days_late,
       COUNT(*) FILTER (WHERE a.status = 'excused') as days_excused,
       COUNT(*) as total_days,
       ROUND(
         COUNT(*) FILTER (WHERE a.status = 'present')::numeric /
         NULLIF(COUNT(*), 0) * 100,
         2
       ) as attendance_percentage
     FROM students s
     JOIN enrollments e ON s.id = e.student_id
     JOIN classes c ON e.section_id = c.section_id
     LEFT JOIN attendance a ON s.id = a.student_id
       AND a.class_id = c.id
       AND EXTRACT(YEAR FROM a.date) = $2
       AND EXTRACT(MONTH FROM a.date) = $3
     WHERE c.id = $1
       AND e.status = 'active'
     GROUP BY s.id, s.first_name, s.last_name
     ORDER BY s.last_name, s.first_name`,
    [classId, year, month]
  );
  return result.rows;
}

// ============================================
// EJEMPLOS DE CALIFICACIONES
// ============================================

/**
 * Crear una evaluación
 */
export async function createAssessment(assessmentData: {
  classId: string;
  assessmentTypeId: string;
  name: string;
  description?: string;
  maxScore?: number;
  weight?: number;
  date?: Date;
  dueDate?: Date;
}) {
  return await insert('assessments', {
    class_id: assessmentData.classId,
    assessment_type_id: assessmentData.assessmentTypeId,
    name: assessmentData.name,
    description: assessmentData.description,
    max_score: assessmentData.maxScore || 100,
    weight: assessmentData.weight || 1,
    date: assessmentData.date,
    due_date: assessmentData.dueDate,
    is_published: false,
  });
}

/**
 * Registrar calificaciones
 */
export async function recordGrades(
  assessmentId: string,
  grades: Array<{
    studentId: string;
    score: number;
    observations?: string;
  }>,
  gradedBy: string,
  method: 'manual' | 'voice' = 'manual'
) {
  return await transaction(async (client) => {
    const results = [];

    for (const grade of grades) {
      const result = await client.query(
        `INSERT INTO grades_records (assessment_id, student_id, score, observations, graded_by, method)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (assessment_id, student_id)
         DO UPDATE SET
           score = EXCLUDED.score,
           observations = EXCLUDED.observations,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          assessmentId,
          grade.studentId,
          grade.score,
          grade.observations,
          gradedBy,
          method,
        ]
      );
      results.push(result.rows[0]);
    }

    return results;
  });
}

/**
 * Obtener calificaciones de un estudiante en una clase
 */
export async function getStudentGrades(studentId: string, classId: string) {
  const result = await query(
    `SELECT
       gr.id,
       gr.score,
       gr.observations,
       gr.graded_at,
       a.name as assessment_name,
       a.max_score,
       a.weight,
       a.date as assessment_date,
       at.name as assessment_type,
       ROUND((gr.score / a.max_score) * 100, 2) as percentage
     FROM grades_records gr
     JOIN assessments a ON gr.assessment_id = a.id
     JOIN assessment_types at ON a.assessment_type_id = at.id
     WHERE gr.student_id = $1
       AND a.class_id = $2
       AND a.is_published = true
     ORDER BY a.date DESC`,
    [studentId, classId]
  );
  return result.rows;
}

/**
 * Calcular promedio ponderado de un estudiante
 */
export async function getStudentAverage(studentId: string, classId: string) {
  const result = await query(
    'SELECT calculate_student_average($1, $2) as average',
    [studentId, classId]
  );
  return result.rows[0].average;
}

/**
 * Obtener reporte de calificaciones de una clase
 */
export async function getClassGradesReport(classId: string) {
  const result = await query(
    `SELECT
       s.id as student_id,
       s.first_name,
       s.last_name,
       calculate_student_average(s.id, $1) as average,
       COUNT(DISTINCT gr.id) as total_grades
     FROM students s
     JOIN enrollments e ON s.id = e.student_id
     JOIN classes c ON e.section_id = c.section_id
     LEFT JOIN grades_records gr ON s.id = gr.student_id
     LEFT JOIN assessments a ON gr.assessment_id = a.id AND a.class_id = c.id
     WHERE c.id = $1
       AND e.status = 'active'
     GROUP BY s.id, s.first_name, s.last_name
     ORDER BY s.last_name, s.first_name`,
    [classId]
  );
  return result.rows;
}

// ============================================
// EJEMPLOS DE TAREAS
// ============================================

/**
 * Crear una tarea
 */
export async function createHomework(homeworkData: {
  classId: string;
  title: string;
  description?: string;
  dueDate: Date;
  maxScore?: number;
  createdBy: string;
}) {
  return await insert('homework', {
    class_id: homeworkData.classId,
    title: homeworkData.title,
    description: homeworkData.description,
    assigned_date: new Date(),
    due_date: homeworkData.dueDate,
    max_score: homeworkData.maxScore || 100,
    is_published: true,
    created_by: homeworkData.createdBy,
  });
}

/**
 * Obtener tareas de una clase
 */
export async function getClassHomework(classId: string) {
  const result = await query(
    `SELECT
       h.*,
       u.full_name as teacher_name,
       COUNT(hs.id) as submissions_count,
       COUNT(hs.id) FILTER (WHERE hs.status = 'graded') as graded_count
     FROM homework h
     JOIN users u ON h.created_by = u.id
     LEFT JOIN homework_submissions hs ON h.id = hs.homework_id
     WHERE h.class_id = $1
       AND h.is_published = true
     GROUP BY h.id, u.full_name
     ORDER BY h.due_date DESC`,
    [classId]
  );
  return result.rows;
}

/**
 * Registrar entrega de tarea
 */
export async function submitHomework(
  homeworkId: string,
  studentId: string,
  status?: 'submitted' | 'late'
) {
  // Obtener la fecha de entrega de la tarea
  const homework = await query(
    'SELECT due_date FROM homework WHERE id = $1',
    [homeworkId]
  );

  if (homework.rows.length === 0) {
    throw new Error('Tarea no encontrada');
  }

  const dueDate = new Date(homework.rows[0].due_date);
  const now = new Date();

  // Determinar si es tardía
  const submissionStatus = status || (now > dueDate ? 'late' : 'submitted');

  return await insert('homework_submissions', {
    homework_id: homeworkId,
    student_id: studentId,
    submission_date: now,
    status: submissionStatus,
  });
}

/**
 * Calificar entrega de tarea
 */
export async function gradeHomeworkSubmission(
  submissionId: string,
  score: number,
  feedback: string,
  gradedBy: string
) {
  return await update('homework_submissions', submissionId, {
    score,
    feedback,
    graded_by: gradedBy,
    graded_at: new Date(),
    status: 'graded',
  });
}

// ============================================
// EJEMPLOS DE NOTIFICACIONES
// ============================================

/**
 * Crear notificación
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  relatedEntityType?: string,
  relatedEntityId?: string
) {
  return await insert('notifications', {
    user_id: userId,
    title,
    message,
    type,
    related_entity_type: relatedEntityType,
    related_entity_id: relatedEntityId,
  });
}

/**
 * Obtener notificaciones de un usuario
 */
export async function getUserNotifications(userId: string, limit = 50) {
  const result = await query(
    `SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

/**
 * Marcar notificación como leída
 */
export async function markNotificationAsRead(notificationId: string) {
  return await update('notifications', notificationId, { is_read: true });
}

/**
 * Marcar todas las notificaciones como leídas
 */
export async function markAllNotificationsAsRead(userId: string) {
  await query(
    'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
    [userId]
  );
  return true;
}

// ============================================
// EJEMPLOS DE REPORTES
// ============================================

/**
 * Generar reporte de asistencia
 */
export async function generateAttendanceReport(
  classId: string,
  startDate: Date,
  endDate: Date,
  generatedBy: string
) {
  return await transaction(async (client) => {
    // Crear registro del reporte
    const report = await client.query(
      `INSERT INTO reports (title, type, format, filters, generated_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        'Reporte de Asistencia',
        'attendance',
        'pdf',
        JSON.stringify({ classId, startDate, endDate }),
        generatedBy,
      ]
    );

    // Aquí iría la lógica para generar el archivo PDF
    // y actualizar el file_url del reporte

    return report.rows[0];
  });
}

/**
 * Obtener reportes generados por un usuario
 */
export async function getUserReports(userId: string) {
  const result = await query(
    `SELECT * FROM reports
     WHERE generated_by = $1
     ORDER BY created_at DESC
     LIMIT 100`,
    [userId]
  );
  return result.rows;
}

// ============================================
// EJEMPLOS DE AUDITORÍA
// ============================================

/**
 * Registrar acción en el log de auditoría
 */
export async function logAuditAction(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  oldValues?: any,
  newValues?: any,
  ipAddress?: string,
  userAgent?: string
) {
  return await insert('audit_logs', {
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_values: oldValues ? JSON.stringify(oldValues) : null,
    new_values: newValues ? JSON.stringify(newValues) : null,
    ip_address: ipAddress,
    user_agent: userAgent,
  });
}

/**
 * Obtener historial de cambios de una entidad
 */
export async function getEntityHistory(entityType: string, entityId: string) {
  const result = await query(
    `SELECT
       al.*,
       u.full_name as user_name
     FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id
     WHERE al.entity_type = $1 AND al.entity_id = $2
     ORDER BY al.created_at DESC`,
    [entityType, entityId]
  );
  return result.rows;
}

// ============================================
// EXPORTAR TODAS LAS FUNCIONES
// ============================================

export default {
  // Autenticación
  registerUser,
  login,
  changePassword,

  // Estudiantes
  createStudent,
  getActiveStudents,
  searchStudentsByName,
  getStudentsBySection,
  enrollStudent,

  // Clases
  getTeacherClasses,
  getClassSchedule,
  checkScheduleConflicts,
  createSchedule,

  // Asistencia
  recordAttendance,
  getAttendanceByDate,
  getStudentAttendanceSummary,
  getMonthlyAttendanceReport,

  // Calificaciones
  createAssessment,
  recordGrades,
  getStudentGrades,
  getStudentAverage,
  getClassGradesReport,

  // Tareas
  createHomework,
  getClassHomework,
  submitHomework,
  gradeHomeworkSubmission,

  // Notificaciones
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,

  // Reportes
  generateAttendanceReport,
  getUserReports,

  // Auditoría
  logAuditAction,
  getEntityHistory,
};
