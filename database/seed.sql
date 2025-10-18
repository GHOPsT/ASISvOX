-- ============================================
-- ASISvOX - Datos de Prueba (SEED DATA)
-- PostgreSQL 17
-- ============================================
-- IMPORTANTE: Este archivo es solo para desarrollo/pruebas
-- NO ejecutar en producción con datos reales
-- ============================================

BEGIN;

-- ============================================
-- 1. AÑOS ACADÉMICOS
-- ============================================

INSERT INTO academic_years (id, name, start_date, end_date, is_current) VALUES
    ('11111111-1111-1111-1111-111111111111', '2024', '2024-01-01', '2024-12-31', false),
    ('22222222-2222-2222-2222-222222222222', '2025', '2025-01-01', '2025-12-31', true),
    ('33333333-3333-3333-3333-333333333333', '2026', '2026-01-01', '2026-12-31', false);

-- ============================================
-- 2. USUARIOS (Administradores y Profesores)
-- ============================================

-- Contraseña para todos: "password123"
INSERT INTO users (id, email, password_hash, full_name, role, phone, is_active) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@asisvox.com', crypt('password123', gen_salt('bf')), 'Administrador Principal', 'admin', '555-0001', true),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'maria.lopez@colegio.edu', crypt('password123', gen_salt('bf')), 'María López García', 'teacher', '555-0101', true),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'juan.martinez@colegio.edu', crypt('password123', gen_salt('bf')), 'Juan Martínez Pérez', 'teacher', '555-0102', true),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'ana.rodriguez@colegio.edu', crypt('password123', gen_salt('bf')), 'Ana Rodríguez Silva', 'teacher', '555-0103', true),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'carlos.sanchez@colegio.edu', crypt('password123', gen_salt('bf')), 'Carlos Sánchez Torres', 'teacher', '555-0104', true),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'laura.garcia@colegio.edu', crypt('password123', gen_salt('bf')), 'Laura García Mendoza', 'teacher', '555-0105', true);

-- ============================================
-- 3. MATERIAS
-- ============================================

INSERT INTO subjects (id, name, code, description, color, is_active) VALUES
    ('10000000-0000-0000-0000-000000000001', 'Matemáticas', 'MAT', 'Matemáticas generales', '#3B82F6', true),
    ('10000000-0000-0000-0000-000000000002', 'Lenguaje y Literatura', 'LEN', 'Lengua española y literatura', '#EF4444', true),
    ('10000000-0000-0000-0000-000000000003', 'Ciencias Naturales', 'NAT', 'Biología, Física y Química', '#10B981', true),
    ('10000000-0000-0000-0000-000000000004', 'Estudios Sociales', 'SOC', 'Historia, Geografía y Cívica', '#F59E0B', true),
    ('10000000-0000-0000-0000-000000000005', 'Inglés', 'ING', 'Idioma inglés', '#8B5CF6', true),
    ('10000000-0000-0000-0000-000000000006', 'Educación Física', 'EDF', 'Deportes y actividad física', '#EC4899', true),
    ('10000000-0000-0000-0000-000000000007', 'Arte', 'ART', 'Artes plásticas y visuales', '#F97316', true),
    ('10000000-0000-0000-0000-000000000008', 'Música', 'MUS', 'Educación musical', '#06B6D4', true);

-- ============================================
-- 4. GRADOS
-- ============================================

INSERT INTO grades (id, name, level, description, is_active) VALUES
    ('20000000-0000-0000-0000-000000000001', 'Primero Básico', 1, 'Primer grado de educación básica', true),
    ('20000000-0000-0000-0000-000000000002', 'Segundo Básico', 2, 'Segundo grado de educación básica', true),
    ('20000000-0000-0000-0000-000000000003', 'Tercero Básico', 3, 'Tercer grado de educación básica', true),
    ('20000000-0000-0000-0000-000000000004', 'Cuarto Básico', 4, 'Cuarto grado de educación básica', true),
    ('20000000-0000-0000-0000-000000000005', 'Quinto Básico', 5, 'Quinto grado de educación básica', true),
    ('20000000-0000-0000-0000-000000000006', 'Sexto Básico', 6, 'Sexto grado de educación básica', true);

