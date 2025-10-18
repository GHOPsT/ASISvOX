# ASISvOX - PostgreSQL Database Configuration

Este directorio contiene la configuración y esquema de la base de datos PostgreSQL 17 para ASISvOX.

## 📋 Contenido

- `schema.sql` - Esquema completo de la base de datos con todas las tablas, índices, triggers y funciones
- `connection.ts` - Módulo de conexión y funciones helper para interactuar con PostgreSQL
- `README.md` - Este archivo de documentación

## 🚀 Instalación y Configuración

### 1. Instalar PostgreSQL 17

#### En Ubuntu/Debian:
```bash
# Agregar repositorio oficial de PostgreSQL
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get install postgresql-17
```

#### En macOS:
```bash
brew install postgresql@17
brew services start postgresql@17
```

#### En Windows:
Descarga el instalador desde: https://www.postgresql.org/download/windows/

### 2. Crear la Base de Datos

```bash
# Conectarse a PostgreSQL como superusuario
sudo -u postgres psql

# Crear base de datos
CREATE DATABASE asisvox_db;

# Crear usuario (opcional)
CREATE USER asisvox_user WITH ENCRYPTED PASSWORD 'tu_contraseña_segura';

# Otorgar privilegios
GRANT ALL PRIVILEGES ON DATABASE asisvox_db TO asisvox_user;

# Salir
\q
```

### 3. Ejecutar el Schema

```bash
# Ejecutar el archivo schema.sql
psql -U postgres -d asisvox_db -f database/schema.sql
```

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto backend:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=asisvox_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña_segura

# Database Pool Configuration
DB_POOL_MAX=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000
```

### 5. Instalar Dependencias de Node.js

```bash
cd backend
npm install pg @types/pg
```

## 📊 Estructura de la Base de Datos

### Tablas Principales

#### 👥 Usuarios y Autenticación
- `users` - Usuarios del sistema (administradores y profesores)
- `audit_logs` - Registro de auditoría de acciones

#### 🎓 Gestión Académica
- `academic_years` - Años académicos
- `subjects` - Materias/Asignaturas
- `grades` - Grados/Niveles educativos
- `sections` - Secciones/Paralelos (A, B, C)
- `classes` - Clases (combinación de sección + materia + profesor)
- `schedules` - Horarios de clases

#### 👨‍🎓 Estudiantes
- `students` - Información de estudiantes
- `enrollments` - Matriculación de estudiantes en secciones

#### ✅ Asistencia
- `attendance` - Registro de asistencia diaria

#### 📝 Evaluaciones y Calificaciones
- `assessment_types` - Tipos de evaluación
- `assessments` - Evaluaciones/Actividades calificables
- `grades_records` - Calificaciones de estudiantes

#### 📚 Tareas
- `homework` - Tareas/Deberes asignados
- `homework_submissions` - Entregas de tareas

#### 🔔 Sistema
- `notifications` - Notificaciones para usuarios
- `reports` - Reportes generados
- `teacher_assignments` - Asignaciones de profesores

### Vistas Útiles

- `v_student_enrollments` - Estudiantes con su sección actual
- `v_classes_full` - Clases con información completa
- `v_attendance_summary` - Resumen de asistencia por estudiante

### Funciones

- `check_schedule_conflict()` - Verificar conflictos de horario
- `calculate_student_average()` - Calcular promedio de calificaciones

## 💻 Uso en el Código

### Ejemplo Básico

```typescript
import { query, testConnection } from './database/connection';

// Verificar conexión
await testConnection();

// Ejecutar una consulta simple
const result = await query('SELECT * FROM users WHERE role = $1', ['teacher']);
console.log(result.rows);
```

### Ejemplo con Transacciones

```typescript
import { transaction } from './database/connection';

await transaction(async (client) => {
  // Crear estudiante
  const student = await client.query(
    'INSERT INTO students (first_name, last_name) VALUES ($1, $2) RETURNING *',
    ['Juan', 'Pérez']
  );

  // Matricular en sección
  await client.query(
    'INSERT INTO enrollments (student_id, section_id, academic_year_id) VALUES ($1, $2, $3)',
    [student.rows[0].id, sectionId, academicYearId]
  );
});
```

### Ejemplo con Funciones Helper

```typescript
import { findById, insert, update, deleteById } from './database/connection';

