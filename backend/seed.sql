-- ============================================
-- DATOS DE PRUEBA - ASISvOX
-- Este script debe ejecutarse DESPUÉS de schema.sql
-- ============================================

-- ============================================
-- 1. CREAR ENTIDAD DE PRUEBA
-- ============================================

INSERT INTO entities (name, code, address, representative_name, representative_phone, representative_email, institutional_phone, institutional_address, institutional_email)
SELECT 'Instituto de Prueba', 'INS_TEST', 'Calle Test 123', 'Director Test', '555-0001', 'director@test.com', '555-0002', 'Calle Test 123', 'inst@test.com'
WHERE NOT EXISTS (SELECT 1 FROM entities WHERE code = 'INS_TEST');

-- ============================================
-- 2. INSERTAR ADMIN GENERAL
-- ============================================

INSERT INTO users (email, password_hash, full_name, role) 
SELECT 'admin@asisvox.com', crypt('Admin123!', gen_salt('bf')), 'Admin General', 'admin_general'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@asisvox.com');

-- ============================================
-- 3. INSERTAR PROFESOR DE PRUEBA CON ENTIDAD
-- ============================================

DO $$
DECLARE
    v_entity_id UUID;
BEGIN
    -- Obtener ID de la entidad de prueba
    SELECT id INTO v_entity_id FROM entities WHERE code = 'INS_TEST' LIMIT 1;
    
    -- Insertar profesor con entity_id
    INSERT INTO users (email, password_hash, full_name, role, entity_id) 
    SELECT 'profesor@asisVox.com', crypt('demo123', gen_salt('bf')), 'Prof. María González', 'teacher', v_entity_id
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'profesor@asisVox.com');
END $$;

-- ============================================
-- 3B. INSERTAR PROFESORES INDEPENDIENTES
-- ============================================

DO $$
DECLARE
    v_independent_entity_id UUID;
    v_teacher_id UUID;
BEGIN
    -- Crear entidad para Prof. Juan Independiente
    INSERT INTO entities (name, code, address, representative_email, is_active)
    SELECT 'Prof. Juan Rodríguez - Independiente', 'PROF_JUAN_IND', 'Dirección Personal', 'juan.independiente@mail.com', true
    WHERE NOT EXISTS (SELECT 1 FROM entities WHERE code = 'PROF_JUAN_IND')
    RETURNING id INTO v_independent_entity_id;
    
    -- Si no se creó, obtenerla
    IF v_independent_entity_id IS NULL THEN
        SELECT id INTO v_independent_entity_id FROM entities WHERE code = 'PROF_JUAN_IND';
    END IF;
    
    -- Insertar profesor independiente con su entidad
    INSERT INTO users (email, password_hash, full_name, role, entity_id)
    SELECT 'juan.independiente@mail.com', crypt('Juan123!', gen_salt('bf')), 'Prof. Juan Rodríguez', 'teacher', v_independent_entity_id
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'juan.independiente@mail.com');
    
    -- Crear entidad para Prof. Ana Independiente
    INSERT INTO entities (name, code, address, representative_email, is_active)
    SELECT 'Prof. Ana Martínez - Independiente', 'PROF_ANA_IND', 'Dirección Personal', 'ana.independiente@mail.com', true
    WHERE NOT EXISTS (SELECT 1 FROM entities WHERE code = 'PROF_ANA_IND')
    RETURNING id INTO v_independent_entity_id;
    
    -- Si no se creó, obtenerla
    IF v_independent_entity_id IS NULL THEN
        SELECT id INTO v_independent_entity_id FROM entities WHERE code = 'PROF_ANA_IND';
    END IF;
    
    -- Insertar segunda profesora independiente
    INSERT INTO users (email, password_hash, full_name, role, entity_id)
    SELECT 'ana.independiente@mail.com', crypt('Ana123!', gen_salt('bf')), 'Prof. Ana Martínez', 'teacher', v_independent_entity_id
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ana.independiente@mail.com');
    
    RAISE NOTICE 'Profesores independientes creados exitosamente';
END $$;

-- ============================================
-- 2. OBTENER IDs NECESARIAS
-- ============================================

-- Las siguientes inserciones usarán datos que ya existen o serán creados:

-- Obtener el ID del profesor
DO $$
DECLARE
    v_teacher_id UUID;
    v_teacher_juan_id UUID;
    v_teacher_ana_id UUID;
    v_academic_year_id UUID;
    v_subject_math_id UUID;
    v_subject_physics_id UUID;
    v_subject_english_id UUID;
    v_grade_10_id UUID;
    v_grade_11_id UUID;
    v_section_a_id UUID;
    v_section_b_id UUID;
    v_section_nosection_id UUID;
