-- ============================================
-- ASISvOX - PostgreSQL 17 Database Schema
-- Sistema de Gestión Educativa
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLA: users
-- Usuarios del sistema (Administradores y Profesores)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher')),
    phone VARCHAR(20),
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================
-- TABLA: academic_years
-- Años académicos
-- ============================================
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para academic_years
CREATE INDEX idx_academic_years_is_current ON academic_years(is_current);

-- ============================================
-- TABLA: subjects
-- Materias/Asignaturas
-- ============================================
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Color en formato hexadecimal #RRGGBB
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para subjects
CREATE INDEX idx_subjects_code ON subjects(code);
CREATE INDEX idx_subjects_is_active ON subjects(is_active);

-- ============================================
-- TABLA: grades
-- Grados/Niveles educativos
-- ============================================
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    level INTEGER NOT NULL, -- 1, 2, 3, etc.
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para grades
CREATE INDEX idx_grades_level ON grades(level);
CREATE INDEX idx_grades_is_active ON grades(is_active);

-- ============================================
-- TABLA: sections
-- Secciones/Paralelos (A, B, C, etc.)
-- ============================================
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- A, B, C, etc.
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    max_students INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(grade_id, name, academic_year_id)
);

-- Índices para sections
CREATE INDEX idx_sections_grade_id ON sections(grade_id);
CREATE INDEX idx_sections_academic_year_id ON sections(academic_year_id);
CREATE INDEX idx_sections_is_active ON sections(is_active);

-- ============================================
-- TABLA: classes
-- Clases (Combinación de Sección + Materia + Profesor)
-- ============================================
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    classroom VARCHAR(100), -- Aula/Salón
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(section_id, subject_id, academic_year_id)
);

-- Índices para classes
CREATE INDEX idx_classes_section_id ON classes(section_id);
CREATE INDEX idx_classes_subject_id ON classes(subject_id);
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_classes_academic_year_id ON classes(academic_year_id);
CREATE INDEX idx_classes_is_active ON classes(is_active);

-- ============================================
-- TABLA: schedules
-- Horarios de clases
-- ============================================
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 1=Lunes, ..., 6=Sábado
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_time > start_time)
);

-- Índices para schedules
CREATE INDEX idx_schedules_class_id ON schedules(class_id);
CREATE INDEX idx_schedules_day_of_week ON schedules(day_of_week);

-- ============================================
-- TABLA: students
-- Estudiantes
-- ============================================
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    identification_number VARCHAR(50) UNIQUE,
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
    photo_url TEXT,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    parent_name VARCHAR(255),
    parent_phone VARCHAR(20),
    parent_email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para students
CREATE INDEX idx_students_identification_number ON students(identification_number);
CREATE INDEX idx_students_is_active ON students(is_active);
CREATE INDEX idx_students_last_name ON students(last_name);

-- ============================================
-- TABLA: enrollments
-- Matriculación de estudiantes en secciones
-- ============================================
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred', 'graduated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, section_id, academic_year_id)
);

-- Índices para enrollments
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_section_id ON enrollments(section_id);
CREATE INDEX idx_enrollments_academic_year_id ON enrollments(academic_year_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);

-- ============================================
-- TABLA: attendance
-- Registro de asistencia
-- ============================================
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    method VARCHAR(20) CHECK (method IN ('manual', 'voice')), -- Método de registro
    notes TEXT,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, student_id, date)
);

-- Índices para attendance
CREATE INDEX idx_attendance_class_id ON attendance(class_id);
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_status ON attendance(status);

-- ============================================
-- TABLA: assessment_types
-- Tipos de evaluación (Examen, Tarea, Participación, etc.)
-- ============================================
CREATE TABLE assessment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para assessment_types
CREATE INDEX idx_assessment_types_is_active ON assessment_types(is_active);