// Buscar por ID
const user = await findById('users', userId);

// Insertar
const newStudent = await insert('students', {
  first_name: 'María',
  last_name: 'García',
  email: 'maria@example.com'
});

// Actualizar
const updated = await update('students', studentId, {
  phone: '555-1234'
});

// Eliminar
await deleteById('students', studentId);
```

## 🔐 Seguridad

### Contraseñas

Las contraseñas se almacenan usando bcrypt a través de la función `crypt()` de PostgreSQL:

```sql
-- Al crear un usuario
INSERT INTO users (email, password_hash, full_name, role)
VALUES ('user@example.com', crypt('password123', gen_salt('bf')), 'Nombre Usuario', 'teacher');

-- Al verificar contraseña
SELECT * FROM users 
WHERE email = 'user@example.com' 
AND password_hash = crypt('password123', password_hash);
```

### Mejores Prácticas

1. **Nunca** expongas las credenciales de la base de datos en el código
2. Usa variables de entorno para configuración sensible
3. Implementa conexiones SSL en producción
4. Usa siempre consultas parametrizadas para prevenir SQL injection
5. Limita los privilegios del usuario de la base de datos
6. Habilita logging de auditoría en producción

## 🔧 Mantenimiento

### Backup

```bash
# Backup completo
pg_dump -U postgres asisvox_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup solo esquema
pg_dump -U postgres -s asisvox_db > schema_backup.sql

# Backup solo datos
pg_dump -U postgres -a asisvox_db > data_backup.sql
```

### Restaurar

```bash
# Restaurar desde backup
psql -U postgres asisvox_db < backup.sql
```

### Optimización

```sql
-- Analizar tablas para optimizar queries
ANALYZE;

-- Vacuum para limpiar espacio
VACUUM;

-- Reindexar
REINDEX DATABASE asisvox_db;
```

## 📈 Monitoreo

### Consultas Útiles

```sql
-- Ver conexiones activas
SELECT * FROM pg_stat_activity WHERE datname = 'asisvox_db';

-- Ver tamaño de tablas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Ver índices más usados
SELECT * FROM pg_stat_user_indexes ORDER BY idx_scan DESC;

-- Ver queries lentas
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## 🆘 Troubleshooting

### Error: "could not connect to server"

```bash
# Verificar si PostgreSQL está corriendo
sudo systemctl status postgresql

# Iniciar PostgreSQL
sudo systemctl start postgresql
```

### Error: "password authentication failed"

Verifica las credenciales en el archivo `.env` y asegúrate de que el usuario tiene los permisos correctos.

### Error: "too many connections"

Aumenta el límite de conexiones en `postgresql.conf` o reduce `DB_POOL_MAX` en tu configuración.

## 📚 Recursos Adicionales

- [Documentación oficial de PostgreSQL 17](https://www.postgresql.org/docs/17/)
- [node-postgres (pg) documentation](https://node-postgres.com/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)

## 🔄 Migración desde MongoDB

Si estás migrando desde MongoDB, considera:

1. Los ObjectId de MongoDB se convierten en UUID en PostgreSQL
2. Los arrays embebidos deben normalizarse en tablas relacionales
3. Los documentos anidados se convierten en tablas con foreign keys
4. Las consultas deben reescribirse usando SQL en lugar de métodos MongoDB

### Ejemplo de Conversión

**MongoDB:**
```javascript
db.students.find({ grade: "5to" })
```

**PostgreSQL:**
```typescript
await query('SELECT * FROM students s JOIN enrollments e ON s.id = e.student_id JOIN sections sec ON e.section_id = sec.id JOIN grades g ON sec.grade_id = g.id WHERE g.name = $1', ['5to'])
```

## 📞 Soporte

Para preguntas o problemas, contacta al equipo de desarrollo de ASISvOX.
