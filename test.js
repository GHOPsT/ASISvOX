const http = require('http');

const baseUrl = 'http://localhost:3001';
const tests = [];
let tokenAdmin = '';
let tokenTeacher = '';
let classId = 1;
let sessionId = 1;
let assessmentId = 1;

function makeRequest(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const fullPath = '/api' + endpoint;
    const url = new URL(baseUrl + fullPath);
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
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function test(name, method, endpoint, body = null, token = null) {
  try {
    const result = await makeRequest(method, endpoint, body, token);
    const success = result.status < 400;
    const icon = success ? '✓' : '✗';
    
    console.log(`\n[${icon}] ${name} (${result.status})`);
    
    if (!success) {
      console.log('Error:', result.data);
    }
    
    tests.push({ name, success, status: result.status });
    return result.data?.data || result.data;
  } catch (error) {
    console.log(`[✗] ${name} - ${error.message}`);
    tests.push({ name, success: false, error: error.message });
    return null;
  }
}

async function runTests() {
  console.log('\n================================================');
  console.log('PRUEBAS EXHAUSTIVAS DE ENDPOINTS');
  console.log('================================================\n');

  // AUTH TESTS
  console.log('--- AUTENTICACION ---');
  
  let admin = await test('1. Register admin_general', 'POST', '/auth/register', {
    name: 'Admin Test',
    email: 'admin@test.com',
    password: 'Admin123!',
    role: 'admin_general'
  });
  tokenAdmin = admin?.token;

  let teacher = await test('2. Register teacher', 'POST', '/auth/register', {
    name: 'Teacher Test',
    email: 'teacher@test.com',
    password: 'Teacher123!',
    role: 'teacher'
  });
  tokenTeacher = teacher?.token;

  let student = await test('3. Register student', 'POST', '/auth/register', {
    name: 'Student Test',
    email: 'student@test.com',
    password: 'Student123!',
    role: 'student'
  });
  const tokenStudent = student?.token;

  // MASTER DATA TESTS
  console.log('\n--- DATOS MAESTROS ---');
  
  await test('4. Get subjects', 'GET', '/master/subjects', null, tokenAdmin);
  await test('5. Get sections', 'GET', '/master/sections', null, tokenAdmin);
  
  let years = await test('6. Get academic years', 'GET', '/master/academic-years', null, tokenAdmin);
  const yearId = years?.[0]?.id || 1;
  
  await test('7. Get grades', 'GET', '/master/grades', null, tokenAdmin);

  // CLASS TESTS
  console.log('\n--- CLASES ---');
  
  let classData = await test('8. Create class with weeks_duration', 'POST', '/classes', {
    name: 'Matematicas 1',
    subject_id: 1,
    section_id: 1,
    academic_year_id: yearId,
    max_students: 30,
    weeks_duration: 16,
    teachers: [1]
  }, tokenAdmin);
  classId = classData?.id || 1;

  await test('9. Get all classes', 'GET', '/classes', null, tokenAdmin);
  await test('10. Get class by ID', 'GET', `/classes/${classId}`, null, tokenAdmin);

  // ATTENDANCE TESTS
  console.log('\n--- ASISTENCIA ---');
  
  let session = await test('11. Create attendance session', 'POST', '/attendance/sessions', {
    class_id: classId,
    session_date: '2025-11-29',
    start_time: '09:00:00',
    end_time: '10:00:00'
  }, tokenTeacher);
  sessionId = session?.id || 1;

  await test('12. Get attendance sessions', 'GET', `/attendance/sessions?class_id=${classId}`, null, tokenTeacher);

  let record = await test('13. Record attendance', 'POST', '/attendance/records', {
    session_id: sessionId,
    student_id: 1,
    status: 'present'
  }, tokenTeacher);
  const recordId = record?.id || 1;

  await test('14. Get attendance records', 'GET', `/attendance/records?session_id=${sessionId}`, null, tokenTeacher);
  await test('15. Update attendance record', 'PUT', `/attendance/records/${recordId}`, { status: 'late' }, tokenTeacher);

  // ASSESSMENT TESTS
  console.log('\n--- EVALUACIONES ---');
  
  await test('16. Get assessment types', 'GET', '/assessments/types', null, tokenTeacher);

  let assessment = await test('17. Create assessment', 'POST', '/assessments', {
    class_id: classId,
    assessment_type_id: 1,
    name: 'Quiz 1',
    description: 'Quiz sobre fracciones',
    total_points: 10,
    scheduled_date: '2025-11-30'
  }, tokenTeacher);
  assessmentId = assessment?.id || 1;

  await test('18. Get assessments', 'GET', `/assessments?class_id=${classId}`, null, tokenTeacher);
  await test('19. Get assessment by ID', 'GET', `/assessments/${assessmentId}`, null, tokenTeacher);
  await test('20. Update assessment', 'PUT', `/assessments/${assessmentId}`, {
    name: 'Quiz 1 - Actualizado'
  }, tokenTeacher);

  // GRADING TESTS
  console.log('\n--- CALIFICACIONES ---');
  
  let grade = await test('21. Record single grade', 'POST', '/grades', {
    assessment_id: assessmentId,
    student_id: 1,
    score: 9.5,
    comments: 'Excelente desempenio'
  }, tokenTeacher);
  const gradeId = grade?.id || 1;

  await test('22. Record grades in bulk', 'POST', '/grades/bulk', {
    assessment_id: assessmentId,
    grades: [
      { student_id: 1, score: 9.5 },
      { student_id: 2, score: 8.0 },
      { student_id: 3, score: 7.5 }
    ]
  }, tokenTeacher);

  await test('23. Get all grades', 'GET', '/grades', null, tokenTeacher);
  await test('24. Get grade by ID', 'GET', `/grades/${gradeId}`, null, tokenTeacher);
  await test('25. Get grade statistics', 'GET', `/grades/statistics?assessment_id=${assessmentId}`, null, tokenTeacher);
  await test('26. Update grade', 'PUT', `/grades/${gradeId}`, { score: 9.8 }, tokenTeacher);

  // REPORTS TESTS
  console.log('\n--- REPORTES ---');
  
  let report = await test('27. Create report', 'POST', '/reports', {
    class_id: classId,
    report_type: 'attendance_summary',
    title: 'Reporte de Asistencia',
    data: { period: '2025-11-01 to 2025-11-30', attendance_percentage: 95.5 }
  }, tokenTeacher);
  const reportId = report?.id || 1;

  await test('28. Get all reports', 'GET', '/reports', null, tokenTeacher);
  await test('29. Get report by ID', 'GET', `/reports/${reportId}`, null, tokenTeacher);
  await test('30. Update report', 'PUT', `/reports/${reportId}`, { title: 'Actualizado' }, tokenTeacher);

  // STATISTICS TESTS
  console.log('\n--- ESTADISTICAS ---');
  
  await test('31. Get entity statistics', 'GET', '/statistics/dashboard', null, tokenAdmin);
  await test('32. Get class statistics', 'GET', `/statistics/class?class_id=${classId}`, null, tokenTeacher);
  await test('33. Get student statistics', 'GET', '/statistics/student?student_id=1', null, tokenTeacher);

  // PERMISSION TESTS
  console.log('\n--- PERMISOS ---');
  
  await test('34. Student tries to create class (DEBE FALLAR)', 'POST', '/classes', {
    name: 'Clase No Permitida',
    subject_id: 1,
    section_id: 1,
    academic_year_id: yearId,
    max_students: 30,
    weeks_duration: 16,
    teachers: [1]
  }, tokenStudent);

  await test('35. Delete report', 'DELETE', `/reports/${reportId}`, null, tokenTeacher);

  // RESUMEN
  console.log('\n================================================');
  console.log('RESUMEN DE PRUEBAS');
  console.log('================================================');
  
  const successful = tests.filter(t => t.success).length;
  const failed = tests.filter(t => !t.success).length;
  const percentage = ((successful / tests.length) * 100).toFixed(2);

  console.log(`\nExitosas: ${successful}/${tests.length}`);
  console.log(`Fallidas: ${failed}/${tests.length}`);
  console.log(`Tasa de exito: ${percentage}%`);

  if (failed > 0) {
    console.log('\nErrores:');
    tests.filter(t => !t.success).forEach(t => {
      console.log(`  - ${t.name} (${t.status || 'Error'})`);
    });
  }

  console.log('\n================================================');
  console.log('PRUEBAS COMPLETADAS');
  console.log('================================================\n');
}

runTests().catch(console.error);