-- ============================================
-- 5. SECCIONES
-- ============================================

INSERT INTO sections (id, grade_id, name, academic_year_id, max_students, is_active) VALUES
    -- Primero Básico
    ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'A', '22222222-2222-2222-2222-222222222222', 30, true),
    ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'B', '22222222-2222-2222-2222-222222222222', 30, true),
    -- Segundo Básico
    ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'A', '22222222-2222-2222-2222-222222222222', 30, true),
    ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'B', '22222222-2222-2222-2222-222222222222', 30, true),
    -- Tercero Básico
    ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', 'A', '22222222-2222-2222-2222-222222222222', 30, true),
    -- Cuarto Básico
    ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000004', 'A', '22222222-2222-2222-2222-222222222222', 30, true),
    -- Quinto Básico
    ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000005', 'A', '22222222-2222-2222-2222-222222222222', 30, true),
    ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000005', 'B', '22222222-2222-2222-2222-222222222222', 30, true);

-- ============================================
-- 6. CLASES
-- ============================================

INSERT INTO classes (id, section_id, subject_id, teacher_id, academic_year_id, classroom, is_active) VALUES
    -- Primero Básico A
    ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Aula 101', true),
    ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Aula 101', true),
    ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'Lab 1', true),
    -- Segundo Básico A
    ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Aula 201', true),
    ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'Aula 201', true),
    -- Quinto Básico A
    ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'Aula 501', true),
    ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Aula 501', true);

-- ============================================
-- 7. HORARIOS
-- ============================================

INSERT INTO schedules (class_id, day_of_week, start_time, end_time) VALUES
    -- Lunes (1)
    ('40000000-0000-0000-0000-000000000001', 1, '08:00:00', '09:00:00'),
    ('40000000-0000-0000-0000-000000000002', 1, '09:00:00', '10:00:00'),
    ('40000000-0000-0000-0000-000000000004', 1, '10:00:00', '11:00:00'),
    -- Martes (2)
    ('40000000-0000-0000-0000-000000000001', 2, '08:00:00', '09:00:00'),
    ('40000000-0000-0000-0000-000000000005', 2, '09:00:00', '10:00:00'),
    ('40000000-0000-0000-0000-000000000006', 2, '10:00:00', '11:00:00'),
    -- Miércoles (3)
    ('40000000-0000-0000-0000-000000000003', 3, '08:00:00', '09:00:00'),
    ('40000000-0000-0000-0000-000000000007', 3, '09:00:00', '10:00:00'),
    -- Jueves (4)
    ('40000000-0000-0000-0000-000000000001', 4, '08:00:00', '09:00:00'),
    ('40000000-0000-0000-0000-000000000004', 4, '10:00:00', '11:00:00'),
    -- Viernes (5)
    ('40000000-0000-0000-0000-000000000002', 5, '08:00:00', '09:00:00'),
    ('40000000-0000-0000-0000-000000000006', 5, '09:00:00', '10:00:00');

-- ============================================
-- 8. ESTUDIANTES
-- ============================================

