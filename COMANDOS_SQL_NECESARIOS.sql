-- ============================================
-- COMANDOS SQL PARA CORREGIR LA BD
-- ============================================
-- Estos comandos deben ejecutarse como usuario 'postgres' o con permisos de superuser
-- Ejecuta uno por uno en pgAdmin o psql

-- 1. TABLA: assessments
-- Ubicación en schema.sql: Líneas 276-289
-- Verificar que exista la tabla con estas columnas:
-- - id (UUID)
-- - class_id (UUID) 
-- - assessment_type_id (UUID)
-- - name (VARCHAR) ← IMPORTANTE: es "name", no "title"
-- - description (TEXT)
-- - max_score (DECIMAL) ← IMPORTANTE: es "max_score", no "total_points"
-- - weight (DECIMAL)
-- - date (DATE)
-- - due_date (DATE)
-- - is_published (BOOLEAN)
-- - created_at, updated_at

-- Si la tabla no tiene "max_score", agregar:
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS max_score DECIMAL(5,2) NOT NULL DEFAULT 100.00;

-- Si "name" no existe pero tiene "title", renombrar:
-- ALTER TABLE assessments RENAME COLUMN title TO name;

-- ============================================

-- 2. TABLA: grades_records 
-- Ubicación en schema.sql: Líneas 301-315
-- Verificar que exista con estas columnas:
-- - id (UUID)
-- - assessment_id (UUID)
-- - student_id (UUID)
-- - score (DECIMAL)
-- - method (VARCHAR)
-- - observations (TEXT) ← IMPORTANTE: es "observations", no "comments"
-- - graded_by (UUID)
-- - graded_at (TIMESTAMP)
-- - created_at, updated_at

-- Si no existe "observations", agregar:
ALTER TABLE grades_records ADD COLUMN IF NOT EXISTS observations TEXT;

-- Si existe "comments" en lugar de "observations", renombrar:
-- ALTER TABLE grades_records RENAME COLUMN comments TO observations;

-- ============================================

-- 3. TABLA: reports
-- Ubicación en schema.sql: Líneas 393-406
-- Verificar que exista con estas columnas:
-- - id (UUID)
-- - class_id (UUID) ← IMPORTANTE: DEBE EXISTIR
-- - title (VARCHAR)
-- - report_type (VARCHAR)
-- - type (VARCHAR)
-- - format (VARCHAR)
-- - data (JSONB)
-- - filters (JSONB)
-- - file_url (TEXT)
-- - generated_by (UUID)
-- - created_by (UUID)
-- - created_at, updated_at

-- Si no existe "class_id", agregar:
ALTER TABLE reports ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id) ON DELETE CASCADE;

-- Si no existe "report_type", agregar:
ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_type VARCHAR(50);

-- Crear índice si no existe:
CREATE INDEX IF NOT EXISTS idx_reports_class_id ON reports(class_id);

-- ============================================

-- 4. TABLA: attendance
-- Ubicación en schema.sql: Líneas 236-248
-- Verificar que exista con estas columnas:
-- - id (UUID)
-- - class_id (UUID)
-- - student_id (UUID)
-- - date (DATE)
-- - status (VARCHAR) - 'present', 'absent', 'late', 'excused'
-- - method (VARCHAR) - 'manual', 'voice'
-- - notes (TEXT)
-- - recorded_by (UUID)
-- - created_at, updated_at

-- ESTA TABLA ESTÁ CORRECTA - NO REQUIERE CAMBIOS

-- ============================================

-- RESUMEN DE CAMBIOS:
-- 1. assessments: Agregar "max_score" si no existe
-- 2. grades_records: Agregar "observations" si no existe
-- 3. reports: Agregar "class_id" y "report_type" si no existen
-- 4. attendance: Ya tiene todas las columnas necesarias ✓

-- Después de ejecutar estos comandos, el backend debería funcionar correctamente.
