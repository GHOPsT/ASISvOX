const http = require('http');

function makeRequest(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL('http://localhost:3001' + endpoint);
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

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n=== QUICK API TEST ===\n');

  try {
    // Test 1: Health
    const health = await makeRequest('GET', '/api/health');
    console.log(`1. Health: ${health.status === 200 ? '✓' : '✗'}`);

    // Test 2: Register
    const register = await makeRequest('POST', '/api/auth/register', {
      name: 'Test User',
      email: `test${Date.now()}@test.com`,
      password: 'Test123!',
      role: 'teacher'  // ✓ Valid role
    });
    console.log(`2. Register: ${register.status < 400 ? '✓' : '✗'} (${register.status})`);
    if (register.data?.message) console.log(`   → ${register.data.message}`);

    // Test 3: Login admin from seed
    const login = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@asisvox.com',
      password: 'Admin123!'
    });
    console.log(`3. Login admin: ${login.status < 400 ? '✓' : '✗'} (${login.status})`);
    const token = login.data?.data?.token;
    if (token) console.log(`   → Token obtenido`);

    // Test 4: Get subjects
    const subjects = await makeRequest('GET', '/api/master/subjects', null, token);
    console.log(`4. Get subjects: ${subjects.status < 400 ? '✓' : '✗'} (${subjects.status})`);

    // Test 5: Create assessment
    const assessment = await makeRequest('POST', '/api/assessments', {
      class_id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Assessment',
      max_score: 100,
      description: 'Test description'
    }, token);
    console.log(`5. Create assessment: ${assessment.status < 400 ? '✓' : '✗'} (${assessment.status})`);
    if (assessment.data?.message) console.log(`   → ${assessment.data.message}`);

    console.log('\n=== TEST COMPLETED ===\n');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

runTests();
