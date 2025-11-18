# 📋 CHECKLIST PRE-DEPLOYMENT

## ✅ Verificación Técnica (Ya Completada)

### Backend
- [x] class.controller.ts - 4 funciones nuevas
- [x] class.routes.ts - 4 rutas nuevas
- [x] 0 errores de compilación
- [x] Validaciones implementadas
- [x] Error handling correcto
- [x] Control de acceso implementado

### Frontend
- [x] AddClassModal.tsx - Rediseño completo
- [x] api.ts - 4 métodos nuevos
- [x] TeacherDashboard.tsx - Integración
- [x] 0 errores de compilación
- [x] Validaciones locales
- [x] TypeScript strict mode

### Tipos
- [x] Schedule interface agregada
- [x] Ubicación correcta
- [x] Exportada correctamente
- [x] Sin errores

---

## 📝 Testing Manual - Checklist Completo

### Test 1: Crear clase con 1 horario
```
Objetivo: Validar creación básica de clase + horario

Pasos:
1. [ ] Abrir TeacherDashboard
2. [ ] Clic en "+ Crear Clase"
3. [ ] Llenar formulario:
   - Materia: (seleccionar una existente)
   - Sección: (seleccionar una existente)
   - Año: (seleccionar una existente)
   - Aula: 101
4. [ ] Agregar 1 horario:
   - Día: Lunes (1)
   - Inicio: 08:00
   - Fin: 09:00
5. [ ] Clic "Guardar"

Validaciones:
- [ ] POST /api/classes retorna 201
- [ ] POST /api/classes/{id}/schedules retorna 201
- [ ] Clase aparece en dashboard
- [ ] No hay errores en console

Resultado esperado: ✅ Clase y horario creados
```

### Test 2: Crear clase con múltiples horarios
```
Objetivo: Validar creación de múltiples horarios

Pasos:
1. [ ] Abrir TeacherDashboard
2. [ ] Crear nueva clase (datos básicos)
3. [ ] Agregar 3 horarios:
   - Lunes 08:00-09:00
   - Miércoles 10:00-11:00
   - Viernes 14:00-15:00
4. [ ] Clic "Guardar"

Validaciones:
- [ ] 3 horarios se muestran en la lista
- [ ] Botones "Eliminar" funcionan para cada uno
- [ ] POST retorna 201 con 3 horarios
- [ ] BD tiene 3 filas en tabla schedules

Resultado esperado: ✅ 3 horarios creados correctamente
```

### Test 3: Validación frontend - end_time inválido
```
Objetivo: Validar que no permite end_time < start_time

Pasos:
1. [ ] Abrir formulario de clase
2. [ ] Intentar agregar horario:
   - Día: Lunes
   - Inicio: 09:00
   - Fin: 08:00 (INVÁLIDO)
3. [ ] Clic "+ Agregar Horario"

Validación:
- [ ] No se agrega el horario
- [ ] Mensaje de error mostrado

Resultado esperado: ❌ Horario rechazado
```

### Test 4: Validación frontend - horarios duplicados
```
Objetivo: Validar que no permite 2 horarios el mismo día

Pasos:
1. [ ] Agregar primer horario: Lunes 08:00-09:00
2. [ ] Intentar agregar segundo horario: Lunes 10:00-11:00

Validación:
- [ ] Segundo horario no se agrega
- [ ] Mensaje de error mostrado

Resultado esperado: ❌ Horario rechazado
```

### Test 5: Validación frontend - horario requerido
```
Objetivo: Validar que al menos 1 horario es requerido

Pasos:
1. [ ] Llenar solo información básica
2. [ ] NO agregar ningún horario
3. [ ] Clic "Guardar"

Validación:
- [ ] Botón "Guardar" está deshabilitado
- [ ] O muestra mensaje de error

Resultado esperado: ❌ Form rechazado sin horarios
```

### Test 6: GET /api/classes/{id}/schedules
```
Objetivo: Validar obtención de horarios existentes

Pasos (Backend):
```bash
# Copiar ID de clase creada en Test 2
curl -X GET http://localhost:3001/api/classes/{classId}/schedules \
  -H "Authorization: Bearer {token}"
```

Validaciones:
- [ ] Status 200 OK
- [ ] Response contiene array de horarios
- [ ] 3 horarios en el array
- [ ] Ordenados por day_of_week ASC
- [ ] Cada horario tiene: id, class_id, day_of_week, start_time, end_time

Resultado esperado: ✅ 3 horarios retornados correctamente
```

### Test 7: PUT /api/classes/{id}/schedules/{scheduleId}
```
Objetivo: Validar actualización de horario

Pasos (Backend):
```bash
# Obtener scheduleId del Test 6
curl -X PUT http://localhost:3001/api/classes/{classId}/schedules/{scheduleId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "start_time": "09:00:00",
    "end_time": "10:00:00"
  }'
```

Validaciones:
- [ ] Status 200 OK
- [ ] Response contiene horario actualizado
- [ ] start_time cambió a 09:00:00
- [ ] end_time cambió a 10:00:00

Resultado esperado: ✅ Horario actualizado
```

### Test 8: DELETE /api/classes/{id}/schedules/{scheduleId}
```
Objetivo: Validar eliminación de horario

Pasos (Backend):
```bash
curl -X DELETE http://localhost:3001/api/classes/{classId}/schedules/{scheduleId} \
  -H "Authorization: Bearer {token}"
```

Validaciones:
- [ ] Status 200 OK
- [ ] Message: "Horario eliminado exitosamente"
- [ ] GET /api/classes/{classId}/schedules ahora retorna 2 (no 3)
- [ ] Clase aún existe

Resultado esperado: ✅ Horario eliminado, clase intacta
```

