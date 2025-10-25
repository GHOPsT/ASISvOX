# 🔐 Arquitectura de Autenticación - ASISvOX

## Resumen Ejecutivo

Se ha implementado un sistema de autenticación **robusto y centralizado** que conecta el frontend React con el backend Express/PostgreSQL usando JWT (JSON Web Tokens).

---

## 🏗️ Componentes del Sistema

### 1. Backend (Express + PostgreSQL)

#### Middleware de Autenticación (`backend/src/middleware/auth.ts`)
```typescript
// Validaciones que realiza:
✅ Verifica que existe header "Authorization: Bearer {token}"
✅ Extrae y valida el JWT usando process.env.JWT_SECRET
✅ Decodifica el payload para obtener: userId, email, role
✅ Agrega req.user con información decodificada
✅ Retorna 401 si token es inválido o expirado
```

**Flujo de validación:**
1. Cliente envía: `Authorization: Bearer {token}`
2. Middleware extrae el token
3. Verifica la firma del JWT contra `JWT_SECRET`
4. Si es válido, agrega `req.user` al request
5. Si es inválido, retorna 401 Unauthorized

#### Controlador de Autenticación (`backend/src/controllers/auth.controller.ts`)
- **Login**: Valida email/password → Genera JWT real → Retorna token
- **Register**: Crea usuario en BD → Genera JWT → Retorna token
- **JWT contiene:** `{ userId, email, role }` con expiración 24h

#### Rutas Protegidas
```typescript
// Todas las rutas requieren autenticación:
GET    /api/teachers/:id/classes       → requireTeacherOrAdmin
GET    /api/classes                    → requireTeacherOrAdmin
POST   /api/classes                    → requireTeacher
// ... etc
```

---

### 2. Frontend (React + TypeScript)

#### tokenService.ts - Servicio Centralizado
```typescript
// Función principal: Manejar todo relacionado con tokens
setToken(token, expiresIn)      // Guarda token en localStorage + fecha expiración
getToken()                       // Obtiene token, verifica expiración, limpia si expiró
isTokenExpired()                 // Valida fecha de expiración
clearToken()                     // Limpia token y datos relacionados
getUserId() / getUserRole()      // Extrae claims del JWT
isAuthenticated()                // Verifica si hay token válido
enableStorageSync()              // Sincroniza token entre pestañas (storage events)
getAuthorizationHeader()         // Retorna "Bearer {token}" listo para usar
decodeToken()                    // Decodifica JWT payload
```

**Ubicación:** `frontend/src/services/tokenService.ts`

#### ApiClient - Cliente HTTP Centralizado
```typescript
// request() method:
1. Obtiene token FRESCO de tokenService en cada llamada
2. Agrega header: Authorization: Bearer {token}
3. Ejecuta la petición HTTP
4. Retorna respuesta

// Ventajas:
✅ Token siempre actualizado (no obsoleto)
✅ Sincronización automática entre pestañas
✅ Fácil de manejar logout global
```

**Ubicación:** `frontend/src/services/api.ts`

#### AuthContext - Gestión de Sesión
```typescript
// login(email, password)
1. Llama a apiClient.auth.login({email, password})
2. Backend valida credenciales y retorna JWT
3. tokenService.setToken(token)
4. apiClient.setToken(token)
5. Guarda usuario en state y localStorage

// register(name, email, password, role)
1. Llama a apiClient.auth.register({...})
2. Backend crea usuario y retorna JWT
3. tokenService.setToken(token)
4. apiClient.setToken(token)
5. Guarda usuario en state y localStorage

// logout()
1. tokenService.clearToken()
2. apiClient.clearToken()
3. Limpia usuario del state
```

**Ubicación:** `frontend/src/contexts/AuthContext.tsx`

#### TeacherDashboard - Consumidor de API
```typescript
// loadTeacherClasses()
1. Obtiene token: const token = tokenService.getToken()
2. Configura en apiClient: apiClient.setToken(token)
3. Llama: apiClient.teachers.getTeacherClasses(user.id)
4. apiClient automáticamente agrega Authorization header
5. Backend valida token y retorna clases
```

**Ubicación:** `frontend/src/components/TeacherDashboard.tsx`

---

## 🔄 Flujo Completo de Autenticación

### 1️⃣ Inicio de Sesión

```
Usuario ingresa email/password
           ↓
LoginScreen llama AuthContext.login()
           ↓
login() → apiClient.auth.login({email, password})
           ↓
Frontend HTTP POST /api/auth/login
           ↓
Backend auth.controller.login():
  - Busca usuario por email
  - Valida contraseña con bcrypt
  - Genera JWT: jwt.sign({userId, email, role}, JWT_SECRET, {expiresIn: '24h'})
  - Retorna: {user, token, refreshToken, expiresAt}
           ↓
Frontend recibe: {success: true, data: {user, token, ...}}
           ↓
AuthContext:
  - setUser(user)
  - tokenService.setToken(token)
  - apiClient.setToken(token)
  - localStorage.setItem('asisVox_user', user)
           ↓
✅ Usuario logueado, token almacenado y listo para usar
```

### 2️⃣ Solicitud API Protegida

```
TeacherDashboard.loadTeacherClasses()
           ↓
apiClient.teachers.getTeacherClasses(user.id)
           ↓
apiClient.request() ejecuta:
  - const currentToken = tokenService.getToken() ← ⭐ FRESCO
  - headers.Authorization = `Bearer ${currentToken}`
  - fetch(url, {headers})
           ↓
Frontend HTTP GET /api/teachers/{id}/classes
           ↓
Backend recibe request con Authorization header
           ↓
authMiddleware valida:
  - Extrae token de header
  - jwt.verify(token, JWT_SECRET)
  - Agrega req.user = {id, role, email}
           ↓
getTeacherClasses() ejecuta:
  - Query PostgreSQL: SELECT ... WHERE teacher_id = req.user.id
  - Retorna clases del profesor
           ↓
✅ Frontend recibe: {success: true, data: [{...clases...}]}
```

