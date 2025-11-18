# Implementación de Gestión de Horarios (Schedules)

## Resumen
Se ha implementado un sistema completo de gestión de horarios para las clases, permitiendo que los docentes asignen múltiples horarios a cada clase (ej: Lunes 8-9am, Miércoles 10-11am).

## Arquitectura General

### Base de Datos
**Tabla: `schedules`**
```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  -- 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Validación: end_time > start_time (en la aplicación)
-- Índices para performance
CREATE INDEX idx_schedules_class_id ON schedules(class_id);
CREATE INDEX idx_schedules_day_of_week ON schedules(day_of_week);
```

**Relación: clases ← horarios**
- Una clase puede tener múltiples horarios
- Cada horario está vinculado a una única clase
- Si se elimina una clase, se eliminan automáticamente sus horarios (ON DELETE CASCADE)

---

## Backend - Express.js + TypeScript

### Nuevos Endpoints en `class.routes.ts`

#### 1. **POST `/api/classes/:classId/schedules`**
Crear horarios para una clase

**Request Body:**
```json
{
  "schedules": [
    {
      "day_of_week": 1,        // 0-6 (0=domingo, 1=lunes, etc.)
      "start_time": "08:00:00", // Formato TIME (HH:MM:SS)
      "end_time": "09:00:00"
    },
    {
      "day_of_week": 3,
      "start_time": "10:00:00",
      "end_time": "11:00:00"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "class_id": "class-uuid",
      "day_of_week": 1,
      "start_time": "08:00:00",
      "end_time": "09:00:00",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    // ... más horarios
  ],
  "message": "2 horarios creados exitosamente"
}
```

**Validaciones:**
- `classId` requerido
- Array `schedules` no vacío
- Cada horario debe tener: `day_of_week`, `start_time`, `end_time`
- `day_of_week` entre 0-6
- `end_time > start_time`
- No permite horarios duplicados para el mismo día
- Solo el profesor asignado o admin pueden crear horarios

**Status Codes:**
- `201 Created` - Éxito
- `400 Bad Request` - Validación fallida
- `403 Forbidden` - Permisos insuficientes
- `404 Not Found` - Clase no existe

---

#### 2. **GET `/api/classes/:classId/schedules`**
Obtener todos los horarios de una clase

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "class_id": "class-uuid",
      "day_of_week": 1,
      "start_time": "08:00:00",
      "end_time": "09:00:00",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "message": "Horarios obtenidos exitosamente"
}
```

**Ordenamiento:** Por `day_of_week` ASC, `start_time` ASC

---

#### 3. **PUT `/api/classes/:classId/schedules/:scheduleId`**
Actualizar un horario específico

**Request Body:** (todos los campos opcionales)
```json
{
  "day_of_week": 2,
  "start_time": "09:00:00",
  "end_time": "10:00:00"
}
```

**Validaciones:**
- Solo actualiza campos proporcionados
- Si se actualiza, valida `end_time > start_time`
- Solo profesor asignado o admin

---

#### 4. **DELETE `/api/classes/:classId/schedules/:scheduleId`**
Eliminar un horario

**Response:**
```json
{
  "success": true,
  "message": "Horario eliminado exitosamente"
}
```

**Validaciones:**
- Solo profesor asignado o admin

---

### Control de Acceso
- Todos los endpoints requieren `requireTeacherOrAdmin` middleware
- Profesores solo pueden modificar horarios de sus propias clases
- Admins pueden modificar horarios de cualquier clase

---

## Frontend - React + TypeScript

### AddClassModal Actualizado

**Ubicación:** `frontend/src/components/AddClassModal.tsx`

**Nueva Estructura de Formulario:**

```tsx
interface FormData {
  subjectId: string;
  sectionId: string;
  academicYearId: string;
  classroom: string;
  schedules: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>;
}
```

**Secciones del Modal:**

1. **Información Básica** (requerida)
   - Materia (select)
   - Sección (select)
   - Año Académico (select)
   - Aula (input text)

2. **Gestor de Horarios**
   - Selector de día (0-6)
   - Hora de inicio (input type="time")
   - Hora de fin (input type="time")
   - Botón "Agregar Horario"
   - Lista de horarios agregados con botón eliminar

**Validaciones en Frontend:**
- Todos los campos básicos requeridos
- **Al menos un horario requerido**
- `end_time > start_time` para cada horario
- No permite horarios duplicados para el mismo día
- Formato de tiempo: HH:MM

**Mapeo de Días:**
```typescript
const DAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" }
];
```

---

### API Client (`api.ts`)

**Nuevos Métodos:**

```typescript
classes: {
  // ... métodos existentes ...
  
  createSchedules: async (classId: string, schedules: any[]): Promise<ApiResponse<any>> 
    => POST /classes/{classId}/schedules
  
  getSchedules: async (classId: string): Promise<ApiResponse<any[]>> 
    => GET /classes/{classId}/schedules
  
  updateSchedule: async (classId: string, scheduleId: string, data: any): Promise<ApiResponse<any>> 
    => PUT /classes/{classId}/schedules/{scheduleId}
  
  deleteSchedule: async (classId: string, scheduleId: string): Promise<ApiResponse<void>> 
    => DELETE /classes/{classId}/schedules/{scheduleId}
}
```

---

### TeacherDashboard Actualizado

**Cambios en `handleAddClass`:**

1. **Crear clase:** Llamar a `apiClient.classes.createClass()`
2. **Crear horarios:** Si hay horarios en `classData.schedules`, llamar a `apiClient.classes.createSchedules(classId, schedules)`
3. **Manejo de errores:** Los errores de horarios no impiden que se cree la clase

**Flujo:**
```
Usuario completa modal
  ↓