-- ============================================
-- TABLA: assessments
-- Evaluaciones/Actividades calificables
-- ============================================
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    assessment_type_id UUID NOT NULL REFERENCES assessment_types(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    max_score DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    weight DECIMAL(5,2) DEFAULT 1.00, -- Peso/ponderación
    date DATE,
    due_date DATE,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para assessments
CREATE INDEX idx_assessments_class_id ON assessments(class_id);
CREATE INDEX idx_assessments_assessment_type_id ON assessments(assessment_type_id);
CREATE INDEX idx_assessments_date ON assessments(date);
CREATE INDEX idx_assessments_is_published ON assessments(is_published);

-- ============================================
-- TABLA: grades_records
-- Registro de calificaciones
-- ============================================
CREATE TABLE grades_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    score DECIMAL(5,2),
    method VARCHAR(20) CHECK (method IN ('manual', 'voice')), -- Método de registro
    observations TEXT,
    graded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    graded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assessment_id, student_id)
);

-- Índices para grades_records
CREATE INDEX idx_grades_records_assessment_id ON grades_records(assessment_id);
CREATE INDEX idx_grades_records_student_id ON grades_records(student_id);
CREATE INDEX idx_grades_records_graded_by ON grades_records(graded_by);

-- ============================================
-- TABLA: homework
-- Tareas/Deberes
-- ============================================
CREATE TABLE homework (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    max_score DECIMAL(5,2) DEFAULT 100.00,
    is_published BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para homework
CREATE INDEX idx_homework_class_id ON homework(class_id);
CREATE INDEX idx_homework_due_date ON homework(due_date);
CREATE INDEX idx_homework_is_published ON homework(is_published);

-- ============================================
-- TABLA: homework_submissions
-- Entregas de tareas
-- ============================================
CREATE TABLE homework_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    homework_id UUID NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'late', 'missing', 'graded')),
    score DECIMAL(5,2),
    feedback TEXT,
    graded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    graded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(homework_id, student_id)
);

-- Índices para homework_submissions
CREATE INDEX idx_homework_submissions_homework_id ON homework_submissions(homework_id);
CREATE INDEX idx_homework_submissions_student_id ON homework_submissions(student_id);
CREATE INDEX idx_homework_submissions_status ON homework_submissions(status);

-- ============================================
-- TABLA: notifications
-- Notificaciones del sistema
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'assignment', 'grade', 'attendance', 'system', etc.
    is_read BOOLEAN DEFAULT false,
    related_entity_type VARCHAR(50), -- 'class', 'student', 'homework', etc.
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================
-- TABLA: reports
-- Reportes generados
-- ============================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'attendance', 'grades', 'performance', etc.
    format VARCHAR(20) NOT NULL CHECK (format IN ('pdf', 'excel', 'csv')),
    filters JSONB, -- Filtros aplicados al reporte
    file_url TEXT,
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para reports
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_generated_by ON reports(generated_by);
CREATE INDEX idx_reports_created_at ON reports(created_at);

-- ============================================
-- TABLA: teacher_assignments
-- Asignaciones de profesores (para copiar horarios)
-- ============================================
CREATE TABLE teacher_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para teacher_assignments
CREATE INDEX idx_teacher_assignments_teacher_id ON teacher_assignments(teacher_id);
CREATE INDEX idx_teacher_assignments_academic_year_id ON teacher_assignments(academic_year_id);

-- ============================================
-- TABLA: audit_logs
-- Registro de auditoría
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'student', 'class', 'grade', etc.
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para audit_logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- TRIGGERS para updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academic_years_updated_at BEFORE UPDATE ON academic_years FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grades_records_updated_at BEFORE UPDATE ON grades_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_homework_updated_at BEFORE UPDATE ON homework FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_homework_submissions_updated_at BEFORE UPDATE ON homework_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teacher_assignments_updated_at BEFORE UPDATE ON teacher_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Estudiantes con su sección actual
CREATE VIEW v_student_enrollments AS
SELECT 
    s.id as student_id,
    s.first_name,
    s.last_name,
    s.identification_number,
    g.name as grade_name,
    sec.name as section_name,
    ay.name as academic_year,
    e.status as enrollment_status
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN sections sec ON e.section_id = sec.id
JOIN grades g ON sec.grade_id = g.id
JOIN academic_years ay ON e.academic_year_id = ay.id
WHERE e.status = 'active' AND ay.is_current = true;

-- Vista: Clases con información completa
CREATE VIEW v_classes_full AS
SELECT 
    c.id as class_id,
    sub.name as subject_name,
    sub.code as subject_code,
    sub.color as subject_color,
    g.name as grade_name,
    sec.name as section_name,
    u.full_name as teacher_name,
    c.classroom,
    ay.name as academic_year
