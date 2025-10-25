# 🌱 Inicialización de Base de Datos - ASISvOX

## Opción 1: Script Automático (RECOMENDADO)

### Windows

1. Abre PowerShell o CMD en la carpeta `backend/`
2. Ejecuta:
```bash
.\init-db.bat
```

3. Ingresa la contraseña de PostgreSQL cuando se pida
4. El script automáticamente:
   - ✅ Crea la BD si no existe
   - ✅ Carga el schema
   - ✅ Carga los datos de prueba

### Linux/Mac

1. Abre terminal en la carpeta `backend/`
2. Dale permisos de ejecución:
```bash
chmod +x init-db.sh
```

3. Ejecuta:
```bash
./init-db.sh
```

---

## Opción 2: Instrucciones Manuales

Si prefieres hacerlo manualmente o el script no funciona:

```bash
# Conectar a PostgreSQL como superusuario
psql -U postgres

# Crear la base de datos
CREATE DATABASE asisvox;
\q
```

#### 2️⃣ **Ejecutar Schema SQL** (Crear tablas)

```bash
cd backend

# Ejecutar el schema (crear estructura)
psql -U postgres -d asisvox -f src/schema.sql
```

**Salida esperada:**
```
CREATE EXTENSION
CREATE TABLE
CREATE INDEX
... (muchas más líneas)
```

#### 3️⃣ **Ejecutar Seed SQL** (Cargar datos de prueba)

```bash
# Ejecutar el seed (insertar datos de ejemplo)
psql -U postgres -d asisvox -f seed.sql
```

**Salida esperada:**
```
INSERT 0 1
INSERT 0 2
... 
NOTICE: Datos de prueba insertados exitosamente
```

Verás un listado mostrando:
- Profesores insertados
- Materias disponibles
- Grados creados
- Secciones
- Clases del profesor
- Estudiantes de ejemplo

---

## Datos de Prueba Creados

### Profesor
```
Email: profesor@asisVox.com
Contraseña: demo123
Nombre: Prof. María González
Rol: teacher
```

### Clases Asignadas
```
1. Matemáticas 10°A (Aula 101)
2. Matemáticas 10°B (Aula 102)
```

### Estudiantes de Ejemplo
- Juan Pérez (ID: 12345678)
- María García (ID: 12345679)
- Carlos López (ID: 12345680)
- Ana Martínez (ID: 12345681)
- Luis Rodríguez (ID: 12345682)

---

## Verificación

### Verificar que los datos se cargaron correctamente:

```bash
# Conectar a la BD
psql -U postgres -d asisvox

# Listar usuarios (debe mostrar profesor@asisVox.com)
SELECT email, full_name, role FROM users;

# Listar clases del profesor
SELECT c.id, sub.name, g.name, s.name, u.full_name 
FROM classes c
JOIN subjects sub ON c.subject_id = sub.id
JOIN sections s ON c.section_id = s.id
JOIN grades g ON s.grade_id = g.id
JOIN users u ON c.teacher_id = u.id;

# Salir
\q
```

---

## Troubleshooting

### ❌ Error: "FATAL: database "asisvox" does not exist"

**Solución:**
```bash
# Crear la BD primero
psql -U postgres
CREATE DATABASE asisvox;
\q

# Luego ejecutar el schema
psql -U postgres -d asisvox -f src/schema.sql
```

### ❌ Error: "permission denied"

**Solución:**
```bash
# Ejecutar como superusuario
sudo psql -U postgres -d asisvox -f src/schema.sql
```

### ❌ Error: "role "postgres" does not exist"

**Solución:**
```bash
# Usar el usuario correcto
psql -U <tu_usuario> -d asisvox -f src/schema.sql

# O usar windows auth
psql -d asisvox -f src/schema.sql
```

### ❌ Error: "no hay restricción única o de exclusión que coincida"

**Causa:** Estás usando una versión antigua de seed.sql que usa `ON CONFLICT` sin restricción UNIQUE

**Solución:**
1. Asegúrate de usar la versión más reciente de `seed.sql`
2. El archivo debe usar `WHERE NOT EXISTS` en lugar de `ON CONFLICT`
3. Descarga la versión más nueva del repositorio

**Alternativa:**
```bash
# Limpiar todo e intentar de nuevo
DROP DATABASE IF EXISTS asisvox;
CREATE DATABASE asisvox;

# Luego ejecutar el init-db script
./init-db.bat  # Windows
./init-db.sh   # Linux/Mac
```

---

## Reiniciar la BD (Limpiar datos)

Si necesitas empezar desde cero:

```bash
# Conectar a PostgreSQL
psql -U postgres

# Eliminar la BD existente
DROP DATABASE IF EXISTS asisvox;

# Crear nueva BD
CREATE DATABASE asisvox;
\q

# Volver a cargar schema y seed
psql -U postgres -d asisvox -f backend/src/schema.sql
psql -U postgres -d asisvox -f backend/seed.sql
```

---

## Variables de Entorno Necesarias

En `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=asisvox
DB_USER=postgres
DB_PASSWORD=<tu_password>
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

---

## Siguiente Paso

Después de cargar la BD:

1. ✅ Inicia el backend: `npm run dev`
2. ✅ Inicia el frontend: `npm run dev`
3. ✅ Intenta loguearte: `profesor@asisVox.com` / `demo123`
4. ✅ Las clases deben aparecer en el TeacherDashboard

---

**Última actualización:** 2024-10-25