Valida información básica + horarios
  ↓
POST /api/classes (crear clase)
  ↓
Si éxito:
  - POST /api/classes/{id}/schedules (crear horarios)
  - Añadir clase a estado local
  - Guardar en localStorage
```

---

## Flujo Completo de Usuario

### 1. Docente abre "Crear Clase"
```
Modal aparece con dos secciones:
- Información Básica (vacío)
- Gestor de Horarios (vacío)
```

### 2. Docente completa información básica
```
Selecciona:
- Materia: Matemáticas
- Sección: 10°A
- Año: 2024
- Aula: 101
```

### 3. Docente agrega horarios
```
Primeira vez:
- Día: Lunes (1)
- Inicio: 08:00
- Fin: 09:00
- Clic: "+ Agregar Horario"
→ Se muestra: "Lunes: 08:00 - 09:00" con botón eliminar

Segunda vez:
- Día: Miércoles (3)
- Inicio: 10:00
- Fin: 11:00
- Clic: "+ Agregar Horario"
→ Se muestra lista con ambos horarios
```

### 4. Docente guarda la clase
```
Modal valida:
✓ Materia seleccionada
✓ Sección seleccionada
✓ Año seleccionado
✓ Al menos 1 horario agregado
✓ Todos los horarios válidos

Si todo es correcto:
1. POST /api/classes
   └─ Response: { id: "class-uuid", ... }

2. POST /api/classes/class-uuid/schedules
   └─ Request: { schedules: [{ day_of_week: 1, start_time: "08:00:00", end_time: "09:00:00" }, ...] }
   └─ Response: { success: true, data: [...] }

3. Modal cierra
4. Nueva clase aparece en dashboard
```

---

## Casos de Uso Completos

### Caso 1: Clase con múltiples horarios
```
Materia: Inglés
Sección: 9°B
Aula: 205

Horarios:
- Lunes 09:00-10:00
- Miércoles 14:00-15:00
- Viernes 09:00-10:00

Result: Clase asignada a docente, 3 horarios creados
```

### Caso 2: Actualizar horario existente
```
Docente en perfil de clase:
- Ver horarios actuales
- Clic editar en un horario
- Modal para cambiar día/hora
- PUT /api/classes/{classId}/schedules/{scheduleId}
```

### Caso 3: Eliminar horario
```
Docente en perfil de clase:
- Ver horarios actuales
- Clic eliminar en un horario
- DELETE /api/classes/{classId}/schedules/{scheduleId}
```

---

## Archivos Modificados

### Backend
1. **`backend/src/controllers/class.controller.ts`**
   - ✅ Agregados 4 nuevas funciones: `createSchedules`, `getSchedules`, `updateSchedule`, `deleteSchedule`
   - ✅ Importaciones actualizadas para `asyncHandler`
   - ✅ Validaciones completas implementadas

2. **`backend/src/routes/class.routes.ts`**
   - ✅ Importaciones actualizadas
   - ✅ 4 nuevas rutas de horarios registradas
   - ✅ Middleware `requireTeacherOrAdmin` aplicado

### Frontend
1. **`frontend/src/components/AddClassModal.tsx`**
   - ✅ Rediseño completo: dos secciones (básico + horarios)
   - ✅ Gestor de horarios con add/remove
   - ✅ Validaciones en tiempo real
   - ✅ DAYS constant para mapeo de días

2. **`frontend/src/services/api.ts`**
   - ✅ 4 nuevos métodos en `classes` object
   - ✅ Tipado correcto con `ApiResponse`

3. **`frontend/src/components/TeacherDashboard.tsx`**
   - ✅ `handleAddClass` actualizado
   - ✅ Llamada a `createSchedules` después de crear clase
   - ✅ Manejo de errores mejorado

---

## Validaciones Implementadas

### Backend (PostgreSQL + Express)
| Validación | Ubicación | Error |
|---|---|---|
| day_of_week 0-6 | createSchedules | 400 "day_of_week debe ser entre 0-6" |
| end_time > start_time | createSchedules | 400 "La hora de fin debe ser mayor que la hora de inicio" |
| Horario único por día | createSchedules | 400 "Ya existe un horario para el día X" |
| Permisos | Todas | 403 "No tiene permiso" |
| Clase existe | Todas | 404 "Clase no encontrada" |
| Horario existe | update/delete | 404 "Horario no encontrado" |

### Frontend (React)
| Validación | Ubicación | Acción |
|---|---|---|
| Campo requerido | Modal | Deshabilita botón guardar |
| Al menos 1 horario | Modal | Error toast + deshabilita botón |
| end_time > start_time | handleAddSchedule | No agrega, muestra error inline |
| Horario duplicado | handleAddSchedule | No agrega, muestra mensaje |
| Formato TIME | Input | HTML5 validation |

---

## Error Handling

### Escenarios Manejados

1. **Clase creada pero horarios fallan**
   - ✅ Clase se guarda en BD
   - ✅ Se muestra warning (no error fatal)
   - ✅ Usuario puede agregar horarios después

2. **Token expirado**
   - ✅ API retorna 401
   - ✅ Frontend limpia contexto
   - ✅ Usuario redirigido a login

3. **Validación fallida**
   - ✅ Error específico retornado
   - ✅ Frontend muestra mensaje al usuario
   - ✅ Campo causante destacado

4. **Permisos insuficientes**
   - ✅ Backend valida permisos
   - ✅ Retorna 403 Forbidden
   - ✅ Frontend no permite operación

---

## Testing (Manual)

### Prueba 1: Crear clase con 1 horario
```bash
POST /api/classes
  body: { subjectId, sectionId, academicYearId, classroom }
  
