#!/usr/bin/env node

/**
 * FRONTEND INTEGRATION TEST
 * Verifica que el frontend pueda conectarse correctamente al backend
 * y que todos los endpoints usados en los 6 fixes funcionen
 */

const BASE_URL = 'http://localhost:3001/api';

// Credenciales de prueba del seed (deben coincidir con seed.sql)
const TEST_CREDENTIALS = {
  teacher: {
    email: 'profesor@asisVox.com',
    password: 'demo123'
  },
  admin: {
    email: 'admin@asisvox.com', 
    password: 'Admin123!'
  }
};

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

class FrontendIntegrationTest {
  constructor() {
    this.token = null;
    this.classId = null; // Guardar el ID de la clase para usarlo en otros tests
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async request(method, endpoint, body = null, token = null) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      method,
      headers
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);
    const data = await response.json();
    
    return { status: response.status, data };
  }

  addResult(testName, passed, message = '') {
    this.results.tests.push({ testName, passed, message });
    if (passed) {
      this.results.passed++;
      this.log(`  [✓] ${testName}`, 'green');
    } else {
      this.results.failed++;
      this.log(`  [✗] ${testName}: ${message}`, 'red');
    }
  }

  async runTests() {
    this.log('\n' + '='.repeat(60), 'blue');
    this.log('PRUEBAS DE INTEGRACIÓN FRONTEND - ASISvOX', 'bold');
    this.log('='.repeat(60) + '\n', 'blue');

    // 1. Test Auth
    this.log('\n--- AUTENTICACIÓN ---', 'yellow');
    await this.testAuth();

    // 2. Test Classes API (usado en ReportsScreen y ClassDetail)
    this.log('\n--- CLASES (ReportsScreen, ClassDetail) ---', 'yellow');
    await this.testClasses();

    // 3. Test Students API (usado en ClassDetail)
    this.log('\n--- ESTUDIANTES (ClassDetail) ---', 'yellow');
    await this.testStudents();

    // 4. Test Teachers API (usado en TeacherAssignmentManager, TeacherCalendarView)
    this.log('\n--- DOCENTES (TeacherAssignmentManager, TeacherCalendarView) ---', 'yellow');
    await this.testTeachers();

    // 5. Test Reports API (usado en ReportsScreen)
    this.log('\n--- REPORTES (ReportsScreen) ---', 'yellow');
    await this.testReports();

    // 6. Test Master Data API (usado en AddClassModal)
    this.log('\n--- DATOS MAESTROS (AddClassModal) ---', 'yellow');
    await this.testMasterData();

    // Print summary
    this.printSummary();
  }

  async testAuth() {
    try {
      const { status, data } = await this.request(
        'POST',
        '/auth/login',
        TEST_CREDENTIALS.teacher
      );

      // El backend retorna: { data: { token, user }, success: true }
      // Extraer el token correctamente
      const token = data?.data?.token || data?.token;
      const passed = status === 200 && token;
      
      this.addResult(
        'Login teacher',
        passed,
        passed ? '' : `Status: ${status}, Token: ${token ? 'found' : 'not found'}`
      );

      if (passed) {
        this.token = token;
      }
    } catch (error) {
      this.addResult('Login teacher', false, error.message);
    }
  }

  async testClasses() {
    if (!this.token) {
      this.log('  [!] Skipping: No token available', 'yellow');
      return;
    }

    try {
      // Test: Get all classes
      const { status, data } = await this.request(
        'GET',
        '/classes',
        null,
        this.token
      );

      const passed = status === 200 && Array.isArray(data.data);
      this.addResult(
        'GET /classes',
        passed,
        passed ? '' : `Status: ${status}`
      );

      if (passed && data.data.length > 0) {
        const classId = data.data[0].id;
        this.classId = classId; // Guardar para usar en otros tests
        
        // Test: Get class by ID
        const { status: statusById, data: dataById } = await this.request(
          'GET',
          `/classes/${classId}`,
          null,
          this.token
        );

        this.addResult(
          `GET /classes/{id}`,
          statusById === 200,
          statusById === 200 ? '' : `Status: ${statusById}`
        );
      }
    } catch (error) {
      this.addResult('GET /classes', false, error.message);
    }
  }

  async testStudents() {
    if (!this.token) {
      this.log('  [!] Skipping: No token available', 'yellow');
      return;
    }

    try {
      const { status, data } = await this.request(
        'GET',
        '/students',
        null,
        this.token
      );

      // El endpoint devuelve array directamente o en data.data
      const isArray = Array.isArray(data) || Array.isArray(data?.data);
      const passed = status === 200 && isArray;
      this.addResult(
        'GET /students',
        passed,
        passed ? '' : `Status: ${status}`
      );
    } catch (error) {
      this.addResult('GET /students', false, error.message);
    }
  }

  async testTeachers() {
    if (!this.token) {
      this.log('  [!] Skipping: No token available', 'yellow');
      return;
    }

    try {
      const { status, data } = await this.request(
        'GET',
        '/teachers',
        null,
        this.token
      );

      const passed = status === 200 && Array.isArray(data.data);
      this.addResult(
        'GET /teachers',
        passed,
        passed ? '' : `Status: ${status}`
      );
    } catch (error) {
      this.addResult('GET /teachers', false, error.message);
    }
  }

  async testReports() {
    if (!this.token) {
      this.log('  [!] Skipping: No token available', 'yellow');
      return;
    }

    if (!this.classId) {
      this.log('  [!] Skipping: No class ID available', 'yellow');
      return;
    }

    try {
      const { status, data } = await this.request(
        'GET',
        `/reports?class_id=${this.classId}`,
        null,
        this.token
      );

      const isArray = Array.isArray(data) || Array.isArray(data?.data);
      const passed = status === 200 && isArray;
      this.addResult(
        'GET /reports',
        passed,
        passed ? '' : `Status: ${status}`
      );
    } catch (error) {
      this.addResult('GET /reports', false, error.message);
    }
  }

  async testMasterData() {
    if (!this.token) {
      this.log('  [!] Skipping: No token available', 'yellow');
      return;
    }

    try {
      // Test: Get subjects
      const { status: statusSubjects } = await this.request(
        'GET',
        '/master/subjects',
        null,
        this.token
      );
      this.addResult(
        'GET /master/subjects',
        statusSubjects === 200,
        statusSubjects === 200 ? '' : `Status: ${statusSubjects}`
      );

      // Test: Get sections
      const { status: statusSections } = await this.request(
        'GET',
        '/master/sections',
        null,
        this.token
      );
      this.addResult(
        'GET /master/sections',
        statusSections === 200,
        statusSections === 200 ? '' : `Status: ${statusSections}`
      );

      // Test: Get academic years
      const { status: statusYears } = await this.request(
        'GET',
        '/master/academic-years',
        null,
        this.token
      );
      this.addResult(
        'GET /master/academic-years',
        statusYears === 200,
        statusYears === 200 ? '' : `Status: ${statusYears}`
      );
    } catch (error) {
      this.addResult('Master data', false, error.message);
    }
  }

  printSummary() {
    this.log('\n' + '='.repeat(60), 'blue');
    this.log('RESUMEN DE PRUEBAS', 'bold');
    this.log('='.repeat(60), 'blue');

    const total = this.results.passed + this.results.failed;
    const percentage = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;

    this.log(`\nPasadas: ${this.results.passed}/${total}`, 'green');
    this.log(`Fallidas: ${this.results.failed}/${total}`, this.results.failed > 0 ? 'red' : 'green');
    this.log(`Porcentaje: ${percentage}%\n`, this.results.failed === 0 ? 'green' : 'yellow');

    if (this.results.failed === 0) {
      this.log('✓ TODAS LAS PRUEBAS PASARON - Frontend conectado correctamente', 'green');
      this.log('✓ Los 6 fixes están funcionando correctamente\n', 'green');
    } else {
      this.log('✗ Algunas pruebas fallaron\n', 'red');
    }
  }
}

// Run tests
const tester = new FrontendIntegrationTest();
tester.runTests().catch(error => {
  console.error('Error ejecutando pruebas:', error);
  process.exit(1);
});
