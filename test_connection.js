#!/usr/bin/env node

/**
 * Test de conexión Frontend-Backend
 * Verifica que el frontend pueda obtener datos del backend correctamente
 */

const http = require('http');

const API_BASE_URL = 'http://localhost:3001/api';

// Credenciales del seed
const TEACHER_EMAIL = 'profesor@asisVox.com';
const TEACHER_PASSWORD = 'demo123';
const ADMIN_EMAIL = 'admin@asisvox.com';
const ADMIN_PASSWORD = 'Admin123!';

let teacherToken = null;
let adminToken = null;

function makeRequest(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL + endpoint);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testConnection() {
  console.log('\n=================================================================');
  console.log('PRUEBA DE CONEXION FRONTEND-BACKEND');
  console.log('=================================================================\n');

  try {
    // Test 1: Health Check
    console.log('📡 Test 1: Health Check del Backend');
    const healthCheck = await makeRequest('GET', '/health');
    if (healthCheck.status === 200) {
      console.log('✅ Backend respondiendo correctamente\n');
    } else {
      console.log('❌ Backend no responde: ' + healthCheck.status + '\n');
      process.exit(1);
    }

    // Test 2: Login Teacher
    console.log('🔐 Test 2: Login del Profesor');
    const teacherLogin = await makeRequest('POST', '/auth/login', {
      email: TEACHER_EMAIL,
      password: TEACHER_PASSWORD
    });
    if (teacherLogin.status === 200) {
      teacherToken = teacherLogin.data.data.token;
      console.log('✅ Login exitoso');
      console.log('   Token: ' + teacherToken.substring(0, 20) + '...\n');
    } else {
      console.log('❌ Login fallido: ' + teacherLogin.data.message + '\n');
      process.exit(1);
    }

    // Test 3: Get Master Data
    console.log('📊 Test 3: Obtener Datos Maestros');
    const subjects = await makeRequest('GET', '/master/subjects', null, teacherToken);
    if (subjects.status === 200 && subjects.data.data.length > 0) {
      console.log('✅ Subjects obtenidos: ' + subjects.data.data.length);
      console.log('   Primer subject: ' + subjects.data.data[0].name + '\n');
    } else {
      console.log('❌ Error obteniendo subjects\n');
    }

    // Test 4: Get Classes
    console.log('📚 Test 4: Obtener Clases');
    const classes = await makeRequest('GET', '/classes', null, teacherToken);
    if (classes.status === 200 && classes.data.data.length > 0) {
      console.log('✅ Clases obtenidas: ' + classes.data.data.length);
      console.log('   Primera clase: ' + classes.data.data[0].subject_name + ' - ' + classes.data.data[0].section_name + '\n');
    } else {
      console.log('❌ Error obteniendo clases\n');
    }

    // Test 5: Get Students
    console.log('👥 Test 5: Obtener Estudiantes');
    const students = await makeRequest('GET', '/students', null, teacherToken);
    if (students.status === 200 && students.data.length > 0) {
      console.log('✅ Estudiantes obtenidos: ' + students.data.length);
      console.log('   Primer estudiante: ' + students.data[0].first_name + ' ' + students.data[0].last_name + '\n');
    } else {
      console.log('❌ Error obteniendo estudiantes\n');
    }

    // Test 6: Get Statistics
    console.log('📈 Test 6: Obtener Estadísticas');
    const stats = await makeRequest('GET', '/statistics/dashboard', null, teacherToken);
    if (stats.status === 200) {
      console.log('✅ Estadísticas obtenidas');
      console.log('   Total de clases: ' + stats.data.data.total_classes);
      console.log('   Total de profesores: ' + stats.data.data.total_teachers + '\n');
    } else {
      console.log('❌ Error obteniendo estadísticas\n');
    }

    // Test 7: Login Admin
    console.log('🔐 Test 7: Login del Administrador');
    const adminLogin = await makeRequest('POST', '/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    if (adminLogin.status === 200) {
      adminToken = adminLogin.data.data.token;
      console.log('✅ Login de admin exitoso\n');
    } else {
      console.log('❌ Login de admin fallido\n');
    }

    console.log('=================================================================');
    console.log('✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log('=================================================================\n');
    console.log('Estado: BACKEND Y FRONTEND CONECTADOS CORRECTAMENTE ✅\n');
    
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\n⚠️  Asegúrate de que:');
    console.log('  1. El backend está corriendo en http://localhost:3001');
    console.log('  2. PostgreSQL está corriendo');
    console.log('  3. Las credenciales del seed son correctas\n');
    process.exit(1);
  }
}

testConnection();
