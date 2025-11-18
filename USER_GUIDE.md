# 📚 GUÍA DE USO - Sistema de Horarios (Schedules)

## 🎯 Descripción General

El sistema de gestión de horarios permite a los docentes de ASISvOX asignar múltiples horarios a sus clases. Una clase puede tener múltiples horarios (por ejemplo: Lunes 8-9am, Miércoles 10-11am, Viernes 2-3pm).

---

## 👥 Para Docentes

### ¿Cómo Crear una Clase con Horarios?

#### Paso 1: Acceder al Dashboard
1. Login como docente
2. Ir a "Mis Clases" o dashboard principal
3. Buscar botón "+ Crear Clase"

#### Paso 2: Completar Información Básica
En la primera sección del modal, llenar:
```
- Materia: (seleccionar de lista)
- Sección: (seleccionar de lista)
- Año Académico: (seleccionar de lista)
- Aula: (ej: "101", "205")
```

#### Paso 3: Agregar Horarios
En la segunda sección (azul claro):

1. **Seleccionar Día:**
   - Domingo (0)
   - Lunes (1)
   - Martes (2)
   - Miércoles (3)
   - Jueves (4)
   - Viernes (5)
   - Sábado (6)

2. **Establecer Hora de Inicio:**
   - Click en campo de hora
   - Seleccionar hora: HH:MM (ej: 08:00)

3. **Establecer Hora de Fin:**
   - Click en campo de hora
   - Seleccionar hora: HH:MM (ej: 09:00)
   - **Importante:** La hora de fin debe ser MAYOR que la hora de inicio

4. **Agregar Horario:**
   - Click en botón "+ Agregar Horario"
   - El horario se agrega a la lista de abajo

5. **Agregar Más Horarios (Opcional):**
   - Repetir pasos 1-4 para más horarios
   - Ej: Lunes 8-9, Miércoles 10-11, Viernes 14-15

#### Paso 4: Guardar Clase
1. Revisar que tiene:
   - ✅ Información básica completa
   - ✅ Al menos 1 horario
   - ✅ Todos los horarios válidos

2. Click en "Guardar Clase"

3. Esperar a que se guarde (animación de carga)

4. ¡Listo! La clase aparece en tu dashboard

---

### ¿Cómo Editar los Horarios de una Clase?

#### Opción 1: Desde el Dashboard
1. Buscar la clase en la lista
2. Click en la clase (abrir detalle)
3. Buscar sección "Horarios"
4. Click en horario que quieres editar
5. Cambiar hora de inicio/fin
6. Click "Guardar"

#### Opción 2: Desde el API (Avanzado)
```bash
# Editar horario específico
curl -X PUT http://localhost:3001/api/classes/{classId}/schedules/{scheduleId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"start_time": "09:00:00", "end_time": "10:00:00"}'
```

---

### ¿Cómo Eliminar un Horario?

#### Desde el Dashboard
1. Ir a detalle de clase
2. Buscar sección "Horarios"
3. Click en botón "Eliminar" del horario
4. Confirmar eliminación

#### Desde el Modal de Creación
1. Abrir modal de crear clase
2. En sección de horarios, click en "X" o botón "Eliminar"
3. El horario se remueve de la lista

---

### ¿Cómo Ver Todos mis Horarios?

1. Dashboard → "Mis Clases"
2. Cada clase muestra sus horarios
3. Click en clase para ver detalle completo
4. Sección "Horarios" lista todos

---

## 👨‍💼 Para Administradores

### Visualizar Horarios de Todas las Clases

#### Como Admin de Entidad
- Acceso a todas las clases de tu entidad
- Ver y editar todos los horarios
- Ver estadísticas de uso de aulas

#### Como Admin General
- Acceso a TODOS los horarios del sistema
- Generar reportes
- Validar conflictos (si se implementa)

---

## 🔧 Referencia Técnica

### Estructura de un Horario

```typescript
{
  id: "uuid-string",
  classId: "uuid-string",           // ID de la clase
  dayOfWeek: 1,                     // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  startTime: "08:00:00",            // Formato 24h: HH:MM:SS
  endTime: "09:00:00",              // Debe ser > startTime
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z"
}
```

### Mapeo de Días
```
0 → Domingo
1 → Lunes
2 → Martes
3 → Miércoles
4 → Jueves
5 → Viernes
6 → Sábado
```

### Formato de Tiempo
- ✅ "08:00:00" (recomendado)
- ✅ "14:30:45"
- ✅ "09:00" (se convierte a "09:00:00")
- ❌ "8:00" (incorrecto, falta 0)
- ❌ "2:00 PM" (no soportado)

---

## 📱 Ejemplos de Uso

### Ejemplo 1: Clase de Inglés con 2 horarios
```
Información:
- Materia: Inglés
- Sección: 8°B
- Año: 2024
- Aula: 103

Horarios:
- Martes 09:00-10:00
- Jueves 14:00-15:00

Resultado: Los estudiantes de 8°B tienen inglés martes y jueves
```

### Ejemplo 2: Taller de Robótica con 1 horario
```
Información:
- Materia: Robótica
- Sección: Club
- Año: 2024
- Aula: Lab 01

Horarios:
- Viernes 16:00-18:00

Resultado: Robótica el viernes en el laboratorio
```

### Ejemplo 3: Educación Física con 3 horarios
```
Información:
- Materia: Educación Física
- Sección: 10°A
- Año: 2024
- Aula: Cancha

Horarios:
- Lunes 10:00-11:00
- Miércoles 10:00-11:00
- Viernes 14:00-15:00

Resultado: EF tres veces a la semana
```

---

## ⚠️ Restricciones y Validaciones

