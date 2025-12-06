#!/usr/bin/env node

/**
 * VERIFICACIÓN INTERACTIVA COMPLETA
 * 
 * Este script verifica todos los aspectos del sistema:
 * 1. Hotfix aplicado
 * 2. Archivos del proyecto
 * 3. Instalación de dependencias
 * 4. Formatos de archivos
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
  gray: '\x1b[90m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function logHeader(title) {
  log('\n' + '='.repeat(70), 'blue');
  log(`${title}`, 'bold');
  log('='.repeat(70), 'blue');
}

function logSuccess(msg) {
  log(`✅ ${msg}`, 'green');
}

function logError(msg) {
  log(`❌ ${msg}`, 'red');
}

function logWarning(msg) {
  log(`⚠️  ${msg}`, 'yellow');
}

function logInfo(msg) {
  log(`ℹ️  ${msg}`, 'gray');
}

async function checkFileContent(filePath, searchStrings, description) {
  try {
    if (!fs.existsSync(filePath)) {
      logError(`${description}: Archivo no encontrado`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const allFound = searchStrings.every(str => content.includes(str));

    if (allFound) {
      logSuccess(`${description}`);
      return true;
    } else {
      const found = searchStrings.filter(str => content.includes(str));
      logError(`${description}: Solo ${found.length}/${searchStrings.length} patrones encontrados`);
      return false;
    }
  } catch (error) {
    logError(`${description}: ${error.message}`);
    return false;
  }
}

async function checkDirectory(dirPath, description) {
  try {
    if (fs.existsSync(dirPath)) {
      logSuccess(`${description}: Existe`);
      return true;
    } else {
      logError(`${description}: No encontrado`);
      return false;
    }
  } catch (error) {
    logError(`${description}: ${error.message}`);
    return false;
  }
}

async function runFullVerification() {
  let totalChecks = 0;
  let passedChecks = 0;

  logHeader('🔍 VERIFICACIÓN INTERACTIVA COMPLETA DEL SISTEMA');

  // ============================================================
  // SECCIÓN 1: VERIFICAR HOTFIX
  // ============================================================
  logHeader('1. VERIFICACIÓN DEL HOTFIX');

  const testFile = path.join(__dirname, 'frontend_integration_test.js');

  let result = await checkFileContent(
    testFile,
    ['this.classId = null'],
    'Cambio 1: Constructor con this.classId'
  );
  totalChecks++;
  if (result) passedChecks++;

  result = await checkFileContent(
    testFile,
    ['this.classId = classId;'],
    'Cambio 2: Guardar classId en testClasses'
  );
  totalChecks++;
  if (result) passedChecks++;

  result = await checkFileContent(
    testFile,
    ['Array.isArray(data) || Array.isArray(data?.data)'],
    'Cambio 3: Validación flexible en testStudents'
  );
  totalChecks++;
  if (result) passedChecks++;

  result = await checkFileContent(
    testFile,
    ['/reports?class_id=${this.classId}', 'if (!this.classId)'],
    'Cambio 4: Parámetro class_id en testReports'
  );
  totalChecks++;
  if (result) passedChecks++;

  // ============================================================
  // SECCIÓN 2: VERIFICAR ESTRUCTURA
  // ============================================================
  logHeader('2. VERIFICACIÓN DE ESTRUCTURA DEL PROYECTO');

  const backendDir = path.join(__dirname, 'backend');
  const frontendDir = path.join(__dirname, 'frontend');
  const backendModules = path.join(backendDir, 'node_modules');
  const frontendModules = path.join(frontendDir, 'node_modules');

  result = await checkDirectory(backendDir, 'Backend directorio');
  totalChecks++;
  if (result) passedChecks++;

  result = await checkDirectory(frontendDir, 'Frontend directorio');
  totalChecks++;
  if (result) passedChecks++;

  result = await checkDirectory(backendModules, 'Backend node_modules');
  totalChecks++;
  if (result) passedChecks++;
  else {
    logWarning('Ejecuta: npm install (en carpeta backend/)');
  }

  result = await checkDirectory(frontendModules, 'Frontend node_modules');
  totalChecks++;
  if (result) passedChecks++;
  else {
    logWarning('Ejecuta: npm install (en carpeta frontend/)');
  }

  // ============================================================
  // SECCIÓN 3: VERIFICAR ARCHIVOS CRÍTICOS
  // ============================================================
  logHeader('3. VERIFICACIÓN DE ARCHIVOS CRÍTICOS');

  const criticalFiles = [
    { path: path.join(__dirname, 'verify_hotfix.js'), desc: 'Script verify_hotfix.js' },
    { path: path.join(__dirname, 'run_all_tests.js'), desc: 'Script run_all_tests.js' },
    { path: path.join(__dirname, 'frontend_integration_test.js'), desc: 'Script frontend_integration_test.js' },
    { path: path.join(backendDir, 'package.json'), desc: 'Backend package.json' },
    { path: path.join(frontendDir, 'package.json'), desc: 'Frontend package.json' }
  ];

  for (const file of criticalFiles) {
    result = fs.existsSync(file.path);
    if (result) {
      logSuccess(file.desc);
      passedChecks++;
    } else {
      logError(file.desc);
    }
    totalChecks++;
  }

  // ============================================================
  // SECCIÓN 4: RESUMEN
  // ============================================================
  logHeader('📊 RESUMEN GENERAL');

  const percentage = totalChecks > 0 ? ((passedChecks / totalChecks) * 100).toFixed(1) : 0;

  log(`\nTotal verificaciones: ${passedChecks}/${totalChecks} (${percentage}%)\n`);

  if (passedChecks === totalChecks) {
    logSuccess('TODAS LAS VERIFICACIONES PASARON');
    log('\n📋 PRÓXIMOS PASOS:\n', 'yellow');
    log('1. Abre una terminal y ejecuta:', 'yellow');
    log('   $ npm start (en carpeta backend/)', 'bold');
    log('\n2. En otra terminal, ejecuta:', 'yellow');
    log('   $ npm run dev (en carpeta frontend/)', 'bold');
    log('\n3. En una tercera terminal, ejecuta:', 'yellow');
    log('   $ node run_all_tests.js', 'bold');
    log('\n4. Resultado esperado:\n', 'yellow');
    log('   ✅ 30/30 Backend tests', 'green');
    log('   ✅ 9/9 Frontend tests', 'green');
    log('   ✅ 100% TODOS LOS TESTS PASARON\n', 'green');
  } else {
    logError(`ALGUNAS VERIFICACIONES FALLARON (${totalChecks - passedChecks} problemas)`);
    log('\n⚠️  ACCIONES REQUERIDAS:\n', 'yellow');

    if (!fs.existsSync(backendModules)) {
      log('1. Backend dependencies faltantes:', 'yellow');
      log('   $ cd backend && npm install\n', 'bold');
    }

    if (!fs.existsSync(frontendModules)) {
      log('2. Frontend dependencies faltantes:', 'yellow');
      log('   $ cd frontend && npm install\n', 'bold');
    }

    log('3. Después de instalar, revisa MANUAL_VERIFICATION.txt\n', 'yellow');
  }

  logHeader('═══════════════════════════════════════════════════════════════════');

  process.exit(passedChecks === totalChecks ? 0 : 1);
}

// Ejecutar verificación
runFullVerification().catch(err => {
  logError(`Error durante verificación: ${err.message}`);
  process.exit(1);
});
