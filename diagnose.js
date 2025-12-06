#!/usr/bin/env node

/**
 * DIAGNÓSTICO RÁPIDO - Verificar estado del sistema
 */

const BASE_URL = 'http://localhost:3001/api';

async function diagnose() {
  console.log('\n' + '='.repeat(60));
  console.log('DIAGNÓSTICO DEL SISTEMA - ASISvOX');
  console.log('='.repeat(60) + '\n');

  // 1. Check backend connectivity
  console.log('1. Verificando conectividad del backend...');
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'profesor@asisVox.com',
        password: 'demo123'
      })
    });

    console.log(`   ✓ Backend responde: ${response.status} ${response.statusText}`);

    const data = await response.json();
    
    if (response.status === 200) {
      console.log('   ✓ LOGIN EXITOSO');
      console.log(`   ✓ Token recibido: ${data.token ? 'SÍ' : 'NO'}`);
      return true;
    } else if (response.status === 401) {
      console.log('   ✗ CREDENCIALES RECHAZADAS (401 Unauthorized)');
      console.log(`   Mensaje: ${data.message || 'No message'}`);
      console.log('\n   POSIBLES CAUSAS:');
      console.log('   1. Las credenciales son incorrectas');
      console.log('   2. El seed de datos no fue ejecutado');
      console.log('   3. El usuario no existe en la base de datos');
      
      // Try to get more info
      console.log('\n   INTENTANDO DIAGNOSTICAR....');
      
      // Intenta verificar si hay usuarios
      try {
        console.log('   Intentando obtener maestros sin autenticación...');
        const testResponse = await fetch(`${BASE_URL}/teachers`);
        console.log(`   Respuesta: ${testResponse.status}`);
        
        if (testResponse.status === 401) {
          console.log('   ✗ Autenticación requerida (esperado)');
        } else if (testResponse.status === 200) {
          console.log('   ✓ Endpoint respondió (pero requiere auth)');
        }
      } catch (e) {
        console.log(`   Error: ${e.message}`);
      }
      
      return false;
    } else {
      console.log(`   ✗ Error inesperado: ${response.status}`);
      console.log(`   Respuesta: ${JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    console.log(`   ✗ ERROR: No se pudo conectar al backend`);
    console.log(`   Detalle: ${error.message}`);
    console.log('\n   SOLUCIÓN:');
    console.log('   1. Asegúrate que el backend está corriendo');
    console.log('   2. Verifica que está en puerto 3001');
    console.log('   3. Ejecuta: cd backend && npm start');
    return false;
  }
}

diagnose().then(success => {
  console.log('\n' + '='.repeat(60));
  
  if (success) {
    console.log('✅ SISTEMA OK - Puedes ejecutar los tests');
    console.log('\nPróximo paso: node test_final.js');
  } else {
    console.log('❌ PROBLEMAS DETECTADOS - Ver soluciones arriba');
    console.log('\nVerifica que el backend está corriendo correctamente');
  }
  
  console.log('='.repeat(60) + '\n');
  process.exit(success ? 0 : 1);
});