### No Permitido:
```
❌ Hora de fin IGUAL a hora de inicio
   Ej: 08:00 - 08:00

❌ Hora de fin MENOR que hora de inicio
   Ej: 09:00 - 08:00

❌ Dos horarios el MISMO día en la misma clase
   Ej: Lunes 08:00-09:00 Y Lunes 10:00-11:00

❌ day_of_week fuera de rango 0-6
   Ej: dayOfWeek = 7

❌ Campos básicos vacíos
   - Materia requerida
   - Sección requerida
   - Año requerido

❌ Clase sin horarios
   - Al menos 1 horario es obligatorio
```

### Permitido:
```
✅ Múltiples horarios diferentes días
   Ej: Lunes 08:00-09:00, Miércoles 10:00-11:00

✅ Clases todas en el mismo día (diferentes horas)
   Ej: Matemáticas Lunes 8-9 y Lunes 10-11
   (pero en clases DIFERENTES)

✅ Actualizar solo algunos campos
   Ej: Solo cambiar hora de fin

✅ Eliminar horario sin eliminar clase
   Ej: Quitar clase del viernes, mantener lunes/miércoles
```

---

## 🐛 Solución de Problemas

### Problema 1: "No puedo agregar un horario"

**Posibles causas:**

1. End time es menor o igual a start time
   - ✅ Solución: Asegurar que `end_time > start_time`

2. El día ya tiene un horario
   - ✅ Solución: Eliminar el anterior o usar otro día

3. Hay campos vacíos en los inputs
   - ✅ Solución: Llenar todos los campos (Día, Inicio, Fin)

4. No hay información básica
   - ✅ Solución: Llenar primero Materia, Sección, Año

---

### Problema 2: "La clase no aparece después de guardar"

**Posibles causas:**

1. La solicitud POST falló
   - ✅ Revisar console (F12 → Console)
   - ✅ Revisar Network tab
   - ✅ ¿Está el token válido?

2. Falta de horarios
   - ✅ Necesitas agregar al menos 1 horario

3. Conexión perdida
   - ✅ Revisar conexión internet
   - ✅ Recargar página (F5)

4. Permisos insuficientes
   - ✅ ¿Eres profesor o admin?
   - ✅ ¿La clase es de tu entidad?

---

### Problema 3: "Error 403: Forbidden"

**Causa:** No tienes permiso para acceder/modificar

**Soluciones:**
- [ ] ¿Eres el profesor de esta clase? (solo profesores pueden editar sus propias clases)
- [ ] ¿Eres admin de esta entidad? (admins pueden editar clases de su entidad)
- [ ] ¿Eres admin general? (puedes editar todo)

---

### Problema 4: "Error 400: Bad Request"

**Causa:** Los datos enviados son inválidos

**Soluciones:**
- [ ] Verificar que end_time > start_time
- [ ] Verificar que day_of_week está entre 0-6
- [ ] Verificar que no hay horarios duplicados para el mismo día
- [ ] Revisar mensaje de error específico

---

### Problema 5: "Error 404: Not Found"

**Causa:** La clase o horario no existe

**Soluciones:**
- [ ] Verificar que la clase existe
- [ ] Verificar que tienes acceso a esa clase
- [ ] Recargar la página

---

## 📞 Contacto y Soporte

Si encuentras problemas:

1. **Revisar documentación:**
   - SCHEDULES_IMPLEMENTATION.md
   - SCHEDULES_API_TESTING.md

2. **Revisar logs:**
   - Browser console (F12)
   - Network tab (F12 → Network)
   - Backend logs

3. **Contactar soporte:**
   - Incluir código de error
   - Incluir pasos para reproducir
   - Incluir captura de pantalla

---

## 📚 Documentación Relacionada

- **SCHEDULES_IMPLEMENTATION.md** - Documentación técnica completa
- **SCHEDULES_API_TESTING.md** - Guía de testing con ejemplos
- **CHANGELOG.md** - Cambios de versión 2.1.0
- **VERIFICATION_CHECKLIST.md** - Verificación de componentes

---

## 🎓 FAQ (Preguntas Frecuentes)

### ¿Puedo tener una clase en 2 salones diferentes?
No, una clase es de un aula específica. Si necesitas múltiples salones, crea clases separadas.

### ¿Puedo cambiar el salón después de crear la clase?
Sí, dentro de los detalles de la clase hay opción de editar información básica.

### ¿Qué pasa si elimino un horario?
Solo se elimina ese horario. La clase y los otros horarios permanecen.

### ¿Qué pasa si elimino la clase?
Se elimina la clase Y todos sus horarios automáticamente.

### ¿Puedo tener la misma clase 2 veces en el mismo día?
No, una clase puede tener solo 1 horario por día. Para tener múltiples instancias, crea clases separadas (Grupo A, Grupo B, etc).

### ¿Se pueden enviar notificaciones antes de una clase?
Está en la lista de "Futuras Mejoras". Por ahora, no.

### ¿Se puede importar un horario de Excel?
Está en la lista de "Futuras Mejoras". Por ahora, hay que agregar manualmente.

---

## ✅ Resumen Rápido

| Acción | Pasos |
|--------|-------|
| Crear clase + horarios | Modal → Llenar info + agregar horarios → Guardar |
| Ver horarios | Dashboard → Click clase → Ver sección Horarios |
| Editar horario | Detalle clase → Click horario → Editar → Guardar |
| Eliminar horario | Detalle clase → Click eliminar en horario → Confirmar |
| Ver mis clases | Dashboard → "Mis Clases" |

---

**Versión:** 2.1.0  
**Última actualización:** 2024-01-15  
**Estado:** Completado ✅