POST /api/classes/{id}/schedules
  body: { schedules: [{ day_of_week: 1, start_time: "08:00", end_time: "09:00" }] }
  
Esperado: 201 Created, 1 horario en BD
```

### Prueba 2: Crear clase con múltiples horarios
```bash
POST /api/classes/{id}/schedules
  body: { schedules: [ 
    { day_of_week: 1, start_time: "08:00", end_time: "09:00" },
    { day_of_week: 3, start_time: "10:00", end_time: "11:00" },
    { day_of_week: 5, start_time: "14:00", end_time: "15:00" }
  ]}
  
Esperado: 201 Created, 3 horarios en BD
```

### Prueba 3: Validación: end_time > start_time
```bash
POST /api/classes/{id}/schedules
  body: { schedules: [{ day_of_week: 1, start_time: "09:00", end_time: "09:00" }] }
  
Esperado: 400 Bad Request
```

### Prueba 4: Validación: horario duplicado
```bash
POST /api/classes/{id}/schedules (primera vez)
  body: { schedules: [{ day_of_week: 1, ... }] }
  → 201 Created

POST /api/classes/{id}/schedules (segunda vez, mismo día)
  body: { schedules: [{ day_of_week: 1, ... }] }
  
Esperado: 400 Bad Request "Ya existe un horario para el día 1"
```

### Prueba 5: Get horarios
```bash
GET /api/classes/{id}/schedules

Esperado: 200 OK, array de horarios ordenado por día y hora
```

### Prueba 6: Update horario
```bash
PUT /api/classes/{id}/schedules/{scheduleId}
  body: { start_time: "09:30", end_time: "10:30" }

Esperado: 200 OK, horario actualizado
```

### Prueba 7: Delete horario
```bash
DELETE /api/classes/{id}/schedules/{scheduleId}

Esperado: 200 OK, horario eliminado
```

---

## Futuras Mejoras

1. **Conflictos de horarios**
   - Validar que un profesor no tenga dos clases al mismo tiempo
   - Validar que un aula no esté reservada dos veces

2. **Visualización de horarios**
   - Tabla semanal (matriz 7 días × 24 horas)
   - Calendario visual con clases coloreadas

3. **Notificaciones**
   - Recordar docentes 15 minutos antes de clase
   - Notificar estudiantes de cambios de horario

4. **Estadísticas**
   - Horas totales por docente
   - Distribución de horarios
   - Ocupación de aulas

5. **Importación/Exportación**
   - Importar horarios desde Excel
   - Exportar horario a iCal o PDF

---

## Resumen de Cambios

| Componente | Líneas | Cambios |
|---|---|---|
| class.controller.ts | ~200 | 4 nuevas funciones completas |
| class.routes.ts | +8 | 4 nuevas rutas de horarios |
| AddClassModal.tsx | ~200 | Rediseño completo |
| api.ts | +30 | 4 nuevos métodos |
| TeacherDashboard.tsx | +20 | Integración de horarios |

**Total: ~5 cambios significativos en 5 archivos**

---

## Próximos Pasos

1. ✅ Implementar endpoints de horarios
2. ✅ Actualizar AddClassModal con gestor de horarios
3. ✅ Conectar API
4. ⏳ **Crear página de "Mis Horarios" (profesor)**
5. ⏳ **Mostrar horarios en el dashboard**
6. ⏳ **Crear perfil de clase con detalles de horarios**
7. ⏳ **Implementar conflictos de horarios**
8. ⏳ **Crear calendario visual de clases**