INSERT INTO students (id, first_name, last_name, identification_number, date_of_birth, gender, email, phone, parent_name, parent_phone, parent_email, is_active) VALUES
    ('50000000-0000-0000-0000-000000000001', 'Carlos', 'Ramírez González', 'EST001', '2014-03-15', 'male', 'carlos.ramirez@estudiante.edu', NULL, 'Roberto Ramírez', '555-1001', 'roberto.ramirez@email.com', true),
    ('50000000-0000-0000-0000-000000000002', 'María', 'Fernández López', 'EST002', '2014-07-22', 'female', 'maria.fernandez@estudiante.edu', NULL, 'Carmen López', '555-1002', 'carmen.lopez@email.com', true),
    ('50000000-0000-0000-0000-000000000003', 'José', 'García Pérez', 'EST003', '2014-01-10', 'male', 'jose.garcia@estudiante.edu', NULL, 'José García Sr.', '555-1003', 'jose.garcia@email.com', true),
    ('50000000-0000-0000-0000-000000000004', 'Ana', 'Martínez Silva', 'EST004', '2014-11-05', 'female', 'ana.martinez@estudiante.edu', NULL, 'Pedro Martínez', '555-1004', 'pedro.martinez@email.com', true),
    ('50000000-0000-0000-0000-000000000005', 'Luis', 'Hernández Torres', 'EST005', '2013-09-18', 'male', 'luis.hernandez@estudiante.edu', NULL, 'Luis Hernández Sr.', '555-1005', 'luis.hernandez@email.com', true),
    ('50000000-0000-0000-0000-000000000006', 'Sofia', 'Jiménez Ruiz', 'EST006', '2013-04-30', 'female', 'sofia.jimenez@estudiante.edu', NULL, 'Martha Ruiz', '555-1006', 'martha.ruiz@email.com', true),
    ('50000000-0000-0000-0000-000000000007', 'Diego', 'Morales Castro', 'EST007', '2012-12-12', 'male', 'diego.morales@estudiante.edu', NULL, 'Fernando Morales', '555-1007', 'fernando.morales@email.com', true),
    ('50000000-0000-0000-0000-000000000008', 'Valentina', 'Díaz Mendoza', 'EST008', '2012-08-25', 'female', 'valentina.diaz@estudiante.edu', NULL, 'Isabel Mendoza', '555-1008', 'isabel.mendoza@email.com', true),
    ('50000000-0000-0000-0000-000000000009', 'Andrés', 'Vargas Ortiz', 'EST009', '2010-05-14', 'male', 'andres.vargas@estudiante.edu', NULL, 'Andrés Vargas Sr.', '555-1009', 'andres.vargas@email.com', true),
    ('50000000-0000-0000-0000-000000000010', 'Camila', 'Rojas Sánchez', 'EST010', '2010-02-28', 'female', 'camila.rojas@estudiante.edu', NULL, 'Patricia Sánchez', '555-1010', 'patricia.sanchez@email.com', true);

-- ============================================
-- 9. MATRICULACIONES
-- ============================================

INSERT INTO enrollments (student_id, section_id, academic_year_id, enrollment_date, status) VALUES
    -- Primero Básico A
    ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', '2025-01-05', 'active'),
    ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', '2025-01-05', 'active'),
    ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', '2025-01-05', 'active'),
    ('50000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', '2025-01-05', 'active'),
    -- Segundo Básico A
    ('50000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', '2025-01-05', 'active'),
    ('50000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', '2025-01-05', 'active'),
    -- Tercero Básico A
    ('50000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', '2025-01-05', 'active'),
    ('50000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', '2025-01-05', 'active'),
    -- Quinto Básico A
    ('50000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000007', '22222222-2222-2222-2222-222222222222', '2025-01-05', 'active'),
    ('50000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000007', '22222222-2222-2222-2222-222222222222', '2025-01-05', 'active');

-- ============================================
-- 10. ASISTENCIA (Datos de ejemplo)
-- ============================================

