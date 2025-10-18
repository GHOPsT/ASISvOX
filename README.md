# ASISvOX - Sistema Educativo

Sistema completo de gestión educativa con funcionalidades para docentes y administradores.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

### 🎨 Frontend
- **Tecnología**: React + TypeScript + Tailwind CSS
- **Ubicación**: `/frontend/`
- **Descripción**: Interfaz de usuario móvil-first con componentes reutilizables

### 🚀 Backend
- **Tecnología**: API REST con TypeScript
- **Ubicación**: `/backend/`
- **Descripción**: APIs para autenticación, gestión de datos y lógica de negocio

### 📂 Shared
- **Ubicación**: `/shared/`
- **Descripción**: Tipos, interfaces y utilidades compartidas entre frontend y backend

## Funcionalidades Principales

### Core Features
- ✅ **Autenticación y Autorización** - Sistema de login con roles diferenciados
- ✅ **Gestión de Usuarios** - Crear y administrar profesores, administradores y estudiantes
- ✅ **Sistema de Asistencia** - Registro manual y por reconocimiento de voz
- ✅ **Sistema de Calificaciones** - Notas manuales y por voz con observaciones
- ✅ **Generación de Reportes** - Exportación de datos y estadísticas
- ✅ **Panel de Administración** - Dashboard completo para administradores
- ✅ **Calendario y Horarios** - Vista semanal de clases y horarios

### 🆕 Nuevas Funcionalidades (v2.0)

#### 📚 Sistema Avanzado de Asignación de Cursos
- ✅ **Asignación de Clases a Profesores** - Materia, grado, sección, aula y horarios
- ✅ **Validación de Conflictos** - Detección automática de solapamiento de horarios
- ✅ **Copiar Horarios** - Duplicar asignaciones entre profesores
- ✅ **Exportar Reportes** - Generación de reportes de asignaciones en formato texto
- ✅ **Sistema de Notificaciones** - Alertas automáticas a profesores sobre asignaciones

#### 🔔 Sistema de Notificaciones
- ✅ Badge con contador de notificaciones no leídas
- ✅ Timestamps relativos (ej: "Hace 5 minutos")
- ✅ Marcar como leída (individual o todas)
- ✅ Eliminar notificaciones
- ✅ Diseño responsive para móviles

## 📚 Documentación

- **[Guía de Asignación de Profesores](./ASIGNACION_PROFESORES_GUIA.md)** - Tutorial completo del sistema de asignaciones
- **[Funcionalidades Implementadas](./FUNCIONALIDADES_IMPLEMENTADAS.md)** - Documentación técnica detallada
- **[Ejemplos de Uso](./EJEMPLOS_USO.md)** - Casos prácticos y escenarios reales
- **[Changelog](./CHANGELOG.md)** - Historial de cambios y versiones

## Arquitectura

```
ASISvOX/
├── frontend/          # Aplicación React
├── backend/           # APIs y lógica de servidor
├── shared/           # Tipos y utilidades compartidas
└── docs/             # Documentación
```

## Instalación y Desarrollo

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## Tecnologías Utilizadas

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Node.js, TypeScript, Express
- **Base de Datos**: MongoDB/PostgreSQL
- **Autenticación**: JWT
- **Reconocimiento de Voz**: Web Speech API