# 🔐 Troubleshooting: Credenciales Inválidas

## ❌ Problema

Cuando intentas iniciar sesión, recibes el mensaje:
```
❌ Credenciales Inválidas
El correo o contraseña que ingresaste no son correctos.
```

## ✅ Soluciones

### Solución 1: Cargar los Datos de Prueba (MÁS COMÚN)

El usuario de prueba (`profesor@asisVox.com`) **no existe en la BD**. Debes ejecutar el script de inicialización:

#### Windows:
```bash
cd backend
.\init-db.bat
```

#### Linux/Mac:
```bash
cd backend
chmod +x init-db.sh
./init-db.sh
```

**Este script:**
- ✅ Crea la BD si no existe
- ✅ Carga el schema
- ✅ Carga los datos de prueba con las credenciales correctas

### Solución 2: Verificar que la BD está corriendo

```bash
# Verificar que PostgreSQL está activo
psql -U postgres -d asisvox -c "SELECT 1"
```

Si falla, inicia PostgreSQL:
- **Windows:** Abre pgAdmin o usa `pg_ctl start`
- **Linux:** `sudo systemctl start postgresql`
- **Mac:** `brew services start postgresql@15`

### Solución 3: Crear Manualmente el Usuario

Si el script no funcionó, crea el usuario manualmente:

```bash
# Conectar a la BD
psql -U postgres -d asisvox

# Ejecutar este SQL:
INSERT INTO users (email, password_hash, full_name, role) 
VALUES (
  'profesor@asisVox.com',
  crypt('demo123', gen_salt('bf')),
  'Prof. María González',
  'teacher'
);

# Salir
\q
```

### Solución 4: Verificar que la BD tiene datos

```bash
psql -U postgres -d asisvox -c "SELECT email, full_name, role FROM users LIMIT 5;"
```

Debe mostrar:
```
        email         |       full_name        | role
---------------------+------------------------+--------
 profesor@asisVox.com | Prof. María González   | teacher
 admin@asisVox.com    | Administrador Sistema  | admin
```

Si no muestra nada, ejecuta nuevamente `init-db.bat` o `init-db.sh`.

---

## 📋 Credenciales Correctas

### Profesor
```
Email: profesor@asisVox.com
Contraseña: demo123
```

### Administrador
```
Email: admin@asisVox.com
Contraseña: admin123
```

---

## 🐛 Debugging

Si aún tienes problemas, verifica:

### 1. Backend corriendo
```bash
cd backend
npm run dev
```

Debe mostrar:
```
✅ Servidor corriendo en puerto 3001
✅ Conectado a PostgreSQL
```

### 2. Frontend corriendo
```bash
cd frontend
npm run dev
```

Debe mostrar:
```
VITE v... ready in ... ms
```

### 3. Revisar logs del backend

En la terminal del backend, cuando intentes login, debes ver:
```
🔍 Query ejecutado {
  text: 'SELECT id, email, password_hash, full_name, role...',
  duration: X,
  rows: 1  ← Debe ser 1, no 0
}
```

Si `rows: 0`, el usuario no existe en la BD.

---

## ✅ Verificación Rápida

Para verificar que todo está correcto:

```bash
# 1. Inicia backend
cd backend && npm run dev

# 2. En otra terminal, inicia frontend
cd frontend && npm run dev

# 3. Abre http://localhost:5173
# 4. Haz click en "Usar Credenciales" (Profesor o Admin)
# 5. Haz click en "Iniciar Sesión"

# Resultado esperado:
# ✅ "¡Bienvenido a ASISvOX!"
# ✅ Se carga TeacherDashboard con clases
```

---

## 📞 Si Aún No Funciona

1. **Revisa que PostgreSQL está corriendo**
   - Windows: Busca pgAdmin en inicio
   - Linux: `sudo systemctl status postgresql`
   - Mac: `brew services list`

2. **Verifica el puerto 3001 no está en uso**
   ```bash
   lsof -i :3001  # Linux/Mac
   netstat -ano | findstr :3001  # Windows
   ```

3. **Revisa los logs del backend** (importante!)
   - Busca "Query ejecutado"
   - Busca "Conectado a PostgreSQL"
   - Si ves errores, cópialos y pégalos aquí

4. **Reinicia todo**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend  
   cd frontend && npm run dev
   
   # Actualiza navegador: Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)
   ```

---

**Última actualización:** 2024-10-25
