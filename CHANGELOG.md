# 📋 Changelog - ASISvOX

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [2.0.0] - 2025-10-09

### 🎉 Añadido

#### Sistema de Asignación de Cursos y Horarios
- **TeacherAssignmentManager**: Componente completo para gestionar asignaciones de profesores
  - Formulario de asignación con validación
  - Edición y eliminación de asignaciones
  - Vista de todas las asignaciones por profesor
  - Búsqueda de profesores
  - Estadísticas en tiempo real

#### Validación de Conflictos de Horario
- Detección automática de solapamiento de horarios
- Alertas visuales con detalles específicos de conflictos
- Prevención de guardar asignaciones con conflictos
- Validación en tiempo real al editar horarios
- Algoritmo de detección de conflictos por día y hora

#### Copiar Horarios entre Profesores
- Modal dedicado para copiar horarios
- Selector de profesor origen y destino
- Vista previa de clases a copiar
- Validación de profesores válidos
- Generación automática de IDs únicos
- Notificación automática al profesor destino

#### Exportar Reportes
- Generación de reporte completo en formato texto
- Descarga automática con fecha en el nombre
- Incluye todos los profesores y sus asignaciones
- Resumen estadístico al final
- Formato legible y estructurado

#### Sistema de Notificaciones
- **NotificationsPanel**: Componente reutilizable de notificaciones
  - Badge con contador de no leídas
  - Timestamps relativos (ej: "Hace 5 minutos")
  - Marcar como leída (individual o masivo)
  - Eliminar notificaciones
  - Diseño responsive
  - Almacenamiento en localStorage
- Integración en TeacherDashboard
- Integración en AdminDashboard
- Notificaciones automáticas al asignar clases
- Notificaciones automáticas al copiar horarios

### 🔄 Cambiado

#### AdminDashboard
- Agregado botón "Asignación de Cursos" en el menú principal
- Integrado panel de notificaciones en el header
- Estadísticas dinámicas basadas en datos reales
- Mejorada la vista de estado del sistema

#### TeacherDashboard
- Integrado panel de notificaciones en el header
- Mejora en la distribución de botones del header

#### TeacherCalendarView
- Actualizado para usar datos reales de asignaciones
- Integración con localStorage de asignaciones
- Transformación de datos de asignaciones a formato calendario
- Mejorada la carga de horarios

### 📚 Documentación

- Creado `ASIGNACION_PROFESORES_GUIA.md` - Guía completa de uso
- Creado `FUNCIONALIDADES_IMPLEMENTADAS.md` - Documentación técnica detallada
- Actualizado `README.md` con nuevas funcionalidades
- Creado `CHANGELOG.md` - Registro de cambios

### 🛠️ Técnico

#### Nuevos Tipos de Datos
```typescript
interface TeacherAssignment {
  teacherId: string;
  teacherName: string;
  classes: ClassAssignment[];
}

interface ClassAssignment {
  id: string;
  subject: string;
  section: string;
  grade: string;
  room?: string;
  schedule: ScheduleSlot[];
}

interface ScheduleSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'assignment' | 'general';
  read: boolean;
  createdAt: string;
}
```

#### Nuevas LocalStorage Keys
- `asisVox_teacher_assignments`: Almacena todas las asignaciones
- `asisVox_notifications`: Almacena notificaciones de usuarios

#### Componentes Nuevos
- `/components/admin/TeacherAssignmentManager.tsx`
- `/components/NotificationsPanel.tsx`

#### Utilidades Agregadas
- `checkScheduleConflicts()`: Validación de conflictos de horario
- `timeToMinutes()`: Conversión de tiempo a minutos para comparación
- `createNotification()`: Crear notificaciones para usuarios
- `handleCopySchedule()`: Copiar horarios entre profesores
- `handleExportReport()`: Exportar reporte de asignaciones

### 📊 Estadísticas

- **Líneas de código agregadas**: ~1,500
- **Componentes nuevos**: 2
- **Funciones de utilidad**: 5+
- **Tipos TypeScript**: 4 nuevos interfaces
- **Archivos de documentación**: 3

---

## [1.0.0] - 2025-10-01

### Inicial
- Lanzamiento inicial de ASISvOX
- Sistema de autenticación básico
- Gestión de usuarios
- Sistema de asistencia manual
- Sistema de calificaciones
- Panel de administración básico
- Calendario de horarios

---

## Formato

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

### Tipos de Cambios
- **Añadido** para nuevas funcionalidades
- **Cambiado** para cambios en funcionalidades existentes
- **Obsoleto** para funcionalidades que pronto serán removidas
- **Eliminado** para funcionalidades removidas
- **Corregido** para corrección de bugs
- **Seguridad** para vulnerabilidades
