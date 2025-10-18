# 📚 Guía de Asignación de Cursos y Horarios para Profesores

## Descripción General

La funcionalidad de **Asignación de Cursos y Horarios** permite al administrador gestionar completamente las clases, materias, secciones y horarios de cada profesor en el sistema ASISvOX.

## 🎯 Características Principales

### 1. **Gestión Completa de Asignaciones**
- Asignar múltiples clases a un profesor
- Definir materia, grado, sección y aula para cada clase
- Crear horarios detallados con días y horas específicas
- Editar y eliminar asignaciones existentes

### 2. **Interfaz Intuitiva**
- Vista de lista con todos los profesores
- Indicadores visuales de clases asignadas y horas semanales
- Búsqueda rápida de profesores
- Formulario paso a paso para asignar clases

### 3. **Integración con el Calendario**
- Las asignaciones se reflejan automáticamente en el calendario semanal
- Vista de horarios por día con distribución visual
- Colores diferenciados por materia
- Información de aula y horarios detallados

## 📋 Cómo Usar

### Para el Administrador

#### **1. Crear un Profesor**
1. Ir a **"Gestión de Usuarios"** en el panel de administración
2. Clic en **"Agregar Usuario"**
3. Completar:
   - Nombre completo
   - Email
   - Contraseña
   - Seleccionar rol: **Profesor**
4. Guardar

#### **2. Asignar Clases y Horarios**
1. Ir a **"Asignación de Cursos"** en el panel de administración
2. Buscar el profesor deseado
3. Clic en **"Asignar"** en la tarjeta del profesor
4. Completar el formulario:
   - **Materia**: Seleccionar de la lista (Matemáticas, Física, etc.)
   - **Grado**: Seleccionar el nivel (1° Básico a 12° Básico)
   - **Sección**: Ingresar la letra de la sección (A, B, C, etc.)
   - **Aula/Sala**: (Opcional) Ingresar el nombre del aula

5. **Agregar Horarios**:
   - Clic en **"Agregar Horario"** para cada bloque horario
   - Seleccionar:
     - **Día**: Lunes a Sábado
     - **Hora Inicio**: Hora de inicio de la clase
     - **Hora Fin**: Hora de finalización de la clase
   - Agregar múltiples horarios según necesidad

6. Clic en **"Asignar Clase"** para guardar

#### **3. Ver el Calendario**
1. Ir a **"Calendario de Horarios"**
2. Opciones de visualización:
   - **Todos los profesores**: Ver horarios de todo el cuerpo docente
   - **Profesor individual**: Seleccionar un profesor específico
3. El calendario muestra:
   - Distribución semanal en formato de grilla
   - Días como columnas
   - Horarios como filas
   - Clases con información completa

#### **4. Editar o Eliminar Asignaciones**
1. En **"Asignación de Cursos"**, buscar el profesor
2. Localizar la clase a modificar
3. Opciones:
   - **Editar** (ícono de lápiz): Modificar detalles de la clase
   - **Eliminar** (ícono de papelera): Remover la asignación

## 💾 Datos Almacenados

### LocalStorage Keys
- `asisVox_users`: Lista de usuarios (profesores y administradores)
- `asisVox_teacher_assignments`: Asignaciones de clases y horarios

### Estructura de Asignación
```javascript
{
  teacherId: "123",
  teacherName: "Prof. María González",
  classes: [
    {
      id: "456",
      subject: "Matemáticas",
      section: "A",
      grade: "10° Básico",
      room: "Aula 101",
      schedule: [
        {
          day: "Lunes",
          startTime: "08:00",
          endTime: "09:30"
        },
        {
          day: "Miércoles",
          startTime: "08:00",
          endTime: "09:30"
        }
      ]
    }
  ]
}
```

## 🎨 Materias Disponibles

- Matemáticas
- Física
- Química
- Biología
- Historia
- Geografía
- Literatura
- Inglés
- Educación Física
- Arte
- Música
- Informática
- Filosofía
- Economía

## 📊 Estadísticas Automáticas

El sistema calcula automáticamente:
- **Total de clases asignadas** por profesor
- **Horas semanales** de cada profesor
- **Número de aulas utilizadas**
- **Materias activas** en el sistema
- **Profesores con asignaciones**

