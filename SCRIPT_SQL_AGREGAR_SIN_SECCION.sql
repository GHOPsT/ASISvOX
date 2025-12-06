
════════════════════════════════════════════════════════════════════════════════

    🗄️ SCRIPT SQL - Agregar "Sin Sección" a BD Local

════════════════════════════════════════════════════════════════════════════════

Este script agrega la sección "Sin Sección" para todos los grados y años académicos.

USAR ESTE SCRIPT SI:
├─ Ya tienes la BD corriendo localmente
├─ Quieres agregar "Sin Sección" sin re-ejecutar init-db
└─ Prefieres hacerlo manualmente

════════════════════════════════════════════════════════════════════════════════


OPCIÓN 1: Ejecutar línea por línea en pgAdmin o psql
════════════════════════════════════════════════════════════════════════════════

-- Paso 1: Verificar qué grados existen
SELECT id, name, level FROM grades WHERE is_active = true;

-- Paso 2: Verificar qué años académicos existen
SELECT id, name, start_date, end_date, is_current FROM academic_years;

-- Paso 3: Agregar "Sin Sección" para cada grado existente
-- (Reemplaza los UUIDs con los IDs reales de tu BD)

INSERT INTO sections (grade_id, name, academic_year_id, max_students, is_active) 
SELECT id, 'Sin Sección', (SELECT id FROM academic_years LIMIT 1), 999, true
FROM grades
WHERE is_active = true
AND NOT EXISTS (
    SELECT 1 FROM sections 
    WHERE name = 'Sin Sección' 
    AND grade_id = grades.id 
    AND academic_year_id = (SELECT id FROM academic_years LIMIT 1)
);

-- Paso 4: Verificar que se agregaron correctamente
SELECT s.id, s.name, g.name as grade, s.max_students, s.is_active
FROM sections s
JOIN grades g ON s.grade_id = g.id
WHERE s.name = 'Sin Sección'
ORDER BY g.name;


════════════════════════════════════════════════════════════════════════════════

OPCIÓN 2: Script completo para copiar/pegar
════════════════════════════════════════════════════════════════════════════════

-- ============================================
-- AGREGAR "SIN SECCIÓN" A TODOS LOS GRADOS
-- ============================================
-- Ejecuta este script completo en tu BD local

-- Step 1: Verificar datos existentes
SELECT 'Grados activos:' as paso;
SELECT id, name, level FROM grades WHERE is_active = true;

SELECT 'Años académicos:' as paso;
SELECT id, name, start_date, end_date, is_current FROM academic_years ORDER BY is_current DESC;

-- Step 2: Insertar "Sin Sección" para cada grado/año académico
SELECT 'Insertando "Sin Sección"...' as paso;

INSERT INTO sections (grade_id, name, academic_year_id, max_students, is_active) 
SELECT 
    g.id,
    'Sin Sección',
    ay.id,
    999,
    true
FROM grades g
CROSS JOIN academic_years ay
WHERE g.is_active = true
AND ay.is_current = true
AND NOT EXISTS (
    SELECT 1 FROM sections s
    WHERE s.grade_id = g.id
    AND s.academic_year_id = ay.id
    AND s.name = 'Sin Sección'
)
ORDER BY g.level;

-- Step 3: Verificar insertadas
SELECT 'Resultado final:' as paso;
SELECT 
    s.id,
    g.name as grado,
    s.name as seccion,
    ay.name as año_academico,
    s.max_students,
    s.is_active
FROM sections s
JOIN grades g ON s.grade_id = g.id
JOIN academic_years ay ON s.academic_year_id = ay.id
WHERE s.name = 'Sin Sección'
ORDER BY g.level, ay.name;


════════════════════════════════════════════════════════════════════════════════

OPCIÓN 3: Agregar para TODOS los años académicos (no solo actual)
════════════════════════════════════════════════════════════════════════════════

-- Si quieres agregar "Sin Sección" a TODOS los años (no solo el actual)
-- Reemplaza la condición: AND ay.is_current = true
-- Con: AND ay.end_date >= CURRENT_DATE

INSERT INTO sections (grade_id, name, academic_year_id, max_students, is_active) 
SELECT 
    g.id,
    'Sin Sección',
    ay.id,
    999,
    true
FROM grades g
CROSS JOIN academic_years ay
WHERE g.is_active = true
AND ay.end_date >= CURRENT_DATE
AND NOT EXISTS (
    SELECT 1 FROM sections s
    WHERE s.grade_id = g.id
    AND s.academic_year_id = ay.id
    AND s.name = 'Sin Sección'
);


════════════════════════════════════════════════════════════════════════════════

VERIFICACIÓN POST-EJECUCIÓN
════════════════════════════════════════════════════════════════════════════════

Después de ejecutar el script, verifica:

1. Que se agregaron las secciones:
   SELECT COUNT(*) as total_sin_seccion 
   FROM sections 
   WHERE name = 'Sin Sección';

2. Que están en todos los grados:
   SELECT DISTINCT g.name 
   FROM sections s
   JOIN grades g ON s.grade_id = g.id
   WHERE s.name = 'Sin Sección'
   ORDER BY g.name;

3. Que están activas:
   SELECT COUNT(*) as activas
   FROM sections 
   WHERE name = 'Sin Sección' AND is_active = true;


════════════════════════════════════════════════════════════════════════════════

PASOS PARA EJECUTAR EN TU BD LOCAL
════════════════════════════════════════════════════════════════════════════════

SI USAS pgAdmin:
1. Abre pgAdmin
2. Conecta a tu BD asisVox
3. Click derecho en "Query Tool"
4. Copia/pega el script de OPCIÓN 2
5. Click "Execute"
6. Verifica los resultados

SI USAS psql (línea de comandos):
```bash
psql -U postgres -d asisVox -h localhost
```

Luego pega el script y presiona Enter.


════════════════════════════════════════════════════════════════════════════════

IMPORTANTE
════════════════════════════════════════════════════════════════════════════════

✅ Este script es IDEMPOTENTE
   └─ Puedes ejecutarlo múltiples veces sin problemas
   └─ Solo insertará si no existe

✅ No elimina nada
   └─ Solo agrega "Sin Sección"

✅ Afecta solo la tabla sections
   └─ No toca otras tablas

✅ Funciona con el seed.sql modificado
   └─ O independientemente si ya tienes datos

════════════════════════════════════════════════════════════════════════════════