-- Asistencia de la última semana para Primero Básico A - Matemáticas
INSERT INTO attendance (class_id, student_id, date, status, method, recorded_by) VALUES
    -- Lunes pasado
    ('40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '2025-10-06', 'present', 'voice', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '2025-10-06', 'present', 'voice', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', '2025-10-06', 'late', 'manual', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000004', '2025-10-06', 'present', 'voice', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    -- Martes pasado
    ('40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '2025-10-07', 'present', 'voice', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '2025-10-07', 'absent', 'manual', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', '2025-10-07', 'present', 'voice', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000004', '2025-10-07', 'present', 'voice', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

-- ============================================
-- 11. EVALUACIONES
-- ============================================

INSERT INTO assessments (id, class_id, assessment_type_id, name, description, max_score, weight, date, is_published) VALUES
    ('60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', (SELECT id FROM assessment_types WHERE name = 'Examen' LIMIT 1), 'Examen Unidad 1: Números', 'Evaluación de números del 1 al 100', 100.00, 2.00, '2025-09-15', true),
    ('60000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', (SELECT id FROM assessment_types WHERE name = 'Tarea' LIMIT 1), 'Tarea: Sumas y Restas', 'Ejercicios de práctica', 20.00, 1.00, '2025-09-20', true),
    ('60000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000006', (SELECT id FROM assessment_types WHERE name = 'Examen' LIMIT 1), 'Examen: Fracciones', 'Evaluación de fracciones', 100.00, 2.00, '2025-10-01', true);

-- ============================================
-- 12. CALIFICACIONES
-- ============================================

INSERT INTO grades_records (assessment_id, student_id, score, method, graded_by) VALUES
    -- Examen Unidad 1
    ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 95.00, 'manual', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', 88.50, 'manual', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', 92.00, 'voice', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000004', 85.00, 'manual', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    -- Tarea
    ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 18.00, 'manual', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', 20.00, 'manual', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000003', 19.00, 'manual', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000004', 17.50, 'manual', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

-- ============================================
-- 13. TAREAS
-- ============================================

INSERT INTO homework (id, class_id, title, description, assigned_date, due_date, max_score, is_published, created_by) VALUES
    ('70000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Ejercicios de Multiplicación', 'Resolver las páginas 45-47 del libro de texto', '2025-10-08', '2025-10-15', 20.00, true, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('70000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'Lectura: El Principito', 'Leer capítulos 1-3 y escribir resumen', '2025-10-07', '2025-10-14', 30.00, true, 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
    ('70000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000006', 'Problemas de Álgebra', 'Resolver ecuaciones lineales del cuaderno', '2025-10-09', '2025-10-16', 25.00, true, 'ffffffff-ffff-ffff-ffff-ffffffffffff');

-- ============================================
-- 14. ENTREGAS DE TAREAS
-- ============================================

INSERT INTO homework_submissions (homework_id, student_id, submission_date, status, score, feedback, graded_by) VALUES
    ('70000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '2025-10-14 14:30:00', 'graded', 19.00, 'Excelente trabajo', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('70000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '2025-10-15 10:00:00', 'graded', 18.50, 'Muy bien', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('70000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', '2025-10-15 16:45:00', 'late', 17.00, 'Entrega tardía', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

-- ============================================
-- 15. NOTIFICACIONES
-- ============================================

INSERT INTO notifications (user_id, title, message, type, is_read, related_entity_type, related_entity_id) VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Nueva clase asignada', 'Se te ha asignado la clase de Matemáticas en Primero Básico A', 'assignment', true, 'class', '40000000-0000-0000-0000-000000000001'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Nueva clase asignada', 'Se te ha asignado la clase de Lenguaje en Primero Básico A', 'assignment', false, 'class', '40000000-0000-0000-0000-000000000002'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Recordatorio', 'Tienes 3 tareas pendientes de calificar', 'system', false, NULL, NULL);

COMMIT;

-- ============================================
-- VERIFICACIÓN DE DATOS
-- ============================================

-- Contar registros insertados
SELECT 'academic_years' as tabla, COUNT(*) as registros FROM academic_years
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'subjects', COUNT(*) FROM subjects
UNION ALL
SELECT 'grades', COUNT(*) FROM grades
UNION ALL
SELECT 'sections', COUNT(*) FROM sections
UNION ALL
SELECT 'classes', COUNT(*) FROM classes
UNION ALL
SELECT 'schedules', COUNT(*) FROM schedules
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'enrollments', COUNT(*) FROM enrollments
UNION ALL
SELECT 'attendance', COUNT(*) FROM attendance
UNION ALL
SELECT 'assessments', COUNT(*) FROM assessments
UNION ALL
SELECT 'grades_records', COUNT(*) FROM grades_records
UNION ALL
SELECT 'homework', COUNT(*) FROM homework
UNION ALL
SELECT 'homework_submissions', COUNT(*) FROM homework_submissions
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;

-- ============================================
-- CONSULTAS DE EJEMPLO
-- ============================================

-- Ver todas las clases con información completa
SELECT * FROM v_classes_full;

-- Ver estudiantes matriculados actualmente
SELECT * FROM v_student_enrollments;

-- Ver resumen de asistencia
SELECT * FROM v_attendance_summary;

-- Calcular promedio de un estudiante
SELECT calculate_student_average(
    '50000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001'
) as promedio;