BEGIN
    -- Obtener ID del profesor con entidad
    SELECT id INTO v_teacher_id FROM users WHERE email = 'profesor@asisVox.com';
    
    -- Obtener IDs de profesores independientes
    SELECT id INTO v_teacher_juan_id FROM users WHERE email = 'juan.independiente@mail.com';
    SELECT id INTO v_teacher_ana_id FROM users WHERE email = 'ana.independiente@mail.com';
    
    -- Obtener ID del año académico actual
    SELECT id INTO v_academic_year_id FROM academic_years WHERE is_current = true LIMIT 1;
    
    -- Si no existe año académico, crear uno
    IF v_academic_year_id IS NULL THEN
        INSERT INTO academic_years (name, start_date, end_date, is_current) 
        VALUES ('2025', '2025-01-01', '2025-12-31', true)
        RETURNING id INTO v_academic_year_id;
    END IF;

    -- Insertar materias (Matemáticas, Física, Inglés)
    INSERT INTO subjects (name, code, color, is_active) 
    SELECT 'Matemáticas', 'MATH', '#4CAF50', true
    WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE code = 'MATH');
    
    INSERT INTO subjects (name, code, color, is_active) 
    SELECT 'Física', 'PHYS', '#2196F3', true
    WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE code = 'PHYS');

    INSERT INTO subjects (name, code, color, is_active) 
    SELECT 'Inglés', 'ENGLISH', '#FF9800', true
    WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE code = 'ENGLISH');
    
    SELECT id INTO v_subject_math_id FROM subjects WHERE code = 'MATH';
    SELECT id INTO v_subject_physics_id FROM subjects WHERE code = 'PHYS';
    SELECT id INTO v_subject_english_id FROM subjects WHERE code = 'ENGLISH';

    -- Insertar grados (10°, 11°)
    INSERT INTO grades (name, level, is_active) 
    SELECT '10° Grado', 10, true
    WHERE NOT EXISTS (SELECT 1 FROM grades WHERE level = 10);
    
    INSERT INTO grades (name, level, is_active) 
    SELECT '11° Grado', 11, true
    WHERE NOT EXISTS (SELECT 1 FROM grades WHERE level = 11);
    
    SELECT id INTO v_grade_10_id FROM grades WHERE level = 10;
    SELECT id INTO v_grade_11_id FROM grades WHERE level = 11;

    -- Obtener la entidad de prueba
    DECLARE
        v_entity_test_id UUID;
    BEGIN
        SELECT id INTO v_entity_test_id FROM entities WHERE code = 'INS_TEST' LIMIT 1;

        -- Insertar secciones para 10° (A, B, Sin Sección)
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

        INSERT INTO sections (grade_id, name, academic_year_id, max_students, is_active) 
        SELECT v_grade_10_id, 'Sin Sección', v_academic_year_id, 999, true
        WHERE NOT EXISTS (
            SELECT 1 FROM sections 
            WHERE grade_id = v_grade_10_id AND name = 'Sin Sección' AND academic_year_id = v_academic_year_id
        );
        
        SELECT id INTO v_section_a_id FROM sections 
        WHERE grade_id = v_grade_10_id AND name = 'A' AND academic_year_id = v_academic_year_id;
        
        SELECT id INTO v_section_b_id FROM sections 
        WHERE grade_id = v_grade_10_id AND name = 'B' AND academic_year_id = v_academic_year_id;

        SELECT id INTO v_section_nosection_id FROM sections 
        WHERE grade_id = v_grade_10_id AND name = 'Sin Sección' AND academic_year_id = v_academic_year_id;

        -- ============================================
        -- CLASES PARA PROFESOR CON ENTIDAD
        -- ============================================
        
        -- Clase 1: Matemáticas 10°A (Profesor María González)
        INSERT INTO classes (entity_id, section_id, subject_id, teacher_id, academic_year_id, classroom, weeks_duration, is_active) 
        SELECT v_entity_test_id, v_section_a_id, v_subject_math_id, v_teacher_id, v_academic_year_id, 'Aula 101', 52, true
        WHERE NOT EXISTS (
            SELECT 1 FROM classes 
            WHERE section_id = v_section_a_id AND subject_id = v_subject_math_id AND teacher_id = v_teacher_id AND academic_year_id = v_academic_year_id
        );

        -- Clase 2: Física 10°B (Profesor María González)
        INSERT INTO classes (entity_id, section_id, subject_id, teacher_id, academic_year_id, classroom, weeks_duration, is_active) 
        SELECT v_entity_test_id, v_section_b_id, v_subject_physics_id, v_teacher_id, v_academic_year_id, 'Aula 102', 52, true
        WHERE NOT EXISTS (
            SELECT 1 FROM classes 
            WHERE section_id = v_section_b_id AND subject_id = v_subject_physics_id AND teacher_id = v_teacher_id AND academic_year_id = v_academic_year_id
        );

        -- ============================================
        -- CLASES PARA PROFESORES INDEPENDIENTES
        -- ============================================
        
        DECLARE
            v_entity_juan_id UUID;
            v_entity_ana_id UUID;
        BEGIN
            -- Obtener entidades de profesores independientes
            SELECT id INTO v_entity_juan_id FROM entities WHERE code = 'PROF_JUAN_IND' LIMIT 1;
            SELECT id INTO v_entity_ana_id FROM entities WHERE code = 'PROF_ANA_IND' LIMIT 1;

            -- Clase 3: Inglés 10°A (Prof. Juan Independiente)
            IF v_teacher_juan_id IS NOT NULL AND v_entity_juan_id IS NOT NULL THEN
                INSERT INTO classes (entity_id, section_id, subject_id, teacher_id, academic_year_id, classroom, weeks_duration, is_active) 
                SELECT v_entity_juan_id, v_section_a_id, v_subject_english_id, v_teacher_juan_id, v_academic_year_id, 'Aula 201', 52, true
                WHERE NOT EXISTS (
                    SELECT 1 FROM classes 
                    WHERE section_id = v_section_a_id AND subject_id = v_subject_english_id AND teacher_id = v_teacher_juan_id AND academic_year_id = v_academic_year_id
                );
            END IF;

            -- Clase 4: Matemáticas Sin Sección (Prof. Ana Independiente - Tutoría)
            IF v_teacher_ana_id IS NOT NULL AND v_entity_ana_id IS NOT NULL THEN
                INSERT INTO classes (entity_id, section_id, subject_id, teacher_id, academic_year_id, classroom, weeks_duration, is_active) 
                SELECT v_entity_ana_id, v_section_nosection_id, v_subject_math_id, v_teacher_ana_id, v_academic_year_id, 'Sala de Tutoría', 36, true
                WHERE NOT EXISTS (
                    SELECT 1 FROM classes 
                    WHERE section_id = v_section_nosection_id AND subject_id = v_subject_math_id AND teacher_id = v_teacher_ana_id AND academic_year_id = v_academic_year_id
                );
            END IF;
        END;

        RAISE NOTICE 'Datos de prueba insertados exitosamente';
    END;
