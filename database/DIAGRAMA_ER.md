# Diagrama Entidad-Relación - ASISvOX PostgreSQL Database

## 📊 Resumen de Tablas

### 1. Gestión de Usuarios y Autenticación (2 tablas)
- `users` - Usuarios del sistema
- `audit_logs` - Registro de auditoría

### 2. Estructura Académica (5 tablas)
- `academic_years` - Años académicos
- `subjects` - Materias/Asignaturas
- `grades` - Grados/Niveles
- `sections` - Secciones/Paralelos
- `classes` - Clases (sección + materia + profesor)

### 3. Horarios (1 tabla)
- `schedules` - Horarios de clases

### 4. Gestión de Estudiantes (2 tablas)
- `students` - Información de estudiantes
- `enrollments` - Matriculaciones

### 5. Asistencia (1 tabla)
- `attendance` - Registro de asistencia

### 6. Evaluaciones y Calificaciones (3 tablas)
- `assessment_types` - Tipos de evaluación
- `assessments` - Evaluaciones
- `grades_records` - Calificaciones

### 7. Tareas (2 tablas)
- `homework` - Tareas asignadas
- `homework_submissions` - Entregas de tareas

### 8. Sistema (3 tablas)
- `notifications` - Notificaciones
- `reports` - Reportes generados
- `teacher_assignments` - Asignaciones de profesores

## 🔗 Relaciones Entre Tablas

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DIAGRAMA ER                                  │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│     users        │
│──────────────────│
│ id (PK)          │
│ email (UNIQUE)   │
│ password_hash    │
│ full_name        │
│ role             │
│ phone            │
│ photo_url        │
│ is_active        │
│ created_at       │
│ updated_at       │
│ last_login       │
└──────────────────┘
        │
        │ 1:N (teacher)
        ├──────────────────────────────┐
        │                              │
        │                              ▼
        │                    ┌──────────────────┐
        │                    │    classes       │
        │                    │──────────────────│
        │                    │ id (PK)          │
        │                    │ section_id (FK)  │───────┐
        │                    │ subject_id (FK)  │───┐   │
        │                    │ teacher_id (FK)  │   │   │
        │                    │ academic_year_id │   │   │
        │                    │ classroom        │   │   │
        │                    │ is_active        │   │   │
        │                    └──────────────────┘   │   │
        │                            │              │   │
        │                            │ 1:N          │   │
        │                            ▼              │   │
        │                    ┌──────────────────┐   │   │
        │                    │   schedules      │   │   │
        │                    │──────────────────│   │   │
        │                    │ id (PK)          │   │   │
        │                    │ class_id (FK)    │   │   │
        │                    │ day_of_week      │   │   │
        │                    │ start_time       │   │   │
        │                    │ end_time         │   │   │
        │                    └──────────────────┘   │   │
        │                                           │   │
        │ 1:N (created_by)                          │   │
        ├───────────────┐                           │   │
        │               │                           │   │
        ▼               ▼                           │   │
┌──────────────┐  ┌──────────────┐                 │   │
│ homework     │  │notifications │                 │   │
│──────────────│  │──────────────│                 │   │
│ id (PK)      │  │ id (PK)      │                 │   │
│ class_id(FK) │  │ user_id (FK) │                 │   │
│ title        │  │ title        │                 │   │
│ description  │  │ message      │                 │   │
│ assigned_date│  │ type         │                 │   │
│ due_date     │  │ is_read      │                 │   │
│ max_score    │  │ created_at   │                 │   │
│ created_by   │  └──────────────┘                 │   │
└──────────────┘                                   │   │
        │                                          │   │
        │ 1:N                                      │   │
        ▼                                          │   │
┌──────────────────┐                               │   │
│homework_submiss. │                               │   │
│──────────────────│                               │   │
│ id (PK)          │                               │   │
│ homework_id (FK) │                               │   │
│ student_id (FK)  │─────────┐                     │   │
│ submission_date  │         │                     │   │
│ status           │         │                     │   │
│ score            │         │                     │   │
│ feedback         │         │                     │   │
│ graded_by (FK)   │         │                     │   │
└──────────────────┘         │                     │   │
                             │                     │   │
                             │                     │   │
