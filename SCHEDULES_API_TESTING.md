# Testing Schedules API

## Ejemplos de uso de los endpoints de horarios

Asume que:
- Backend corre en `http://localhost:3001`
- Tienes un JWT token válido
- Tienes una clase creada con ID: `class-id-uuid`

---

## 1. Crear Horarios

### Crear múltiples horarios a la vez

```bash
curl -X POST http://localhost:3001/api/classes/class-id-uuid/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "schedules": [
      {
        "day_of_week": 1,
        "start_time": "08:00:00",
        "end_time": "09:00:00"
      },
      {
        "day_of_week": 3,
        "start_time": "10:00:00",
        "end_time": "11:00:00"
      },
      {
        "day_of_week": 5,
        "start_time": "14:00:00",
        "end_time": "15:00:00"
      }
    ]
  }'
```

**Response exitoso (201):**
```json
{
  "success": true,
  "data": [
    {
      "id": "schedule-uuid-1",
      "class_id": "class-id-uuid",
      "day_of_week": 1,
      "start_time": "08:00:00",
      "end_time": "09:00:00",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "schedule-uuid-2",
      "class_id": "class-id-uuid",
      "day_of_week": 3,
      "start_time": "10:00:00",
      "end_time": "11:00:00",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "schedule-uuid-3",
      "class_id": "class-id-uuid",
      "day_of_week": 5,
      "start_time": "14:00:00",
      "end_time": "15:00:00",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "message": "3 horarios creados exitosamente",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 2. Obtener Horarios

### Listar todos los horarios de una clase

```bash
curl -X GET http://localhost:3001/api/classes/class-id-uuid/schedules \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "schedule-uuid-1",
      "class_id": "class-id-uuid",
      "day_of_week": 1,
      "start_time": "08:00:00",
      "end_time": "09:00:00",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "schedule-uuid-2",
      "class_id": "class-id-uuid",
      "day_of_week": 3,
      "start_time": "10:00:00",
      "end_time": "11:00:00",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "schedule-uuid-3",
      "class_id": "class-id-uuid",
      "day_of_week": 5,
      "start_time": "14:00:00",
      "end_time": "15:00:00",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "message": "Horarios obtenidos exitosamente",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 3. Actualizar Horario

### Cambiar la hora de inicio y fin de un horario

```bash
curl -X PUT http://localhost:3001/api/classes/class-id-uuid/schedules/schedule-uuid-1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "start_time": "09:00:00",
    "end_time": "10:00:00"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "schedule-uuid-1",
    "class_id": "class-id-uuid",
    "day_of_week": 1,
    "start_time": "09:00:00",
    "end_time": "10:00:00",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:35:00Z"
  },
  "message": "Horario actualizado exitosamente",
  "timestamp": "2024-01-15T10:35:00Z"
}
```

### Cambiar solo el día

```bash
curl -X PUT http://localhost:3001/api/classes/class-id-uuid/schedules/schedule-uuid-1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "day_of_week": 2
  }'
```

---

## 4. Eliminar Horario

### Eliminar un horario específico

```bash
curl -X DELETE http://localhost:3001/api/classes/class-id-uuid/schedules/schedule-uuid-1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Horario eliminado exitosamente",
  "timestamp": "2024-01-15T10:35:00Z"
}
```

---

## Errores Comunes

### Error 1: Horario duplicado

**Request:**
```bash
curl -X POST http://localhost:3001/api/classes/class-id-uuid/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "schedules": [
      {
        "day_of_week": 1,
        "start_time": "08:00:00",
        "end_time": "09:00:00"
      }
    ]
  }'
```

(Si ya existe un horario para el lunes)

**Response (400):**
```json
{
  "success": false,
  "message": "Ya existe un horario para el día 1",
  "timestamp": "2024-01-15T10:35:00Z"
}
```

---

### Error 2: Hora de fin menor o igual a hora de inicio