## 🔄 Flujo de Trabajo Recomendado

1. **Planificación**: Definir la estructura de cursos y horarios
2. **Crear Usuarios**: Registrar todos los profesores
3. **Asignar Materias**: Asignar las materias principales a cada profesor
4. **Definir Horarios**: Completar los horarios semanales
5. **Revisar Calendario**: Verificar en el calendario que no haya conflictos
6. **Ajustar**: Editar según sea necesario

## ✅ Validaciones

El sistema valida:
- ✓ Campos obligatorios completos
- ✓ Al menos un horario por clase
- ✓ Formato correcto de horas
- ✓ Selección de profesor válido

## ✨ Funcionalidades Avanzadas

### 🔍 Validación de Conflictos de Horario

El sistema detecta automáticamente conflictos cuando:
- Un profesor ya tiene una clase asignada en ese horario y día
- Se superponen los horarios de inicio y fin

**Cómo funciona:**
1. Al agregar o editar un horario, el sistema verifica conflictos en tiempo real
2. Si hay conflictos, aparece una alerta roja con detalles específicos
3. No se puede guardar la asignación hasta resolver los conflictos
4. El mensaje indica qué clase se solapa y en qué horario

### 📋 Copiar Horarios entre Profesores

Permite duplicar todas las asignaciones de un profesor a otro.

**Pasos:**
1. Clic en el botón **"Copiar"** en el header
2. Seleccionar el profesor origen (solo se muestran profesores con asignaciones)
3. Seleccionar el profesor destino
4. El sistema muestra cuántas clases se copiarán
5. Confirmar para copiar

**Características:**
- ✅ Copia todas las clases con sus horarios completos
- ✅ Genera IDs únicos para evitar conflictos
- ✅ Envía notificación automática al profesor destino
- ✅ No elimina las clases del profesor origen

### 📊 Exportar Reportes

Genera un reporte de texto completo con todas las asignaciones.

**Contenido del reporte:**
- Fecha y hora de generación
- Lista detallada por profesor con:
  - Nombre del profesor
  - Total de clases asignadas
  - Detalles de cada clase (materia, grado, sección, aula)
  - Horarios completos de cada clase
- Resumen general con estadísticas

**Para exportar:**
1. Clic en el botón **"Exportar"**
2. El archivo se descarga automáticamente como `.txt`
3. Nombre del archivo: `asignaciones_YYYY-MM-DD.txt`

### 🔔 Sistema de Notificaciones

Los profesores reciben notificaciones automáticas cuando:
- Se les asigna una nueva clase
- Se copian horarios hacia su cuenta

**Para profesores:**
1. El ícono de campana muestra un badge con el número de notificaciones no leídas
2. Clic en la campana para ver todas las notificaciones
3. Opciones disponibles:
   - Marcar individual como leída
   - Marcar todas como leídas
   - Eliminar notificaciones

**Características:**
- 🔴 Badge rojo con contador de no leídas
- 🕒 Timestamps relativos (ej: "Hace 5 minutos")
- 📱 Diseño responsive para móviles
- 💾 Almacenadas en localStorage

## 🔮 Próximas Mejoras Sugeridas

- [ ] Exportación de horarios a PDF con formato profesional
- [ ] Histórico de cambios en asignaciones
- [ ] Vista mensual del calendario
- [ ] Asignación masiva de horarios desde archivo CSV
- [ ] Plantillas de horarios predefinidas
- [ ] Notificaciones push en tiempo real
- [ ] Integración con Google Calendar

## 🐛 Solución de Problemas

### El calendario no muestra mis asignaciones
- Verificar que las asignaciones se guardaron correctamente
- Refrescar la vista del calendario
- Verificar que el profesor seleccionado tiene asignaciones

### No aparecen los profesores
- Asegurarse de crear usuarios con rol "Profesor"
- Verificar en "Gestión de Usuarios" que los profesores existen

### Las horas no se calculan correctamente
- Verificar formato de horas (HH:MM)
- Asegurarse que hora de fin es posterior a hora de inicio

## 📞 Contacto y Soporte

Para reportar problemas o sugerir mejoras, contactar al equipo de desarrollo de ASISvOX.

---

**Versión**: 1.0  
**Última actualización**: Octubre 2025  
**Componente**: TeacherAssignmentManager.tsx