┌──────────────────┐         │                     │   │
│    students      │◄────────┘                     │   │
│──────────────────│                               │   │
│ id (PK)          │                               │   │
│ first_name       │                               │   │
│ last_name        │                               │   │
│ identification_  │                               │   │
│ date_of_birth    │                               │   │
│ gender           │                               │   │
│ email            │                               │   │
│ phone            │                               │   │
│ parent_name      │                               │   │
│ parent_phone     │                               │   │
│ parent_email     │                               │   │
│ is_active        │                               │   │
└──────────────────┘                               │   │
        │                                          │   │
        │ 1:N                                      │   │
        ├──────────────────┐                       │   │
        │                  │                       │   │
        ▼                  ▼                       │   │
┌──────────────┐   ┌──────────────┐                │   │
│ enrollments  │   │  attendance  │                │   │
│──────────────│   │──────────────│                │   │
│ id (PK)      │   │ id (PK)      │                │   │
│ student_id   │   │ class_id(FK) │                │   │
│ section_id   │───┐│ student_id   │                │   │
│ academic_year│   ││ date         │                │   │
│ enroll_date  │   ││ status       │                │   │
│ status       │   ││ method       │                │   │
└──────────────┘   ││ notes        │                │   │
                   ││ recorded_by  │                │   │
                   │└──────────────┘                │   │
                   │                                │   │
                   │                                │   │
                   │        ┌──────────────┐        │   │
                   │        │ grades_rec.  │        │   │
                   │        │──────────────│        │   │
                   │        │ id (PK)      │        │   │
                   │        │assessment_id │◄───┐   │   │
                   │        │ student_id   │    │   │   │
                   │        │ score        │    │   │   │
                   │        │ observations │    │   │   │
                   │        │ graded_by    │    │   │   │
                   │        │ graded_at    │    │   │   │
                   │        └──────────────┘    │   │   │
                   │                            │   │   │
                   │                            │   │   │
                   │        ┌──────────────┐    │   │   │
                   │        │ assessments  │────┘   │   │
                   │        │──────────────│        │   │
                   │        │ id (PK)      │        │   │
                   │        │ class_id(FK) │        │   │
                   │        │assessment_ty │◄───┐   │   │
                   │        │ name         │    │   │   │
                   │        │ description  │    │   │   │
                   │        │ max_score    │    │   │   │
                   │        │ weight       │    │   │   │
                   │        │ date         │    │   │   │
                   │        │ is_published │    │   │   │
                   │        └──────────────┘    │   │   │
                   │                            │   │   │
                   │   ┌──────────────────┐     │   │   │
                   │   │assessment_types  │─────┘   │   │
                   │   │──────────────────│         │   │
                   │   │ id (PK)          │         │   │
                   │   │ name             │         │   │
                   │   │ description      │         │   │
                   │   │ is_active        │         │   │
                   │   └──────────────────┘         │   │
                   │                                │   │
                   │                                │   │
                   └─────►┌──────────────┐          │   │
                          │  sections    │◄─────────┘   │
                          │──────────────│              │
                          │ id (PK)      │              │
                          │ grade_id(FK) │◄───┐         │
                          │ name         │    │         │
                          │academic_year │    │         │
                          │ max_students │    │         │
                          │ is_active    │    │         │
                          └──────────────┘    │         │
                                              │         │
                          ┌──────────────┐    │         │
                          │   grades     │────┘         │
                          │──────────────│              │
                          │ id (PK)      │              │
                          │ name         │              │
                          │ level        │              │
                          │ description  │              │
                          │ is_active    │              │
                          └──────────────┘              │
                                                        │
                          ┌──────────────┐              │
                          │  subjects    │◄─────────────┘
                          │──────────────│
                          │ id (PK)      │
                          │ name         │
                          │ code (UNIQUE)│
                          │ description  │
                          │ color        │
                          │ is_active    │
                          └──────────────┘