### 3️⃣ Cierre de Sesión

```
Usuario hace click en "Logout"
           ↓
AuthContext.logout():
  - tokenService.clearToken() ← Limpia localStorage
  - apiClient.clearToken()
  - setUser(null)
           ↓
✅ Token eliminado, usuario deslogueado
```

### 4️⃣ Token Expirado

```
Usuario tiene token válido
  Pasa 24 horas...
  ↓
Siguiente solicitud API:
  - apiClient.request()
  - tokenService.getToken()
  - isTokenExpired() retorna true
  - clearToken() limpia localStorage
  - getToken() retorna null
  ↓
Authorization header NO se envía
  ↓
Backend retorna 401 Unauthorized
  ↓
Frontend debería redirigir a login
```

---

## 🔒 Seguridad

### ✅ Implementado

1. **Tokens en localStorage** 
   - ✅ Tokens JWT con firma criptográfica
   - ✅ Expiración automática (24h)

2. **HTTPS Required**
   - ⚠️ En desarrollo: HTTP (OK)
   - ✅ En producción: HTTPS (Requerido)

3. **CORS**
   - ✅ Backend valida origin
   - ✅ Credenciales solo con HTTPS

4. **Rate Limiting**
   - ⏳ Pendiente: Agregar rate limiting en login

### ⏳ Pendiente Implementar

1. **Refresh Token** - Implementado en backend, pendiente en frontend
2. **Token Rotation** - Generar nuevo token sin re-login
3. **CSRF Protection** - Si se agrega cookies
4. **Session Storage Encryption** - Encriptar tokens en localStorage

---

## 📊 Arquitectura de Base de Datos

### Tabla `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role 'teacher'|'admin'|'student',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

**Nota:** Las contraseñas se almacenan hasheadas con bcrypt (nunca en texto plano)

---

## 🧪 Pruebas

### Credenciales de Desarrollo

```
Profesor:
  Email: profesor@asisVox.com
  Password: demo123
  Role: teacher

Admin:
  Email: admin@asisVox.com
  Password: admin123
  Role: admin
```

**Nota:** Estas credenciales deben estar en la BD. Si necesitas crearlas:

```sql
-- Hash de "demo123" con bcrypt:
INSERT INTO users (id, email, password_hash, full_name, role) 
VALUES 
  (gen_uuid(), 'profesor@asisVox.com', '$2a$12$...hash...', 'Prof. María González', 'teacher'),
  (gen_uuid(), 'admin@asisVox.com', '$2a$12$...hash...', 'Admin Sistema', 'admin');
```

### Flujo de Prueba

```bash
1. Ir a http://localhost:5173 (frontend)
2. Click "Entrar"
3. Ingresar: profesor@asisVox.com / demo123
4. ✅ Debe loguear y redirigir a TeacherDashboard
5. ✅ Debe cargar clases del profesor sin errores 401
6. ✅ Actualizar página → Token persiste (localStorage)
7. ✅ Abrir otra pestaña → Token sincronizado (storage event)
8. Click "Logout" → Session limpiada
```

---

## 🛠️ Archivos Clave

| Archivo | Responsabilidad |
|---------|-----------------|
| `backend/src/middleware/auth.ts` | Validar JWT en cada request |
| `backend/src/controllers/auth.controller.ts` | Login, Register, generación JWT |
| `backend/src/config/connection.ts` | Conexión a PostgreSQL |
| `frontend/src/services/tokenService.ts` | Gestión centralizada de tokens |
| `frontend/src/services/api.ts` | Cliente HTTP con auth automática |
| `frontend/src/contexts/AuthContext.tsx` | Contexto React, estado de sesión |
| `frontend/src/components/TeacherDashboard.tsx` | Uso de API protegida |

---

## 📝 Notas Importantes

### ⭐ Principio Clave

**"Nunca usar token viejo"** → Siempre obtener token fresco de `tokenService.getToken()` en cada operación.

### 🔄 Sincronización Entre Pestañas

`tokenService.enableStorageSync()` escucha eventos de `storage` para sincronizar token entre pestañas:

```typescript
window.addEventListener('storage', (event) => {
  if (event.key === 'auth_token') {
    // Token cambió en otra pestaña
    // Actualizar instancia local
  }
});
```

### 🚀 Próximas Mejoras

1. Implementar refresh token para renovación automática
2. Agregar token rotation para mayor seguridad
3. Implementar logout forzado desde backend
4. Agregar auditoría de login/logout
5. Encriptar tokens en localStorage

---

## 📞 Troubleshooting

### ❌ Error: "Token de acceso requerido"

**Causa:** Frontend no envía Authorization header

**Solución:**
1. Verificar que `tokenService.getToken()` retorna un token
2. Verificar que apiClient.request() agrega el header
3. Abrir DevTools → Network → Verificar Authorization header

### ❌ Error: "Token inválido"

**Causa:** Token no es JWT válido o expiró

**Solución:**
1. Hacer login nuevamente para obtener JWT válido
2. Verificar que `JWT_SECRET` en backend es correcto
3. Verificar que token no tiene más de 24h

### ❌ Error: 401 en TeacherDashboard

**Causa:** Token no llega a API

**Solución:**
1. Verificar login fue exitoso (usuario en state)
2. Ejecutar `tokenService.getToken()` en console
3. Verificar que `apiClient.setToken()` fue llamado
4. Revisar Network tab de DevTools

---

**Última actualización:** 2024-10-25  
**Versión:** 2.0 (JWT Real + API Backend)
