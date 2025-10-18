# 📖 Ejemplos de Uso - ASISvOX

Esta guía proporciona ejemplos prácticos paso a paso de cómo usar las nuevas funcionalidades del sistema.

## 🎯 Escenarios Comunes

### Escenario 1: Asignar Primera Clase a un Profesor Nuevo

**Contexto:** Acabas de contratar al Prof. Juan Pérez y necesitas asignarle su primera clase de Matemáticas.

**Pasos:**

1. **Crear el Usuario Profesor**
   ```
   Panel Admin → Gestión de Usuarios → Agregar Usuario
   
   Nombre: Juan Pérez
   Email: juan.perez@colegio.com
   Contraseña: password123
   Rol: Profesor
   ```

2. **Asignar la Primera Clase**
   ```
   Panel Admin → Asignación de Cursos → Buscar "Juan Pérez" → Asignar
   
   Materia: Matemáticas
   Grado: 10° Básico
   Sección: A
   Aula: Aula 101
   
   Horario 1:
   - Día: Lunes
   - Hora Inicio: 08:00
   - Hora Fin: 09:30
   
   Horario 2:
   - Día: Miércoles
   - Hora Inicio: 08:00
   - Hora Fin: 09:30
   ```

3. **Resultado**
   - ✅ La clase se asigna exitosamente
   - ✅ Juan Pérez recibe una notificación
   - ✅ Aparece en el calendario semanal
   - ✅ Las estadísticas se actualizan automáticamente

---

### Escenario 2: Detectar y Resolver Conflicto de Horario

**Contexto:** Intentas asignar una clase que se solapa con una existente.

**Pasos:**

1. **Intentar Asignar Clase Conflictiva**
   ```
   Panel Admin → Asignación de Cursos → Buscar "María González" → Asignar
   
   Materia: Física
   Grado: 11° Básico
   Sección: B
   
   Horario:
   - Día: Lunes
   - Hora Inicio: 08:30  ← Ya tiene clase de 08:00-09:30
   - Hora Fin: 10:00
   ```

2. **Sistema Detecta Conflicto**
   ```
   ⚠️ ALERTA DE CONFLICTO:
   "Lunes 08:30-10:00 se solapa con Matemáticas (08:00-09:30)"
   ```

3. **Resolver Conflicto**
   ```
   Opción A: Cambiar el día
   - Día: Martes (sin conflictos)
   
   Opción B: Cambiar el horario
   - Hora Inicio: 10:00
   - Hora Fin: 11:30
   ```

4. **Resultado**
   - ✅ Sin conflictos, clase asignada
   - ✅ Profesor recibe notificación

---

### Escenario 3: Copiar Horario de Profesor Titular a Suplente

**Contexto:** El Prof. Carlos Ruiz estará ausente por 2 semanas. La Prof. Ana López lo reemplazará.

**Pasos:**

1. **Abrir Función de Copiar**
   ```
   Panel Admin → Asignación de Cursos → Botón "Copiar"
   ```

2. **Seleccionar Profesores**
   ```
   Copiar desde: Prof. Carlos Ruiz (3 clases)
   Copiar hacia: Prof. Ana López
   
   Vista previa: "Se copiarán 3 clases a Prof. Ana López"
   ```

3. **Confirmar y Ejecutar**
   ```
   Clic en "Copiar Horarios"
   ```

4. **Resultado**
   - ✅ 3 clases copiadas con éxito
   - ✅ Ana López recibe notificación: "Se te han asignado 3 nuevas clases copiadas de Prof. Carlos Ruiz"
   - ✅ Carlos Ruiz mantiene sus clases originales
   - ✅ IDs únicos generados para evitar conflictos

**Nota:** Las clases de Carlos no se eliminan. Si necesitas eliminarlas temporalmente, hazlo manualmente.

---

### Escenario 4: Exportar Reporte para Reunión de Profesores

**Contexto:** Necesitas un reporte impreso para la reunión de coordinación docente.

**Pasos:**

1. **Exportar Reporte**
   ```
   Panel Admin → Asignación de Cursos → Botón "Exportar"
   ```

2. **Descarga Automática**
   ```
   Archivo descargado: asignaciones_2025-10-09.txt
   ```

3. **Contenido del Reporte**
   ```
   REPORTE DE ASIGNACIONES DE PROFESORES
   =====================================
   Generado: 9/10/2025 14:30:00
   
   Prof. María González
   ──────────────────────────────────────────────────
   Total de clases: 3
   
   1. Matemáticas - 10° Básico A
      Aula: Aula 101
      Horarios:
      - Lunes: 08:00 - 09:30
      - Miércoles: 08:00 - 09:30
      - Viernes: 08:00 - 09:30
   
   2. Álgebra - 11° Básico B
      Aula: Aula 102
      Horarios:
      - Martes: 10:00 - 11:30
      - Jueves: 10:00 - 11:30
   
   [... más profesores ...]
   
   ==================================================
   RESUMEN
   ==================================================
   Total de profesores con asignaciones: 5
   Total de clases asignadas: 24
   Materias activas: 8
   ```

4. **Uso del Reporte**
   - Imprimir para distribución
   - Enviar por email
   - Archivar para registros

---

### Escenario 5: Profesor Revisa sus Notificaciones

**Contexto:** Prof. Juan Pérez acaba de iniciar sesión y tiene notificaciones pendientes.

**Pasos:**

