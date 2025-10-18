# 🚀 Inicio Rápido - ASISvOX

Guía rápida de 5 minutos para comenzar a usar el sistema de asignación de cursos.

## ✅ Lista de Verificación Pre-inicio

Antes de comenzar, asegúrate de tener:
- [ ] Acceso como Administrador al sistema
- [ ] Lista de profesores a registrar
- [ ] Plan de horarios y materias
- [ ] Información de aulas disponibles

---

## 📝 Paso 1: Acceso al Sistema (30 segundos)

1. Abre la aplicación ASISvOX
2. Inicia sesión con credenciales de **Administrador**
3. Verás el **Panel de Administración**

---

## 👥 Paso 2: Crear Profesores (2 minutos)

### Opción Rápida: Un Profesor

```
Panel Admin → Gestión de Usuarios → Agregar Usuario

📝 Completa:
✓ Nombre: María González
✓ Email: maria.gonzalez@colegio.com
✓ Contraseña: password123
✓ Rol: Profesor

→ Clic en "Crear Usuario"
```

### Opción Masiva: Varios Profesores

Repite el proceso anterior para cada profesor:
- Juan Pérez (Matemáticas)
- Carlos Ruiz (Física)
- Ana López (Historia)
- etc.

**Tip:** Anota las credenciales para entregarlas a cada profesor.

---

## 📚 Paso 3: Asignar Primera Clase (2 minutos)

```
Panel Admin → Asignación de Cursos → [Buscar profesor] → Asignar

📋 Formulario:
✓ Materia: Matemáticas
✓ Grado: 10° Básico
✓ Sección: A
✓ Aula: Aula 101

📅 Horario 1:
✓ Día: Lunes
✓ Inicio: 08:00
✓ Fin: 09:30

[+ Agregar Horario] para más bloques

→ Clic en "Asignar Clase"
```

**Resultado:**
- ✅ Clase asignada
- ✅ Profesor recibe notificación
- ✅ Aparece en el calendario

---

## 🔔 Paso 4: Verificar Notificación (30 segundos)

El profesor debe:
1. Iniciar sesión como **Profesor**
2. Ver badge rojo en campana 🔔
3. Clic en campana para ver notificación
4. Leer: "Se te ha asignado una nueva clase: Matemáticas - 10° Básico A"

---

## 📊 Paso 5: Ver en el Calendario (30 segundos)

Como Administrador:

```
Panel Admin → Calendario de Horarios
→ Ver distribución semanal
→ Seleccionar profesor específico (opcional)
```

Verás la clase asignada en el día y hora correspondiente.

---

## 🎯 ¡Listo!

Ya tienes el sistema funcionando. Ahora puedes:

### Próximos Pasos Recomendados

1. **Completar Horarios** (15-30 min)
   - Agregar más clases al mismo profesor
   - Asignar clases a otros profesores
   
2. **Copiar Horarios** (cuando tengas profesor con horario completo)
   - Útil para profesores suplentes
   - O profesores con carga similar

3. **Exportar Reporte** (siempre)
   - Backup de tus asignaciones
   - Para imprimir y distribuir

---

## 🆘 Solución de Problemas Rápida

### ❌ No puedo asignar clase - Hay conflictos

**Solución:**
```
1. Lee el mensaje de conflicto
2. Cambia el día o la hora
3. Intenta nuevamente
```

### ❌ El profesor no ve la notificación

**Verificar:**
```
1. ¿El profesor inició sesión?
2. ¿Tiene el ID de usuario correcto?
3. Revisar LocalStorage: 'asisVox_notifications'
```

### ❌ No aparece en el calendario

**Verificar:**
```
1. ¿La asignación se guardó?
2. ¿Seleccionaste el profesor correcto en el filtro?
3. Refrescar la página
```

---

## 📖 Recursos Adicionales

Para aprender más:

- **Tutorial Completo**: [Guía de Asignación](./ASIGNACION_PROFESORES_GUIA.md)
- **Ejemplos Detallados**: [Ejemplos de Uso](./EJEMPLOS_USO.md)
- **Documentación Técnica**: [Funcionalidades](./FUNCIONALIDADES_IMPLEMENTADAS.md)

---

## 🎓 Videos Tutorial (Próximamente)

Estamos preparando videos cortos de:
- ✓ Crear primer profesor (1 min)
- ✓ Asignar primera clase (2 min)
- ✓ Copiar horarios (1 min)
- ✓ Exportar reportes (30 seg)

---

## 💬 Preguntas Frecuentes Rápidas

### ¿Puedo asignar la misma clase a varios profesores?

✅ Sí, crea asignaciones separadas para cada profesor.

### ¿Cuántas clases puedo asignar a un profesor?

✅ Ilimitadas. El sistema calcula automáticamente las horas semanales.

### ¿Puedo cambiar una asignación después de crearla?

✅ Sí, usa el botón de editar (ícono lápiz) en la tarjeta de la clase.

### ¿Se notifica al profesor automáticamente?

✅ Sí, cada vez que asignas o copias clases.

### ¿Puedo tener dos clases el mismo día?

✅ Sí, agrega múltiples horarios o crea asignaciones separadas.

---

## 🏆 Tips para Usuarios Avanzados

### Flujo Óptimo

```
1. Crear todos los profesores primero
2. Asignar materias principales (una por una)
3. Usar "Copiar Horarios" para similares
4. Exportar reporte al finalizar el día
5. Revisar calendario semanalmente
```

### Atajos de Teclado (Próximamente)

- `Ctrl + N`: Nuevo profesor
- `Ctrl + A`: Asignar clase
- `Ctrl + E`: Exportar reporte

### Organización Recomendada

**Por Día:**
- Lunes: Profesores de Matemáticas y Ciencias
- Martes: Profesores de Humanidades
- Miércoles: Profesores de Arte y Deportes
- etc.

**Por Semana:**
- Semana 1: Básica (1° a 6°)
- Semana 2: Media (7° a 12°)
- Semana 3: Especiales (Música, Arte, etc.)

---

## ✅ Checklist de Configuración Inicial Completa

- [ ] Crear cuenta de administrador
- [ ] Crear al menos 3 profesores de prueba
- [ ] Asignar al menos 1 clase a cada profesor
- [ ] Verificar notificaciones funcionan
- [ ] Ver calendario con todas las asignaciones
- [ ] Exportar primer reporte
- [ ] Probar copiar horarios entre profesores
- [ ] Probar editar una asignación
- [ ] Probar eliminar una asignación
- [ ] Familiarizarse con detección de conflictos

**Tiempo estimado total:** 30 minutos

---

## 🎉 ¡Felicitaciones!

Ya estás listo para usar ASISvOX al máximo. 

**Recuerda:**
- 🔔 Las notificaciones son automáticas
- ⚠️ Los conflictos se detectan en tiempo real
- 📊 Los reportes siempre están disponibles
- 💾 Todo se guarda automáticamente en localStorage

---

**¿Necesitas ayuda?**  
Consulta la documentación completa o contacta al equipo de desarrollo.

**Última actualización:** Octubre 2025