FROM classes c
JOIN subjects sub ON c.subject_id = sub.id
JOIN sections sec ON c.section_id = sec.id
JOIN grades g ON sec.grade_id = g.id
JOIN users u ON c.teacher_id = u.id
JOIN academic_years ay ON c.academic_year_id = ay.id;

-- Vista: Resumen de asistencia por estudiante
CREATE VIEW v_attendance_summary AS
SELECT 
    s.id as student_id,
    s.first_name,
    s.last_name,
    c.id as class_id,
    COUNT(*) FILTER (WHERE a.status = 'present') as days_present,
    COUNT(*) FILTER (WHERE a.status = 'absent') as days_absent,
    COUNT(*) FILTER (WHERE a.status = 'late') as days_late,
    COUNT(*) FILTER (WHERE a.status = 'excused') as days_excused,
    COUNT(*) as total_days,
    ROUND(COUNT(*) FILTER (WHERE a.status = 'present')::numeric / NULLIF(COUNT(*), 0) * 100, 2) as attendance_percentage
FROM students s
JOIN attendance a ON s.id = a.student_id
JOIN classes c ON a.class_id = c.id
GROUP BY s.id, s.first_name, s.last_name, c.id;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar tipos de evaluación predeterminados
INSERT INTO assessment_types (name, description) VALUES
    ('Examen', 'Evaluación formal escrita u oral'),
    ('Tarea', 'Trabajo asignado para realizar fuera de clase'),
    ('Participación', 'Participación activa en clase'),
    ('Proyecto', 'Trabajo de investigación o creación'),
    ('Quiz', 'Evaluación corta y rápida'),
    ('Trabajo en Grupo', 'Actividad colaborativa'),
    ('Presentación', 'Exposición oral de un tema');

-- Crear usuario administrador por defecto
-- Contraseña: admin123 (debe cambiarse en producción)
INSERT INTO users (email, password_hash, full_name, role) VALUES
    ('admin@asisvox.com', crypt('admin123', gen_salt('bf')), 'Administrador del Sistema', 'admin');

-- Crear año académico actual
INSERT INTO academic_years (name, start_date, end_date, is_current) VALUES
    ('2025', '2025-01-01', '2025-12-31', true);

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para verificar conflictos de horario
CREATE OR REPLACE FUNCTION check_schedule_conflict(
    p_teacher_id UUID,
    p_day_of_week INTEGER,
    p_start_time TIME,
    p_end_time TIME,
    p_exclude_schedule_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO conflict_count
    FROM schedules s
    JOIN classes c ON s.class_id = c.id
    WHERE c.teacher_id = p_teacher_id
        AND s.day_of_week = p_day_of_week
        AND (p_exclude_schedule_id IS NULL OR s.id != p_exclude_schedule_id)
        AND (
            (p_start_time >= s.start_time AND p_start_time < s.end_time) OR
            (p_end_time > s.start_time AND p_end_time <= s.end_time) OR
            (p_start_time <= s.start_time AND p_end_time >= s.end_time)
        );
    
    RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular promedio de calificaciones
CREATE OR REPLACE FUNCTION calculate_student_average(
    p_student_id UUID,
    p_class_id UUID
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    average_score DECIMAL(5,2);
BEGIN
    SELECT COALESCE(AVG(gr.score), 0) INTO average_score
    FROM grades_records gr
    JOIN assessments a ON gr.assessment_id = a.id
    WHERE gr.student_id = p_student_id
        AND a.class_id = p_class_id
        AND a.is_published = true;
    
    RETURN average_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE users IS 'Usuarios del sistema (administradores y profesores)';
COMMENT ON TABLE students IS 'Estudiantes registrados en el sistema';
COMMENT ON TABLE classes IS 'Clases que combinan sección, materia y profesor';
COMMENT ON TABLE attendance IS 'Registro diario de asistencia de estudiantes';
COMMENT ON TABLE grades_records IS 'Calificaciones de estudiantes en evaluaciones';
COMMENT ON TABLE homework IS 'Tareas y deberes asignados a estudiantes';
COMMENT ON TABLE notifications IS 'Notificaciones para usuarios del sistema';
COMMENT ON TABLE audit_logs IS 'Registro de auditoría de todas las acciones';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
