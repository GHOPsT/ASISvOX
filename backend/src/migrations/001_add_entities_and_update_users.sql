-- ============================================
-- MIGRACIÓN: Agregar soporte Multi-Entidad
-- Fecha: 2025-11-18
-- Descripción: Agrega tabla entities, actualiza users y classes
-- ============================================

-- Paso 1: Crear tabla entities
CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    address VARCHAR(500),
    image_url TEXT,
    representative_name VARCHAR(255),
    representative_phone VARCHAR(20),
    representative_email VARCHAR(255),
    institutional_phone VARCHAR(20),
    institutional_address VARCHAR(500),
    institutional_email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para entities
CREATE INDEX idx_entities_code ON entities(code);
CREATE INDEX idx_entities_is_active ON entities(is_active);

COMMENT ON TABLE entities IS 'Entidades/Instituciones educativas';

-- Paso 2: Insertar entidad por defecto
INSERT INTO entities (name, code, address, representative_name, representative_phone, representative_email, institutional_phone, institutional_address, institutional_email)
VALUES ('Institución Principal', 'INST-001', 'Dirección Principal', 'Director General', '555-0000', 'director@institucion.com', '555-0001', 'Dirección Administrativa', 'contacto@institucion.com');

-- Paso 3: Modificar tabla users - IMPORTANTE: Este paso requiere cuidado
-- Primero, cambiar valores de role de 'admin' a 'admin_general' para usuarios existentes
UPDATE users SET role = 'admin_general' WHERE role = 'admin';

-- Paso 4: Agregar columnas a users
ALTER TABLE users 
ADD COLUMN entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
ADD COLUMN max_teachers_allowed INTEGER DEFAULT 0;

-- Paso 5: Crear índices para users
CREATE INDEX idx_users_entity_id ON users(entity_id);

-- Paso 6: Modificar constraint de role en users
-- Primero eliminar el constraint antiguo
ALTER TABLE users DROP CONSTRAINT users_role_check;

-- Agregar nuevo constraint con roles actualizados
ALTER TABLE users 
ADD CONSTRAINT users_role_check CHECK (role IN ('admin_general', 'admin_entity', 'teacher'));

-- Paso 7: Crear trigger para entities (si no existe)
CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON entities 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Paso 8: Modificar tabla classes para agregar entity_id
-- Primero, obtener la entidad por defecto para los registros existentes
-- (Asumiendo que hay al menos una entidad)
DO $$
DECLARE
    default_entity_id UUID;
BEGIN
    SELECT id INTO default_entity_id FROM entities LIMIT 1;
    
    -- Agregar columna entity_id a classes
    ALTER TABLE classes 
    ADD COLUMN entity_id UUID REFERENCES entities(id) ON DELETE CASCADE;
    
    -- Actualizar todos los registros existentes con la entidad por defecto
    UPDATE classes SET entity_id = default_entity_id WHERE entity_id IS NULL;
    
    -- Hacer entity_id NOT NULL después de poblar los datos
    ALTER TABLE classes 
    ALTER COLUMN entity_id SET NOT NULL;
    
    -- Crear índice para entity_id
    CREATE INDEX idx_classes_entity_id ON classes(entity_id);
END $$;

-- Paso 9: Actualizar UNIQUE constraint en classes para incluir entity_id
-- Eliminar constraint anterior
ALTER TABLE classes DROP CONSTRAINT classes_section_id_subject_id_academic_year_id_key;

-- Agregar nuevo constraint con entity_id
ALTER TABLE classes 
ADD CONSTRAINT classes_section_id_subject_id_academic_year_id_entity_id_key 
UNIQUE(section_id, subject_id, academic_year_id, entity_id);

-- Paso 10: Actualizar vista v_classes_full
DROP VIEW IF EXISTS v_classes_full CASCADE;

CREATE VIEW v_classes_full AS
SELECT 
    c.id as class_id,
    c.entity_id,
    e.name as entity_name,
    sub.name as subject_name,
    sub.code as subject_code,
    sub.color as subject_color,
    g.name as grade_name,
    sec.name as section_name,
    u.full_name as teacher_name,
    c.classroom,
    ay.name as academic_year
FROM classes c
JOIN entities e ON c.entity_id = e.id
JOIN subjects sub ON c.subject_id = sub.id
JOIN sections sec ON c.section_id = sec.id
JOIN grades g ON sec.grade_id = g.id
JOIN users u ON c.teacher_id = u.id
JOIN academic_years ay ON c.academic_year_id = ay.id;

-- Paso 11: Actualizar comentarios
COMMENT ON TABLE users IS 'Usuarios del sistema (admin_general, admin_entity, profesores)';
COMMENT ON TABLE classes IS 'Clases que combinan sección, materia, profesor y entidad';

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================
-- Verificación: ejecutar estos queries para confirmar los cambios
-- SELECT * FROM entities;
-- SELECT COUNT(*) FROM users WHERE role IN ('admin_general', 'admin_entity', 'teacher');
-- SELECT * FROM classes LIMIT 1; -- Verificar que tiene entity_id
