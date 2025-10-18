# 🚀 Guía para Ejecutar ASISvOX

## ✅ Estado Actual

### ✓ Frontend
- **Estado**: ✅ CORRIENDO
- **URL**: http://localhost:3000
- **Tecnología**: React + Vite + TypeScript

### ⚠️ Backend
- **Estado**: ⏸️ REQUIERE CONFIGURACIÓN
- **URL**: http://localhost:3001
- **Tecnología**: Express + TypeScript
- **Dependencia**: MongoDB

---

## 📋 Requisitos del Sistema

### Instalados ✓
- ✅ Node.js
- ✅ npm (gestor de paquetes)
- ✅ Dependencias del proyecto

### Pendientes ⚠️
- ❌ MongoDB (Base de datos)

---

## 🔧 Configuración de MongoDB

### Opción 1: MongoDB Atlas (Cloud - Recomendado para Desarrollo)

1. **Crear cuenta en MongoDB Atlas**
   - Ir a: https://www.mongodb.com/cloud/atlas
   - Registrarse con correo o Google
   - Crear un clúster gratuito

2. **Obtener Connection String**
   - En Atlas, ir a "Databases" → "Connect"
   - Seleccionar "Drivers"
   - Copiar el connection string

3. **Actualizar .env**
   ```bash
   # En: c:\Users\ikuto\Documents\Proyectos\ASISvOX\backend\.env
   
   MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/asisvox?retryWrites=true&w=majority
   ```

### Opción 2: MongoDB Local (Recomendado para Producción)

1. **Descargar MongoDB Community Edition**
   - Ir a: https://www.mongodb.com/try/download/community
   - Seleccionar Windows
   - Descargar el instalador

2. **Instalar MongoDB**
   - Ejecutar el instalador
   - Seleccionar "Install MongoDB as a Service"
   - Seguir las instrucciones del instalador

3. **Verificar instalación**
   ```powershell
   mongosh
   ```
   Debería conectarse a: `mongodb://localhost:27017`

4. **Actualizar .env (si se instala localmente)**
   ```bash
   # En: c:\Users\ikuto\Documents\Proyectos\ASISvOX\backend\.env
   
   MONGODB_URI=mongodb://localhost:27017/asisvox
   ```

### Opción 3: Docker (Alternativa)

1. **Instalar Docker Desktop**
   - https://www.docker.com/products/docker-desktop

2. **Ejecutar MongoDB en Docker**
   ```powershell
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

3. **Verificar que está corriendo**
   ```powershell
   docker ps | findstr mongodb
   ```

---

## 🏃 Pasos para Ejecutar el Proyecto

### Paso 1: Configurar MongoDB
Seguir UNA de las opciones anteriores (recomendado: MongoDB Atlas para desarrollo rápido)

### Paso 2: Actualizar Variables de Entorno
```bash
# Archivo: c:\Users\ikuto\Documents\Proyectos\ASISvOX\backend\.env

NODE_ENV=development
PORT=3001
JWT_SECRET=tu-clave-secreta-jwt
FRONTEND_URL=http://localhost:3000

# Agregar o modificar:
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/asisvox?retryWrites=true&w=majority
```

### Paso 3: Iniciar Backend (Nueva Terminal)
```powershell
cd c:\Users\ikuto\Documents\Proyectos\ASISvOX\backend
npm run dev
```

**Resultado esperado:**
```
🔄 Conectando a MongoDB...
✅ Conectado a MongoDB exitosamente
🚀 ASISvOX Backend running on port 3001
📊 Health check: http://localhost:3001/health
🔗 API Base URL: http://localhost:3001/api
```

### Paso 4: Abrir Frontend en Navegador
- URL: http://localhost:3000

---

## 📊 Verificar que Todo Funciona

### Backend Health Check
```powershell
curl http://localhost:3001/health
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "ASISvOX Backend is running",
  "timestamp": "2025-10-18T...",
  "version": "1.0.0"
}
```

### Frontend
Debe cargar la aplicación en el navegador con:
- Pantalla de login
- Formularios de autenticación
- Interfaz de usuario completa

---

## 🔑 Credenciales de Prueba

Una vez que MongoDB esté configurado, la base de datos se llena automáticamente con datos de prueba:

### Admin
- **Email**: admin@asisVox.com
- **Contraseña**: admin123

### Profesor
- **Email**: maria.gonzalez@asisVox.com
- **Contraseña**: teacher123

---

## 🎯 Desarrollar Localmente

### Terminal 1: Backend
```powershell
cd c:\Users\ikuto\Documents\Proyectos\ASISvOX\backend
npm run dev
```

### Terminal 2: Frontend
```powershell
cd c:\Users\ikuto\Documents\Proyectos\ASISvOX\frontend
npm run dev
```

Ambos servidores se reinician automáticamente cuando guardas cambios (hot reload).

---

## 🐛 Troubleshooting

### Error: "MongoParseError: option buffermaxentries is not supported"
**Solución**: Actualizar la versión de MongoDB Driver
```powershell
cd backend
npm install mongoose@latest
```

### Error: "Cannot connect to MongoDB"
**Solución**: 
1. Verificar que MongoDB está corriendo
2. Verificar el connection string en `.env`
3. Comprobar credenciales si usas MongoDB Atlas

### Error: "Port 3000 or 3001 already in use"
**Solución**:
```powershell
# Encontrar qué está usando el puerto
netstat -ano | findstr :3000
# Matar el proceso
taskkill /PID <PID> /F
```

### Error: "CORS error"
**Solución**: Verificar que `FRONTEND_URL` en `.env` sea correcto
```bash
FRONTEND_URL=http://localhost:3000
```

---

## 📚 Documentación Adicional

- **[Guía Rápida](./INICIO_RAPIDO.md)** - Tutorial de 5 minutos
- **[README Principal](./README.md)** - Descripción general del proyecto
- **[Funcionalidades](./FUNCIONALIDADES_IMPLEMENTADAS.md)** - Características implementadas
- **[Ejemplos de Uso](./EJEMPLOS_USO.md)** - Casos prácticos

---

## ✨ Status de Ejecución

### Servicios Activos
- ✅ Frontend: http://localhost:3000 (EN EJECUCIÓN)
- ⏸️ Backend: http://localhost:3001 (PENDIENTE MONGODB)
- ⏸️ MongoDB: (REQUIERE CONFIGURACIÓN)

### Siguientes Pasos
1. Configurar MongoDB (Opción recomendada: MongoDB Atlas)
2. Actualizar `.env` con MONGODB_URI
3. Reiniciar backend
4. ¡Listo para usar! 🎉

---

**Última actualización**: Octubre 18, 2025

