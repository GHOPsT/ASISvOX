-- ============================================
-- DATOS DE PRUEBA - ASISvOX
-- Este script debe ejecutarse DESPUÉS de schema.sql
-- ============================================

-- ============================================
-- 1. INSERTAR PROFESOR DE PRUEBA
-- ============================================

INSERT INTO users (email, password_hash, full_name, role) 
SELECT 'profesor@asisVox.com', crypt('demo123', gen_salt('bf')), 'Prof. María González', 'teacher'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'profesor@asisVox.com');

-- ============================================
-- 2. OBTENER IDs NECESARIAS
-- ============================================

-- Las siguientes inserciones usarán datos que ya existen o serán creados:

-- Obtener el ID del profesor
DO $$
DECLARE
    v_teacher_id UUID;
    v_academic_year_id UUID;
    v_subject_math_id UUID;
    v_subject_physics_id UUID;
    v_grade_10_id UUID;
    v_grade_11_id UUID;
    v_section_a_id UUID;
    v_section_b_id UUID;
BEGIN
    -- Obtener ID del profesor
    SELECT id INTO v_teacher_id FROM users WHERE email = 'profesor@asisVox.com';
    
    -- Obtener ID del año académico actual
    SELECT id INTO v_academic_year_id FROM academic_years WHERE is_current = true LIMIT 1;
    
    -- Si no existe año académico, crear uno
    IF v_academic_year_id IS NULL THEN
        INSERT INTO academic_years (name, start_date, end_date, is_current) 
        VALUES ('2025', '2025-01-01', '2025-12-31', true)
        RETURNING id INTO v_academic_year_id;
    END IF;

    -- Insertar materias (Matemáticas, Física)
    INSERT INTO subjects (name, code, color, is_active) 
    SELECT 'Matemáticas', 'MATH', '#4CAF50', true
    WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE code = 'MATH');
    
    INSERT INTO subjects (name, code, color, is_active) 
    SELECT 'Física', 'PHYS', '#2196F3', true
    WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE code = 'PHYS');
    
    SELECT id INTO v_subject_math_id FROM subjects WHERE code = 'MATH';
    SELECT id INTO v_subject_physics_id FROM subjects WHERE code = 'PHYS';

    -- Insertar grados (10°, 11°)
    INSERT INTO grades (name, level, is_active) 
    SELECT '10° Grado', 10, true
    WHERE NOT EXISTS (SELECT 1 FROM grades WHERE level = 10);
    
    INSERT INTO grades (name, level, is_active) 
    SELECT '11° Grado', 11, true
    WHERE NOT EXISTS (SELECT 1 FROM grades WHERE level = 11);
    
    SELECT id INTO v_grade_10_id FROM grades WHERE level = 10;
    SELECT id INTO v_grade_11_id FROM grades WHERE level = 11;

    -- Insertar secciones para 10° (A, B)
    INSERT INTO sections (grade_id, name, academic_year_id, max_students, is_active) 
    SELECT v_grade_10_id, 'A', v_academic_year_id, 30, true
    WHERE NOT EXISTS (
        SELECT 1 FROM sections 
        WHERE grade_id = v_grade_10_id AND name = 'A' AND academic_year_id = v_academic_year_id
    );
    
    INSERT INTO sections (grade_id, name, academic_year_id, max_students, is_active) 
    SELECT v_grade_10_id, 'B', v_academic_year_id, 30, true
    WHERE NOT EXISTS (
        SELECT 1 FROM sections 
        WHERE grade_id = v_grade_10_id AND name = 'B' AND academic_year_id = v_academic_year_id
    );
    
    SELECT id INTO v_section_a_id FROM sections 
    WHERE grade_id = v_grade_10_id AND name = 'A' AND academic_year_id = v_academic_year_id;
    
    SELECT id INTO v_section_b_id FROM sections 
    WHERE grade_id = v_grade_10_id AND name = 'B' AND academic_year_id = v_academic_year_id;

    -- Insertar clases
    -- Clase 1: Matemáticas 10°A
    INSERT INTO classes (section_id, subject_id, teacher_id, academic_year_id, classroom, is_active) 
    SELECT v_section_a_id, v_subject_math_id, v_teacher_id, v_academic_year_id, 'Aula 101', true
    WHERE NOT EXISTS (
        SELECT 1 FROM classes 
        WHERE section_id = v_section_a_id AND subject_id = v_subject_math_id AND academic_year_id = v_academic_year_id
    );

    -- Clase 2: Matemáticas 10°B
    INSERT INTO classes (section_id, subject_id, teacher_id, academic_year_id, classroom, is_active) 
    SELECT v_section_b_id, v_subject_math_id, v_teacher_id, v_academic_year_id, 'Aula 102', true
    WHERE NOT EXISTS (
        SELECT 1 FROM classes 
        WHERE section_id = v_section_b_id AND subject_id = v_subject_math_id AND academic_year_id = v_academic_year_id
    );

    RAISE NOTICE 'Datos de prueba insertados exitosamente';
END $$;

-- ============================================
-- 3. INSERTAR ESTUDIANTES DE PRUEBA (Opcional)
-- ============================================

-- Insertar algunos estudiantes de prueba
INSERT INTO students (first_name, last_name, identification_number, date_of_birth, gender, is_active) VALUES
    ('Juan', 'Pérez', '12345678', '2009-05-15', 'male', true),
    ('María', 'García', '12345679', '2009-08-22', 'female', true),
    ('Carlos', 'López', '12345680', '2009-03-10', 'male', true),
    ('Ana', 'Martínez', '12345681', '2009-11-05', 'female', true),
    ('Luis', 'Rodríguez', '12345682', '2009-02-28', 'male', true)
ON CONFLICT (identification_number) DO NOTHING;

-- ============================================
-- 4. VERIFICACIÓN FINAL
-- ============================================

-- Mostrar datos insertados
SELECT 'Profesores:' as "Verificación";
SELECT id, email, full_name, role FROM users WHERE role = 'teacher';

SELECT '' as "";
SELECT 'Materias:' as "Verificación";
SELECT id, name, code FROM subjects LIMIT 5;

SELECT '' as "";
SELECT 'Grados:' as "Verificación";
SELECT id, name, level FROM grades;

SELECT '' as "";
SELECT 'Secciones:' as "Verificación";
SELECT s.id, g.name as grade, s.name as section FROM sections s
JOIN grades g ON s.grade_id = g.id;

SELECT '' as "";
SELECT 'Clases:' as "Verificación";
SELECT 
    c.id,
    sub.name as subject,
    g.name as grade,
    s.name as section,
    u.full_name as teacher,
    c.classroom
FROM classes c
JOIN subjects sub ON c.subject_id = sub.id
JOIN sections s ON c.section_id = s.id
JOIN grades g ON s.grade_id = g.id
JOIN users u ON c.teacher_id = u.id;

SELECT '' as "";
SELECT 'Estudiantes:' as "Verificación";
SELECT id, first_name, last_name, identification_number FROM students LIMIT 5;
