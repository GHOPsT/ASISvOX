# ===============================
# SCRIPT DE CONFIGURACIÓN RÁPIDA
# ASISvOX - Startup Script
# ===============================

# Este script configura el proyecto para ejecutarse localmente

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    🚀 ASISTENTE DE CONFIGURACIÓN ASISVOX   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Detectar directorio actual
$projectRoot = Get-Location

Write-Host "📁 Directorio del proyecto: $projectRoot" -ForegroundColor Green
Write-Host ""

# Verificar Node.js
Write-Host "🔍 Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version
$npmVersion = npm --version
Write-Host "   ✓ Node.js: $nodeVersion" -ForegroundColor Green
Write-Host "   ✓ npm: $npmVersion" -ForegroundColor Green
Write-Host ""

# Verificar dependencias
Write-Host "🔍 Verificando dependencias..." -ForegroundColor Yellow

if (Test-Path "backend/node_modules") {
    Write-Host "   ✓ Backend dependencies: OK" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Backend dependencies: NOT INSTALLED" -ForegroundColor Yellow
    Write-Host "   Instalando backend..." -ForegroundColor Cyan
    cd backend
    npm install
    cd ..
}

if (Test-Path "frontend/node_modules") {
    Write-Host "   ✓ Frontend dependencies: OK" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Frontend dependencies: NOT INSTALLED" -ForegroundColor Yellow
    Write-Host "   Instalando frontend..." -ForegroundColor Cyan
    cd frontend
    npm install
    cd ..
}

Write-Host ""

# Verificar configuración de .env
Write-Host "🔍 Verificando configuración del backend..." -ForegroundColor Yellow

if (Test-Path "backend/.env") {
    Write-Host "   ✓ Backend .env: EXISTS" -ForegroundColor Green
    
    # Verificar MONGODB_URI
    $envContent = Get-Content "backend/.env"
    if ($envContent -match "MONGODB_URI") {
        Write-Host "   ✓ MONGODB_URI: CONFIGURADA" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ MONGODB_URI: NO CONFIGURADA" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   📚 PASOS PARA CONFIGURAR MONGODB:" -ForegroundColor Cyan
        Write-Host "      1. Ir a: https://cloud.mongodb.com" -ForegroundColor White
        Write-Host "      2. Crear una cuenta gratuita" -ForegroundColor White
        Write-Host "      3. Crear un clúster gratuito" -ForegroundColor White
        Write-Host "      4. Copiar el connection string" -ForegroundColor White
        Write-Host "      5. Editar backend/.env y añadir:" -ForegroundColor White
        Write-Host "         MONGODB_URI=mongodb+srv://usuario:password@..." -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Backend .env: NOT FOUND" -ForegroundColor Red
    Write-Host "   Creando desde .env.example..." -ForegroundColor Yellow
    Copy-Item "backend/.env.example" "backend/.env"
    Write-Host "   ✓ .env creado. Editar con tus valores." -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✨ CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  CONFIGURAR MONGODB (si no lo has hecho):" -ForegroundColor White
Write-Host "   → Ir a: https://cloud.mongodb.com" -ForegroundColor Cyan
Write-Host "   → Crear clúster gratuito" -ForegroundColor Cyan
Write-Host "   → Copiar connection string" -ForegroundColor Cyan
Write-Host "   → Editar backend/.env" -ForegroundColor Cyan
Write-Host ""
Write-Host "2️⃣  INICIAR BACKEND (Nueva Terminal):" -ForegroundColor White
Write-Host "   cd backend && npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "3️⃣  INICIAR FRONTEND (Nueva Terminal):" -ForegroundColor White
Write-Host "   cd frontend && npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "4️⃣  ABRIR EN NAVEGADOR:" -ForegroundColor White
Write-Host "   → http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📚 DOCUMENTACIÓN:" -ForegroundColor Yellow
Write-Host "   • EJECUTAR_PROYECTO.md" -ForegroundColor White
Write-Host "   • ESTADO_EJECUCION.md" -ForegroundColor White
Write-Host "   • INICIO_RAPIDO.md" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Ofrecer opción de continuar
Write-Host "¿Deseas continuar con la ejecución? (S/N): " -ForegroundColor Yellow -NoNewline
$respuesta = Read-Host

if ($respuesta -eq "S" -or $respuesta -eq "s") {
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: Asegúrate de haber configurado MONGODB_URI en backend/.env" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Iniciando servidores..." -ForegroundColor Cyan
    Write-Host ""
    
    # Iniciar backend en nuevo proceso
    Write-Host "🚀 Iniciando Backend en puerto 3001..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\backend'; npm run dev"
    
    # Esperar un poco
    Start-Sleep -Seconds 2
    
    # Iniciar frontend en nuevo proceso
    Write-Host "🚀 Iniciando Frontend en puerto 3000..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\frontend'; npm run dev"
    
    Write-Host ""
    Write-Host "✅ ¡Servidores iniciados!" -ForegroundColor Green
    Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Green
    Write-Host "   Backend:  http://localhost:3001" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 TIP: Abre las ventanas de terminal nuevas para ver los logs en tiempo real" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "✓ Configuración lista. Ejecuta los servidores manualmente cuando estés listo." -ForegroundColor Green
    Write-Host ""
}

Write-Host "Presiona Enter para cerrar esta ventana..." -ForegroundColor Gray
Read-Host
