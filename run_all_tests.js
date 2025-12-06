#!/usr/bin/env node

/**
 * SCRIPT DE VERIFICACIÓN COMPLETA
 * Ejecuta todos los tests en orden
 */

const { spawn } = require('child_process');
const fs = require('fs');

const tests = [
  {
    name: '1. Diagnóstico del Sistema',
    file: 'diagnose.js',
    description: 'Verifica conectividad backend y autenticación'
  },
  {
    name: '2. Tests del Backend',
    file: 'test_final.js',
    description: 'Ejecuta 30 tests de endpoints'
  },
  {
    name: '3. Pruebas de Integración Frontend',
    file: 'frontend_integration_test.js',
    description: 'Verifica integración frontend-backend'
  }
];

let currentTest = 0;
let results = [];

function runTest(testIndex) {
  if (testIndex >= tests.length) {
    printSummary();
    return;
  }

  const test = tests[testIndex];
  console.log('\n' + '='.repeat(70));
  console.log(`${test.name}`);
  console.log('='.repeat(70));
  console.log(`${test.description}\n`);

  const child = spawn('node', [test.file], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  child.on('exit', (code) => {
    results.push({
      test: test.name,
      exitCode: code,
      success: code === 0
    });
    
    console.log('\n');
    runTest(testIndex + 1);
  });

  child.on('error', (err) => {
    console.error(`Error ejecutando ${test.file}:`, err);
    results.push({
      test: test.name,
      exitCode: 1,
      success: false,
      error: err.message
    });
    runTest(testIndex + 1);
  });
}

function printSummary() {
  console.log('\n' + '='.repeat(70));
  console.log('RESUMEN GENERAL DE PRUEBAS');
  console.log('='.repeat(70) + '\n');

  let passCount = 0;
  let failCount = 0;

  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.test}`);
    
    if (result.success) {
      passCount++;
    } else {
      failCount++;
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
  });

  console.log('\n' + '-'.repeat(70));
  console.log(`Total: ${results.length} | ✅ Pasadas: ${passCount} | ❌ Fallidas: ${failCount}`);
  console.log('-'.repeat(70));

  if (failCount === 0) {
    console.log('\n✅ TODOS LOS TESTS PASARON - SISTEMA LISTO PARA PRODUCCIÓN\n');
    process.exit(0);
  } else {
    console.log('\n❌ ALGUNOS TESTS FALLARON - Revisa los detalles arriba\n');
    process.exit(1);
  }
}

// Inicio
console.log('\n' + '='.repeat(70));
console.log('SUITE COMPLETA DE VERIFICACIÓN - ASISvOX v1.0');
console.log('='.repeat(70));
console.log('\nEjecutando pruebas en orden...\n');

runTest(0);
