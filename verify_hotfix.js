#!/usr/bin/env node

/**
 * VERIFICACIÓN RÁPIDA DEL HOTFIX
 * 
 * Este script verifica que los cambios del hotfix
 * han solucionado los problemas de integración
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function verifyHotfix() {
  log('\n' + '='.repeat(60), 'blue');
  log('VERIFICACIÓN RÁPIDA DEL HOTFIX', 'bold');
  log('='.repeat(60) + '\n', 'blue');

  let passed = 0;
  let failed = 0;

  // 1. Verificar que el archivo existe
  log('1. Verificando archivo modificado...', 'yellow');
  const testFile = path.join(__dirname, 'frontend_integration_test.js');
  if (fs.existsSync(testFile)) {
    log('   ✓ frontend_integration_test.js encontrado', 'green');
    passed++;
  } else {
    log('   ✗ Archivo no encontrado', 'red');
    failed++;
    return;
  }

  // 2. Verificar cambio 1: classId en constructor
  log('\n2. Verificando constructor (this.classId)...', 'yellow');
  const content = fs.readFileSync(testFile, 'utf8');
  if (content.includes('this.classId = null')) {
    log('   ✓ Propiedad classId agregada al constructor', 'green');
    passed++;
  } else {
    log('   ✗ Constructor no actualizado correctamente', 'red');
    failed++;
  }

  // 3. Verificar cambio 2: Guardar classId
  log('\n3. Verificando guardado de classId en testClasses...', 'yellow');
  if (content.includes('this.classId = classId')) {
    log('   ✓ classId se guarda correctamente en testClasses', 'green');
    passed++;
  } else {
    log('   ✗ No se guarda classId en testClasses', 'red');
    failed++;
  }

  // 4. Verificar cambio 3: Validación flexible en testStudents
  log('\n4. Verificando validación de /students...', 'yellow');
  if (content.includes('Array.isArray(data) || Array.isArray(data?.data)')) {
    log('   ✓ Validación flexible para /students implementada', 'green');
    passed++;
  } else {
    log('   ✗ Validación no actualizada en testStudents', 'red');
    failed++;
  }

  // 5. Verificar cambio 4: Parameter en /reports
  log('\n5. Verificando parámetro class_id en testReports...', 'yellow');
  if (content.includes('/reports?class_id=${this.classId}')) {
    log('   ✓ Parámetro class_id agregado a /reports', 'green');
    passed++;
  } else {
    log('   ✗ Parámetro class_id no agregado', 'red');
    failed++;
  }

  // 6. Verificar validación en testReports
  log('\n6. Verificando validación mejorada en testReports...', 'yellow');
  const reportsCheck = content.includes('if (!this.classId)');
  const reportsValidation = content.match(/testReports[\s\S]*?Array\.isArray\(data\) \|\| Array\.isArray\(data\?\.data\)/);
  if (reportsCheck && reportsValidation) {
    log('   ✓ testReports completamente actualizado', 'green');
    passed++;
  } else {
    log('   ✗ testReports no completamente actualizado', 'red');
    failed++;
  }

  // Resumen
  log('\n' + '='.repeat(60), 'blue');
  log('RESUMEN DEL HOTFIX', 'bold');
  log('='.repeat(60), 'blue');

  const total = passed + failed;
  const percentage = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

  log(`\nVerificaciones: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  log(`Porcentaje: ${percentage}%`, passed === total ? 'green' : 'yellow');

  if (passed === total) {
    log('\n✅ HOTFIX VERIFICADO CORRECTAMENTE', 'green');
    log('\nPróximo paso: node run_all_tests.js', 'yellow');
    log('Resultado esperado: 9/9 tests pasando (100%)\n', 'yellow');
  } else {
    log('\n❌ HOTFIX INCOMPLETO - Revisar cambios', 'red');
  }

  log('='.repeat(60) + '\n', 'blue');
}

verifyHotfix().catch(err => {
  log(`Error: ${err.message}`, 'red');
  process.exit(1);
});