1. **Observar Notificación**
   ```
   Dashboard del Profesor
   
   [🔔 2]  ← Badge rojo con número de notificaciones
   ```

2. **Abrir Panel de Notificaciones**
   ```
   Clic en la campana
   ```

3. **Ver Notificaciones**
   ```
   📚 Se te ha asignado una nueva clase: Matemáticas - 10° Básico A
      Hace 5 minutos
   
   📚 Se te han asignado 3 nuevas clases copiadas de Prof. Carlos Ruiz
      Hace 2 horas
   ```

4. **Gestionar Notificaciones**
   ```
   Opción A: Marcar individual como leída [✓]
   Opción B: Marcar todas como leídas (botón arriba)
   Opción C: Eliminar notificación [×]
   ```

5. **Resultado**
   - ✅ Badge actualizado (desaparece si no hay más no leídas)
   - ✅ Notificaciones marcadas permanecen en el historial
   - ✅ Notificaciones eliminadas se borran permanentemente

---

### Escenario 6: Crear Horario Completo para Profesor Nuevo

**Contexto:** Profesor nuevo necesita un horario completo de Lunes a Viernes.

**Pasos:**

1. **Primera Clase - Lunes**
   ```
   Matemáticas - 10° Básico A
   Lunes: 08:00 - 09:30
   Miércoles: 08:00 - 09:30
   Viernes: 08:00 - 09:30
   ```

2. **Segunda Clase - Martes y Jueves**
   ```
   Álgebra - 11° Básico B
   Martes: 10:00 - 11:30
   Jueves: 10:00 - 11:30
   ```

3. **Tercera Clase - Tardes**
   ```
   Geometría - 9° Básico C
   Lunes: 14:00 - 15:30
   Miércoles: 14:00 - 15:30
   ```

4. **Verificar en Calendario**
   ```
   Panel Admin → Calendario de Horarios → Seleccionar profesor
   
   Vista semanal muestra:
   - 3 clases diferentes
   - 7 bloques horarios totales
   - Sin conflictos
   - Total: 10.5 horas semanales
   ```

---

## 🚨 Casos Especiales

### Caso 1: Dos Horarios el Mismo Día

**Problema:** Necesitas asignar clase en la mañana y en la tarde el mismo día.

**Solución:**
```
Al crear la clase, agregar múltiples horarios:

Clic en "+ Agregar Horario"

Horario 1:
- Día: Lunes
- Inicio: 08:00
- Fin: 09:30

Horario 2:
- Día: Lunes
- Inicio: 14:00
- Fin: 15:30
```

### Caso 2: Clase Tres Veces por Semana

**Solución:**
```
Una sola asignación con 3 horarios:

Matemáticas - 10° Básico A

Horario 1: Lunes 08:00-09:30
Horario 2: Miércoles 08:00-09:30
Horario 3: Viernes 08:00-09:30
```

### Caso 3: Profesor con Doble Carga

**Solución:**
```
Crear dos asignaciones separadas:

Asignación 1:
- Matemáticas Básica (10° A, B, C)

Asignación 2:
- Matemáticas Avanzada (11° A, B)

Permite gestionar cada grupo independientemente
```

---

## 💡 Tips y Mejores Prácticas

### ✅ Hacer

1. **Verificar disponibilidad antes de asignar**
   - Revisar calendario del profesor
   - Verificar estadísticas de horas semanales

2. **Usar nombres consistentes para aulas**
   - ✅ "Aula 101", "Lab. Física"
   - ❌ "Aula 101", "aula101", "A-101"

3. **Exportar reportes regularmente**
   - Backup semanal de asignaciones
   - Antes de hacer cambios masivos

4. **Informar a los profesores**
   - Las notificaciones son automáticas
   - Pero considera un aviso adicional para cambios importantes

### ❌ Evitar

1. **No asignar sin verificar conflictos**
   - Sistema detecta automáticamente
   - Pero planificar previene errores

2. **No copiar horarios sin revisar**
   - Verificar que el destino esté disponible
   - Considerar diferencias en capacidades/materias

3. **No eliminar sin confirmar**
   - Los cambios son permanentes
   - Exportar reporte antes de cambios grandes

---

## 🔄 Flujos de Trabajo Completos

### Inicio de Año Escolar

```
Semana 1: Crear todos los usuarios profesores
Semana 2: Asignar materias principales
Semana 3: Completar horarios secundarios
Semana 4: Revisar y ajustar conflictos
Semana 5: Exportar reporte final y distribuir
```

### Cambio de Profesor

```
1. Identificar reemplazo
2. Copiar horarios del saliente al entrante
3. Verificar notificación recibida
4. Confirmar con el nuevo profesor
5. (Opcional) Eliminar asignaciones del saliente
6. Actualizar registros
```

### Revisión Mensual

```
1. Exportar reporte de asignaciones
2. Verificar carga de cada profesor (horas/semana)
3. Identificar desequilibrios
4. Ajustar según necesidad
5. Notificar cambios a afectados
```

---

## 📞 Soporte

Si encuentras un escenario no cubierto aquí, consulta:
- [Guía de Asignación de Profesores](./ASIGNACION_PROFESORES_GUIA.md)
- [Funcionalidades Implementadas](./FUNCIONALIDADES_IMPLEMENTADAS.md)
- Contacta al equipo de desarrollo

---

**Última actualización:** Octubre 2025  
**Versión de ejemplos:** 1.0
