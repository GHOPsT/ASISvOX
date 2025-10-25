@echo off
REM ============================================
REM Script para Inicializar la Base de Datos
REM Ejecutar desde la carpeta backend\
REM ============================================

setlocal enabledelayedexpansion

REM Variables de configuración
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=asisvox
set DB_USER=postgres
set DB_SCHEMA_FILE=src\schema.sql
set DB_SEED_FILE=seed.sql

echo.
echo ========================================
echo ASISvOX - Database Initialization Script
echo ========================================
echo.

REM Verificar que existan los archivos
if not exist "%DB_SCHEMA_FILE%" (
    echo Error: Archivo %DB_SCHEMA_FILE% no encontrado
    exit /b 1
)

if not exist "%DB_SEED_FILE%" (
    echo Error: Archivo %DB_SEED_FILE% no encontrado
    exit /b 1
)

echo Configuracion:
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo.

REM Esperar a que el usuario ingrese contraseña
echo Nota: Asegúrate de que PostgreSQL está corriendo
echo.

REM Crear BD si no existe
echo [*] Creando base de datos si no existe...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -tc "SELECT 1 FROM pg_database WHERE datname = '%DB_NAME%'" | findstr /r "1" >nul
if errorlevel 1 (
    echo [*] Base de datos '%DB_NAME%' no existe. Creando...
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -c "CREATE DATABASE %DB_NAME%;" || (
        echo Error: No se pudo crear la base de datos
        exit /b 1
    )
    echo [+] Base de datos '%DB_NAME%' creada
) else (
    echo [+] Base de datos '%DB_NAME%' ya existe
)

REM Ejecutar schema
echo.
echo [*] Cargando schema.sql...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%DB_SCHEMA_FILE%" >nul 2>&1
if errorlevel 1 (
    echo Error: No se pudo cargar schema.sql
    exit /b 1
)
echo [+] Schema cargado correctamente

REM Ejecutar seed
echo.
echo [*] Cargando datos de prueba (seed.sql)...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%DB_SEED_FILE%" >nul 2>&1
if errorlevel 1 (
    echo Error: No se pudo cargar seed.sql
    exit /b 1
)
echo [+] Datos de prueba cargados correctamente

echo.
echo ========================================
echo [+] Base de datos inicializada correctamente
echo ========================================
echo.

echo Credenciales de prueba:
echo   Email: profesor@asisVox.com
echo   Contraseña: demo123
echo.

echo Clases asignadas:
echo   - Matemáticas 10°A ^(Aula 101^)
echo   - Matemáticas 10°B ^(Aula 102^)
echo.

echo Próximo paso: npm run dev
echo.

pause