### Test 9: Permisos - Profesor accede solo sus clases
```
Objetivo: Validar que profesor no puede ver/modificar clases de otros

Pasos:
1. [ ] Login como Profesor A
2. [ ] Crear clase A
3. [ ] Logout
4. [ ] Login como Profesor B
5. [ ] Intentar ver horarios de clase A

Validación:
- [ ] Profesor B NO ve clase A
- [ ] Si intenta acceder via API: 403 Forbidden

Resultado esperado: ❌ Acceso denegado
```

### Test 10: Validación backend - day_of_week inválido
```
Objetivo: Validar validación de day_of_week en backend

Pasos (Backend):
```bash
curl -X POST http://localhost:3001/api/classes/{classId}/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
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

Validaciones:
- [ ] Status 400 Bad Request
- [ ] Message: "day_of_week debe ser entre 0-6"

Resultado esperado: ❌ Solicitud rechazada
```

---

## 🗂️ Archivos a Revisar Antes de Deployment

### Backend
```
✅ backend/src/controllers/class.controller.ts
   └─ Revisar: createSchedules, getSchedules, updateSchedule, deleteSchedule

✅ backend/src/routes/class.routes.ts
   └─ Revisar: 4 nuevas rutas registradas

✅ backend/src/app.ts
   └─ Revisar: classRoutes importado y registrado
```

### Frontend
```
✅ frontend/src/components/AddClassModal.tsx
   └─ Revisar: Dos secciones funcionando, validaciones activas

✅ frontend/src/services/api.ts
   └─ Revisar: 4 métodos en classes.* namespace

✅ frontend/src/components/TeacherDashboard.tsx
   └─ Revisar: handleAddClass llamando createSchedules
```

### Tipos
```
✅ shared/types/index.ts
   └─ Revisar: Schedule interface presente después de Class
```

### Documentación
```
✅ SCHEDULES_IMPLEMENTATION.md
✅ SCHEDULES_API_TESTING.md
✅ SCHEDULES_SUMMARY.md
✅ CHANGELOG.md
✅ VERIFICATION_CHECKLIST.md
✅ IMPLEMENTATION_SUMMARY.md
```

---

## 🚀 Pasos de Deployment

### 1. Pre-Deployment (Local)
```bash
# Backend
[ ] cd backend
[ ] npm install
[ ] npm run build (si existe)
[ ] npm test (si existe)
[ ] npm start (verificar que levanta sin errores)

# Frontend
[ ] cd frontend
[ ] npm install
[ ] npm run build (producción)
[ ] npm run preview (vista previa de build)
```

### 2. Testing en Dev Environment
```bash
# Ejecutar todos los tests del checklist anterior
[ ] Test 1-10 completados exitosamente
[ ] No hay errores en console
[ ] No hay memory leaks
[ ] Performance aceptable
```

### 3. Code Review
```
[ ] Backend code reviewed
[ ] Frontend code reviewed
[ ] Types reviewed
[ ] Documentation reviewed
```

### 4. Deployment
```
[ ] Deploy backend a dev environment
[ ] Deploy frontend a dev environment
[ ] Verificar endpoints funcionan
[ ] Verificar BD se actualizó correctamente
```

### 5. Post-Deployment
```
[ ] Monitoring activo
[ ] Logs sin errores
[ ] Performance dentro de parámetros
[ ] Usuarios pueden crear clases con horarios
```

---

## 🔍 Puntos Críticos a Verificar

### Base de Datos
- [ ] Tabla `schedules` existe
- [ ] Índices creados: idx_schedules_class_id, idx_schedules_day_of_week
- [ ] Foreign key: schedules.class_id → classes.id
- [ ] ON DELETE CASCADE funciona
- [ ] Constraints en day_of_week (0-6)

### Backend
- [ ] Todas las funciones exportadas
- [ ] asyncHandler aplicado correctamente
- [ ] Middleware requireTeacherOrAdmin en todas las rutas
- [ ] Validaciones completas
- [ ] Error responses correctos

### Frontend
- [ ] AddClassModal renderiza 2 secciones
- [ ] Validaciones en tiempo real
- [ ] API calls correctas
- [ ] LocalStorage funcionando
- [ ] No hay memory leaks

### Integration
- [ ] Frontend → Backend requests correctas
- [ ] Respuestas JSON bien formadas
- [ ] Error handling end-to-end
- [ ] Permisos funcionan en ambos lados

---

## 📊 Métricas de Éxito

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Endpoints funcionando | 4/4 | ? |
| Tests pasando | 10/10 | ? |
| Errores de compilación | 0 | 0 ✅ |
| Performance (API) | <200ms | ? |
| Disponibilidad | 99.9% | ? |
| User satisfaction | >90% | ? |

---

## 📞 Soporte Durante Deployment

### En caso de errores:
1. Revisar logs del backend: `docker logs <container>`
2. Revisar browser console: F12 → Console tab
3. Revisar BD: `SELECT * FROM schedules;`
4. Revisar requests: F12 → Network tab
5. Revisar authentication: Token válido? Expirado?

### Contactos:
- Backend issues: Revisar SCHEDULES_API_TESTING.md
- Frontend issues: Revisar browser console
- DB issues: Revisar PostgreSQL logs

---

## ✅ Aprobación Final

- [ ] Todos los tests pasados
- [ ] Code review completado
- [ ] Documentación revisada
- [ ] Team lead aprobó
- [ ] Ready for deployment ✅

---

**Pre-Deployment Checklist**  
**Version:** 2.1.0  
**Status:** Listo para Testing Manual  
**Last Updated:** 2024-01-15
