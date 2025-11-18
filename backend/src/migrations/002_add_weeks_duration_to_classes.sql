-- ============================================
-- MIGRACIÓN: Agregar duración en semanas a clases
-- Fecha: 2025-11-18
-- Descripción: Agrega columna weeks_duration a tabla classes
-- ============================================

-- Paso 1: Agregar columna weeks_duration a classes
ALTER TABLE classes 
ADD COLUMN weeks_duration INTEGER DEFAULT 52 NOT NULL;

-- Paso 2: Crear comentario
COMMENT ON COLUMN classes.weeks_duration IS 'Duración de la clase en semanas (típicamente 36-52)';

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================
-- Verificación: ejecutar estos queries para confirmar los cambios
-- SELECT id, classroom, weeks_duration FROM classes LIMIT 5;
-- ALTER TABLE classes ALTER COLUMN weeks_duration DROP DEFAULT;