END $$;

-- ============================================
-- 4. INSERTAR ESTUDIANTES DE PRUEBA (Opcional)
-- ============================================

-- Insertar algunos estudiantes de prueba
INSERT INTO students (first_name, last_name, identification_number, date_of_birth, gender, is_active) VALUES
    ('Juan', 'Pérez', '12345678', '2009-05-15', 'male', true),
    ('María', 'García', '12345679', '2009-08-22', 'female', true),
    ('Carlos', 'López', '12345680', '2009-03-10', 'male', true),
    ('Ana', 'Martínez', '12345681', '2009-11-05', 'female', true),
    ('Luis', 'Rodríguez', '12345682', '2009-02-28', 'male', true)
ON CONFLICT (identification_number) DO NOTHING;

-- Inscribir estudiantes en las secciones (COMENTADO)
-- Los enrollments deben ser creados por el admin a través de la interfaz,
-- no automáticamente en el seed. Descomentar solo si se necesita para testing.
/*
DO $$
DECLARE
    v_section_a_id UUID;
    v_academic_year_id UUID;
    v_student_id UUID;
    v_student_ids UUID[];
BEGIN
    -- Obtener las IDs necesarias
    SELECT id INTO v_academic_year_id FROM academic_years WHERE is_current = true LIMIT 1;
    SELECT id INTO v_section_a_id FROM sections 
    WHERE grade_id = (SELECT id FROM grades WHERE level = 10)
    AND name = 'A' AND academic_year_id = v_academic_year_id LIMIT 1;
    
    -- Obtener IDs de estudiantes
    SELECT ARRAY_AGG(id) INTO v_student_ids FROM students 
    WHERE identification_number IN ('12345678', '12345679', '12345680', '12345681', '12345682');
    
    -- Inscribir cada estudiante
    IF v_student_ids IS NOT NULL THEN
        FOREACH v_student_id IN ARRAY v_student_ids
        LOOP
            INSERT INTO enrollments (student_id, section_id, academic_year_id, status, enrollment_date)
            SELECT v_student_id, v_section_a_id, v_academic_year_id, 'active', CURRENT_DATE
            WHERE NOT EXISTS (
                SELECT 1 FROM enrollments 
                WHERE student_id = v_student_id 
                AND section_id = v_section_a_id
            );
        END LOOP;
    END IF;
    
    RAISE NOTICE 'Estudiantes inscritos exitosamente';
END $$;
*/

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
