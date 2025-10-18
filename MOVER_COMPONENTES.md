# 📁 ARCHIVOS QUE NECESITAN SER MOVIDOS AL FRONTEND

## 🎯 **COMPONENTES PRINCIPALES**
```bash
# De /components/ a /frontend/src/components/
mv /components/AddClassModal.tsx /frontend/src/components/
mv /components/AddStudentsModal.tsx /frontend/src/components/
mv /components/AdminDashboard.tsx /frontend/src/components/
mv /components/AssessmentSetup.tsx /frontend/src/components/
mv /components/AttendanceView.tsx /frontend/src/components/
mv /components/ClassDetail.tsx /frontend/src/components/
mv /components/GradingInterface.tsx /frontend/src/components/
mv /components/LoginScreen.tsx /frontend/src/components/
mv /components/MobileHeader.tsx /frontend/src/components/
mv /components/MobileNavBar.tsx /frontend/src/components/
mv /components/RegisterScreen.tsx /frontend/src/components/
mv /components/ReportsScreen.tsx /frontend/src/components/
mv /components/StudentCard.tsx /frontend/src/components/
mv /components/VoiceAttendance.tsx /frontend/src/components/
mv /components/VoiceGrading.tsx /frontend/src/components/
```

## 📊 **COMPONENTES DE ADMINISTRACIÓN**
```bash
# De /components/admin/ a /frontend/src/components/admin/
mkdir -p /frontend/src/components/admin/
mv /components/admin/StatisticsView.tsx /frontend/src/components/admin/
mv /components/admin/TeacherCalendarView.tsx /frontend/src/components/admin/
mv /components/admin/TeacherGradesView.tsx /frontend/src/components/admin/
mv /components/admin/TeacherListView.tsx /frontend/src/components/admin/
mv /components/admin/UserManagement.tsx /frontend/src/components/admin/
```

## 🎨 **COMPONENTES UI (SHADCN)**
```bash
# De /components/ui/ a /frontend/src/components/ui/
mkdir -p /frontend/src/components/ui/
mv /components/ui/*.tsx /frontend/src/components/ui/
mv /components/ui/*.ts /frontend/src/components/ui/
```

## 🔧 **ACTUALIZAR IMPORTS**

Después de mover los archivos, necesitas actualizar las importaciones en cada componente:

### Cambios típicos:
```typescript
// ANTES:
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useAuth } from "../contexts/AuthContext";

// DESPUÉS (si está en /frontend/src/components/):
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useAuth } from "../contexts/AuthContext";

// DESPUÉS (si está en /frontend/src/components/admin/):
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useAuth } from "../../contexts/AuthContext";
```

## 📝 **ARCHIVOS YA MOVIDOS CORRECTAMENTE**
- ✅ `/frontend/src/App.tsx`
- ✅ `/frontend/src/main.tsx` 
- ✅ `/frontend/index.html`
- ✅ `/frontend/src/components/WelcomeScreen.tsx`
- ✅ `/frontend/src/components/TeacherDashboard.tsx`
- ✅ `/frontend/src/components/ClassCard.tsx`
- ✅ `/frontend/src/components/HomeworkView.tsx`
- ✅ `/frontend/src/components/ui/button.tsx`
- ✅ `/frontend/src/components/ui/utils.ts`
- ✅ `/frontend/src/contexts/AuthContext.tsx`
- ✅ `/frontend/src/services/api.ts`
- ✅ `/frontend/src/styles/globals.css`

## ⚠️ **COMPONENTES QUE NECESITAN ACTUALIZACIÓN**

### 1. AuthContext.tsx
- ✅ Ya actualizado para usar el API client

### 2. Componentes que usan AuthContext
Necesitan actualizar la importación:
```typescript
// ANTES:
import { useAuth } from "../contexts/AuthContext";

// DESPUÉS:
import { useAuth } from "../contexts/AuthContext";
```

### 3. Componentes UI
Asegúrate de que todas las importaciones de utilidades sean correctas:
```typescript
import { cn } from "./utils";
```

## 🚀 **COMANDO RÁPIDO PARA MOVER TODO**

```bash
# Mover componentes principales
cp -r /components/*.tsx /frontend/src/components/ 2>/dev/null || true

# Mover componentes admin
cp -r /components/admin/ /frontend/src/components/ 2>/dev/null || true

# Mover componentes UI
cp -r /components/ui/ /frontend/src/components/ 2>/dev/null || true

# Mover figma components (si los necesitas)
cp -r /components/figma/ /frontend/src/components/ 2>/dev/null || true
```

## 🔍 **VERIFICAR DESPUÉS DEL MOVIMIENTO**

1. **Frontend compila sin errores**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Todas las importaciones resuelven correctamente**
3. **Los componentes se renderizan sin errores**
4. **La funcionalidad de autenticación funciona**
5. **La navegación entre vistas funciona**

## 📋 **CHECKLIST FINAL**

- [ ] Componentes principales movidos a `/frontend/src/components/`
- [ ] Componentes admin movidos a `/frontend/src/components/admin/`
- [ ] Componentes UI movidos a `/frontend/src/components/ui/`
- [ ] Imports actualizados en todos los archivos
- [ ] Frontend compila sin errores
- [ ] Funcionalidad básica verificada
- [ ] Sistema de tareas funcional en TeacherDashboard
- [ ] Nueva vista HomeworkView accesible