┌──────────────────┐
│ academic_years   │
│──────────────────│
│ id (PK)          │
│ name             │
│ start_date       │
│ end_date         │
│ is_current       │
└──────────────────┘
        │
        │ (Referenciado por múltiples tablas)
        │
        ├─► classes.academic_year_id
        ├─► sections.academic_year_id
        ├─► enrollments.academic_year_id
        └─► teacher_assignments.academic_year_id

┌──────────────────┐
│ teacher_assign.  │
│──────────────────│
│ id (PK)          │
│ teacher_id (FK)  │───► users.id
│ academic_year_id │───► academic_years.id
│ notes            │
│ created_by (FK)  │───► users.id
└──────────────────┘

┌──────────────────┐
│    reports       │
│──────────────────│
│ id (PK)          │
│ title            │
│ type             │
│ format           │
│ filters (JSONB)  │
│ file_url         │
│ generated_by(FK) │───► users.id
│ created_at       │
└──────────────────┘

┌──────────────────┐
│   audit_logs     │
│──────────────────│
│ id (PK)          │
│ user_id (FK)     │───► users.id
│ action           │
│ entity_type      │
│ entity_id        │
│ old_values(JSON) │
│ new_values(JSON) │
│ ip_address       │
│ user_agent       │
│ created_at       │
└──────────────────┘
```

## 📋 Descripción Detallada de Relaciones

### Relaciones 1:N (Uno a Muchos)

1. **users → classes**
   - Un profesor puede impartir muchas clases
   - FK: `classes.teacher_id` → `users.id`

2. **academic_years → classes/sections/enrollments**
   - Un año académico contiene muchas clases, secciones y matriculaciones
   - FK: `classes.academic_year_id` → `academic_years.id`

3. **subjects → classes**
   - Una materia puede tener muchas clases
   - FK: `classes.subject_id` → `subjects.id`

4. **grades → sections**
   - Un grado puede tener muchas secciones
   - FK: `sections.grade_id` → `grades.id`

5. **sections → classes**
   - Una sección puede tener clases de diferentes materias
   - FK: `classes.section_id` → `sections.id`

6. **sections → enrollments**
   - Una sección puede tener muchos estudiantes matriculados
   - FK: `enrollments.section_id` → `sections.id`

7. **students → enrollments**
   - Un estudiante puede tener muchas matriculaciones (histórico)
   - FK: `enrollments.student_id` → `students.id`

8. **students → attendance**
   - Un estudiante tiene muchos registros de asistencia
   - FK: `attendance.student_id` → `students.id`

9. **classes → attendance**
   - Una clase tiene muchos registros de asistencia
   - FK: `attendance.class_id` → `classes.id`

10. **classes → schedules**
    - Una clase puede tener múltiples horarios en la semana
    - FK: `schedules.class_id` → `classes.id`

11. **classes → assessments**
    - Una clase puede tener muchas evaluaciones
    - FK: `assessments.class_id` → `classes.id`

12. **assessment_types → assessments**
    - Un tipo de evaluación puede usarse en muchas evaluaciones
    - FK: `assessments.assessment_type_id` → `assessment_types.id`

13. **assessments → grades_records**
    - Una evaluación tiene muchas calificaciones
    - FK: `grades_records.assessment_id` → `assessments.id`

14. **students → grades_records**
    - Un estudiante tiene muchas calificaciones
    - FK: `grades_records.student_id` → `students.id`

15. **classes → homework**
    - Una clase puede tener muchas tareas
    - FK: `homework.class_id` → `classes.id`

16. **homework → homework_submissions**
    - Una tarea puede tener muchas entregas
    - FK: `homework_submissions.homework_id` → `homework.id`

17. **students → homework_submissions**
    - Un estudiante puede tener muchas entregas de tareas
    - FK: `homework_submissions.student_id` → `students.id`

18. **users → notifications**
    - Un usuario puede tener muchas notificaciones
    - FK: `notifications.user_id` → `users.id`

19. **users → reports**
    - Un usuario puede generar muchos reportes
    - FK: `reports.generated_by` → `users.id`

20. **users → audit_logs**
    - Un usuario puede tener muchas acciones registradas
    - FK: `audit_logs.user_id` → `users.id`

### Relaciones 1:1 (Uno a Uno)

**Ninguna relación 1:1 en este diseño** - Todas son 1:N para permitir flexibilidad e histórico.

### Constraints Únicos Compuestos

1. **sections**: `(grade_id, name, academic_year_id)` UNIQUE
   - No puede haber dos secciones con el mismo nombre en el mismo grado y año

2. **classes**: `(section_id, subject_id, academic_year_id)` UNIQUE
   - Una sección no puede tener dos clases de la misma materia en el mismo año

3. **attendance**: `(class_id, student_id, date)` UNIQUE
   - Un estudiante solo puede tener un registro de asistencia por clase por día

4. **enrollments**: `(student_id, section_id, academic_year_id)` UNIQUE
   - Un estudiante no puede estar matriculado dos veces en la misma sección

5. **grades_records**: `(assessment_id, student_id)` UNIQUE
   - Un estudiante solo puede tener una calificación por evaluación

6. **homework_submissions**: `(homework_id, student_id)` UNIQUE
   - Un estudiante solo puede entregar una vez cada tarea

## 🔍 Índices Importantes

### Índices de Búsqueda

- `users.email` - Login y búsqueda de usuarios
- `students.identification_number` - Búsqueda rápida de estudiantes
- `students.last_name` - Ordenamiento alfabético
- `subjects.code` - Búsqueda por código de materia

### Índices de Foreign Keys

Todos los foreign keys tienen índices para optimizar JOINs:
- `classes.teacher_id`, `classes.section_id`, `classes.subject_id`
- `enrollments.student_id`, `enrollments.section_id`
- `attendance.class_id`, `attendance.student_id`
- `grades_records.assessment_id`, `grades_records.student_id`
- etc.

### Índices de Fecha

- `attendance.date` - Consultas por rango de fechas
- `homework.due_date` - Tareas próximas a vencer
- `notifications.created_at` - Notificaciones recientes

### Índices de Estado

- `users.is_active` - Filtrar usuarios activos
- `students.is_active` - Filtrar estudiantes activos
- `enrollments.status` - Matriculaciones activas
- `notifications.is_read` - Notificaciones no leídas

## 📊 Cardinalidad Estimada

Para un colegio mediano:

- **users**: ~50-100 registros (profesores y admins)
- **academic_years**: ~10 registros (histórico)
- **subjects**: ~20-30 registros
- **grades**: ~12 registros (niveles educativos)
- **sections**: ~36 registros (3 secciones × 12 grados)
- **classes**: ~500-1000 registros por año
- **students**: ~1000-2000 registros
- **enrollments**: ~1000-2000 por año, ~10000 histórico
- **attendance**: ~200,000 por año (1000 estudiantes × 200 días)
- **assessments**: ~2000-5000 por año
- **grades_records**: ~50,000 por año
- **homework**: ~1000-2000 por año
- **notifications**: ~10,000 por año
- **audit_logs**: ~100,000 por año

## 🔐 Seguridad

- Las contraseñas se almacenan usando `bcrypt` (función `crypt()`)
- Todos los IDs son UUID para mayor seguridad
- Foreign keys con `ON DELETE CASCADE` o `ON DELETE SET NULL` según corresponda
- Triggers automáticos para `updated_at`
- Audit logs para rastreabilidad completa

## 📈 Optimizaciones

1. **Vistas materializadas** (opcional para reportes pesados)
2. **Particionamiento** de `attendance` y `audit_logs` por fecha (para tablas grandes)
3. **Índices compuestos** para consultas frecuentes
4. **Funciones PL/pgSQL** para cálculos complejos
5. **JSONB** para datos flexibles (filtros de reportes)