**Request:**
```bash
curl -X POST http://localhost:3001/api/classes/class-id-uuid/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "schedules": [
      {
        "day_of_week": 1,
        "start_time": "09:00:00",
        "end_time": "08:00:00"
      }
    ]
  }'
```

**Response (400):**
```json
{
  "success": false,
  "message": "La hora de fin debe ser mayor que la hora de inicio (09:00:00 - 08:00:00)",
  "timestamp": "2024-01-15T10:35:00Z"
}
```

---

### Error 3: day_of_week inválido

**Request:**
```bash
curl -X POST http://localhost:3001/api/classes/class-id-uuid/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "schedules": [
      {
        "day_of_week": 7,
        "start_time": "08:00:00",
        "end_time": "09:00:00"
      }
    ]
  }'
```

**Response (400):**
```json
{
  "success": false,
  "message": "day_of_week debe ser un número entre 0 (domingo) y 6 (sábado)",
  "timestamp": "2024-01-15T10:35:00Z"
}
```

---

### Error 4: Permisos insuficientes

**Escenario:** Profesor intenta modificar horarios de clase de otro profesor

**Response (403):**
```json
{
  "success": false,
  "message": "No tiene permiso para agregar horarios a esta clase",
  "timestamp": "2024-01-15T10:35:00Z"
}
```

---

### Error 5: Clase no encontrada

**Request:** Con un `classId` que no existe

**Response (404):**
```json
{
  "success": false,
  "message": "Clase no encontrada",
  "timestamp": "2024-01-15T10:35:00Z"
}
```

---

## Mappeo de Días

Use este mapeo para `day_of_week`:

| Valor | Día |
|---|---|
| 0 | Domingo |
| 1 | Lunes |
| 2 | Martes |
| 3 | Miércoles |
| 4 | Jueves |
| 5 | Viernes |
| 6 | Sábado |

---

## Flujo Completo: Crear clase con horarios

### Paso 1: Crear la clase

```bash
curl -X POST http://localhost:3001/api/classes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "subjectId": "subject-uuid",
    "sectionId": "section-uuid",
    "academicYearId": "year-uuid",
    "classroom": "101"
  }'
```

Respuesta: `{ success: true, data: { id: "new-class-uuid", ... } }`

### Paso 2: Crear horarios para la clase

```bash
curl -X POST http://localhost:3001/api/classes/new-class-uuid/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "schedules": [
      {
        "day_of_week": 1,
        "start_time": "08:00:00",
        "end_time": "09:00:00"
      },
      {
        "day_of_week": 3,
        "start_time": "10:00:00",
        "end_time": "11:00:00"
      }
    ]
  }'
```

Respuesta: `{ success: true, data: [schedule1, schedule2], message: "2 horarios creados exitosamente" }`

### Paso 3: Verificar horarios

```bash
curl -X GET http://localhost:3001/api/classes/new-class-uuid/schedules \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Respuesta: Array de 2 horarios ordenados por día y hora

---

## Headers Requeridos

Todos los requests deben incluir:

```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Notas Importantes

1. **Formatos de tiempo:** Usar formato 24h (HH:MM:SS)
   - ✅ "08:00:00"
   - ✅ "14:30:45"
   - ❌ "8:00:00" (falta padding)
   - ❌ "2:00 PM"

2. **Orden de horarios:** El GET retorna ordenado por `day_of_week` ASC, `start_time` ASC

3. **Permisos:**
   - Profesores: Solo pueden modificar horarios de sus propias clases
   - Admins: Pueden modificar cualquier horario
   - Todos necesitan autenticación (token JWT)

4. **Cascada de eliminación:**
   - Si eliminas una clase, se eliminan automáticamente todos sus horarios
   - La eliminación de un horario NO afecta la clase

5. **Validaciones duplicadas:**
   - Frontend valida localmente antes de enviar
   - Backend valida nuevamente (seguridad)
   - No hay race conditions por timestamp único de BD
