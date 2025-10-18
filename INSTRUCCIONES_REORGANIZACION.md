# 🔧 INSTRUCCIONES PARA REORGANIZAR ASISvOX

## ✅ **YA COMPLETADO**

- ✅ Estructura del backend creada
- ✅ Modelos de base de datos implementados  
- ✅ Configuración de base de datos con datos de prueba
- ✅ APIs y controladores base estructurados
- ✅ Tipos compartidos definidos
- ✅ Cliente API del frontend configurado
- ✅ Archivos de configuración creados

## 🚧 **PENDIENTE - REORGANIZACIÓN FRONTEND**

### Paso 1: Crear estructura del frontend
```bash
# Crear carpetas necesarias en frontend/src/
mkdir -p frontend/src/components/admin
mkdir -p frontend/src/components/ui
mkdir -p frontend/src/contexts
mkdir -p frontend/src/styles
```

### Paso 2: Mover componentes principales
Necesitas mover estos archivos de `/components/` a `/frontend/src/components/`:

```
WelcomeScreen.tsx
LoginScreen.tsx
RegisterScreen.tsx
TeacherDashboard.tsx
AdminDashboard.tsx
ClassDetail.tsx
AttendanceView.tsx
ReportsScreen.tsx
ClassCard.tsx
StudentCard.tsx
AddClassModal.tsx
AddStudentsModal.tsx
AssessmentSetup.tsx
GradingInterface.tsx
VoiceAttendance.tsx
VoiceGrading.tsx
MobileHeader.tsx
MobileNavBar.tsx
```

### Paso 3: Mover componentes de administración
De `/components/admin/` a `/frontend/src/components/admin/`:
```
StatisticsView.tsx
TeacherCalendarView.tsx
TeacherGradesView.tsx
TeacherListView.tsx
UserManagement.tsx
```

### Paso 4: Mover componentes UI
De `/components/ui/` a `/frontend/src/components/ui/`:
```
(Todos los archivos .tsx del directorio ui/)
```

### Paso 5: Actualizar imports
En cada componente movido, actualizar las importaciones:

**Antes:**
```typescript
import { Button } from "./ui/button";
import { Card } from "./ui/card";
```

**Después:**
```typescript
import { Button } from "./ui/button";
import { Card } from "./ui/card";
```

### Paso 6: Crear main.tsx
```typescript
// frontend/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Paso 7: Crear index.html
```html
<!-- frontend/index.html -->
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ASISvOX - Sistema Educativo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## 🗄️ **BASE DE DATOS - CONFIGURACIÓN**

### Credenciales de prueba creadas:

**Administrador:**
- Email: `admin@asisVox.com`
- Password: `admin123`

**Profesor 1:**
- Email: `maria.gonzalez@asisVox.com`
- Password: `teacher123`

**Profesor 2:**
- Email: `carlos.ruiz@asisVox.com`
- Password: `teacher123`

**Estudiantes:**
- Email: `estudiante1@asisVox.com` a `estudiante10@asisVox.com`
- Password: `student123`

### Datos creados automáticamente:
- ✅ 1 Administrador
- ✅ 2 Profesores con horarios
- ✅ 2 Clases (Matemáticas 10°A, Física 11°A)
- ✅ 10 Estudiantes distribuidos en las clases
- ✅ Configuración del sistema

## 🚀 **COMANDOS PARA INICIAR**

### 1. Instalar dependencias del backend:
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### 3. Iniciar MongoDB:
```bash
# Opción 1: MongoDB local
mongod

# Opción 2: Docker
docker run -d -p 27017:27017 --name asisVox-mongo mongo:latest
```

### 4. Iniciar backend:
```bash
cd backend
npm run dev
```

### 5. Instalar dependencias del frontend:
```bash
cd frontend
npm install
```

### 6. Iniciar frontend:
```bash
cd frontend
npm run dev
```

## 🔧 **CONFIGURACIONES ADICIONALES**

### Backend .env:
```bash
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/asisVox
JWT_SECRET=tu-clave-secreta-jwt
FRONTEND_URL=http://localhost:3000
```

### Verificar que todo funcione:
1. **Backend**: http://localhost:3001/health
2. **Frontend**: http://localhost:3000
3. **API Test**: http://localhost:3001/api/auth/me (con token)

## 📋 **CHECKLIST FINAL**

- [ ] Archivos del frontend movidos a `/frontend/src/`
- [ ] Imports actualizados en todos los componentes
- [ ] main.tsx e index.html creados
- [ ] Backend funcionando con base de datos
- [ ] Frontend conectando a la API
- [ ] Login funcionando con credenciales de prueba
- [ ] Datos de prueba cargados correctamente

## 🆘 **SOLUCIÓN DE PROBLEMAS**

### Error de conexión a MongoDB:
```bash
# Verificar que MongoDB esté ejecutándose
mongo --eval "db.stats()"

# O verificar servicio
systemctl status mongod
```

### Error de CORS:
Verificar que `FRONTEND_URL` en `.env` coincida con la URL del frontend.

### Error de imports:
Verificar que todas las rutas relativas sean correctas después de mover los archivos.

## 📞 **SIGUIENTE PASO**

Una vez completada la reorganización, el sistema estará listo para:
1. Desarrollo de funcionalidades adicionales
2. Implementación de reconocimiento de voz
3. Generación de reportes
4. Deployment a producción