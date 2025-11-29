# Pruebas con curl

$baseUrl = "http://localhost:3001"
$results = @()

Write-Host "`n=================================================="
Write-Host "TEST 1: Register admin_general"
Write-Host "==================================================" -ForegroundColor Yellow
$r1 = curl -s -X POST "$baseUrl/auth/register" `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@test.com","password":"Admin123!","first_name":"Admin","last_name":"Test","role":"admin_general"}'
Write-Host $r1

$admin = ($r1 | ConvertFrom-Json).data
$adminToken = $admin.token
Write-Host "Admin Token: $adminToken`n"

Write-Host "`n=================================================="
Write-Host "TEST 2: Register teacher"
Write-Host "==================================================" -ForegroundColor Yellow
$r2 = curl -s -X POST "$baseUrl/auth/register" `
  -H "Content-Type: application/json" `
  -d '{"email":"teacher@test.com","password":"Teacher123!","first_name":"Teacher","last_name":"Test","role":"teacher"}'
Write-Host $r2

$teacher = ($r2 | ConvertFrom-Json).data
$teacherToken = $teacher.token
Write-Host "Teacher Token: $teacherToken`n"

Write-Host "`n=================================================="
Write-Host "TEST 3: Register student"
Write-Host "==================================================" -ForegroundColor Yellow
$r3 = curl -s -X POST "$baseUrl/auth/register" `
  -H "Content-Type: application/json" `
  -d '{"email":"student@test.com","password":"Student123!","first_name":"Student","last_name":"Test","role":"student"}'
Write-Host $r3

$student = ($r3 | ConvertFrom-Json).data
$studentToken = $student.token
Write-Host "Student Token: $studentToken`n"

Write-Host "`n=================================================="
Write-Host "TEST 4: Get subjects (Master Data)"
Write-Host "==================================================" -ForegroundColor Yellow
$r4 = curl -s -X GET "$baseUrl/master/subjects" `
  -H "Authorization: Bearer $adminToken"
Write-Host $r4

Write-Host "`n=================================================="
Write-Host "TEST 5: Get academic years (Master Data)"
Write-Host "==================================================" -ForegroundColor Yellow
$r5 = curl -s -X GET "$baseUrl/master/academic-years" `
  -H "Authorization: Bearer $adminToken"
Write-Host $r5

$academicYears = ($r5 | ConvertFrom-Json).data
$yearId = if ($academicYears -and $academicYears.Count -gt 0) { $academicYears[0].id } else { 1 }
Write-Host "Year ID: $yearId`n"

Write-Host "`n=================================================="
Write-Host "TEST 6: Get sections (Master Data)"
Write-Host "==================================================" -ForegroundColor Yellow
$r6 = curl -s -X GET "$baseUrl/master/sections" `
  -H "Authorization: Bearer $adminToken"
Write-Host $r6

Write-Host "`n=================================================="
Write-Host "TEST 7: Get grades (Master Data)"
Write-Host "==================================================" -ForegroundColor Yellow
$r7 = curl -s -X GET "$baseUrl/master/grades" `
  -H "Authorization: Bearer $adminToken"
Write-Host $r7

Write-Host "`n=================================================="
Write-Host "TEST 8: Create class with weeks_duration"
Write-Host "==================================================" -ForegroundColor Yellow
$r8 = curl -s -X POST "$baseUrl/classes" `
  -H "Authorization: Bearer $adminToken" `
  -H "Content-Type: application/json" `
  -d '{"name":"Matematicas 1","subject_id":1,"section_id":1,"academic_year_id":'$yearId',"max_students":30,"weeks_duration":16,"teachers":[1]}'
Write-Host $r8

$class = ($r8 | ConvertFrom-Json).data
$classId = if ($class) { $class.id } else { 1 }
Write-Host "Class ID: $classId`n"

Write-Host "`n=================================================="
Write-Host "TEST 9: Get all classes"
Write-Host "==================================================" -ForegroundColor Yellow
$r9 = curl -s -X GET "$baseUrl/classes" `
  -H "Authorization: Bearer $adminToken"
Write-Host $r9

Write-Host "`n=================================================="
Write-Host "TEST 10: Create attendance session"
Write-Host "==================================================" -ForegroundColor Yellow
$r10 = curl -s -X POST "$baseUrl/attendance/sessions" `
  -H "Authorization: Bearer $teacherToken" `
  -H "Content-Type: application/json" `
  -d '{"class_id":'$classId',"session_date":"2025-11-29","start_time":"09:00:00","end_time":"10:00:00"}'
Write-Host $r10

$session = ($r10 | ConvertFrom-Json).data
$sessionId = if ($session) { $session.id } else { 1 }
Write-Host "Session ID: $sessionId`n"

Write-Host "`n=================================================="
Write-Host "TEST 11: Record attendance"
Write-Host "==================================================" -ForegroundColor Yellow
$r11 = curl -s -X POST "$baseUrl/attendance/records" `
  -H "Authorization: Bearer $teacherToken" `
  -H "Content-Type: application/json" `
  -d '{"session_id":'$sessionId',"student_id":1,"status":"present"}'
Write-Host $r11

Write-Host "`n=================================================="
Write-Host "TEST 12: Get attendance records"
Write-Host "==================================================" -ForegroundColor Yellow
$r12 = curl -s -X GET "$baseUrl/attendance/records?session_id=$sessionId" `
  -H "Authorization: Bearer $teacherToken"
Write-Host $r12

Write-Host "`n=================================================="
Write-Host "TEST 13: Get assessment types"
Write-Host "==================================================" -ForegroundColor Yellow
$r13 = curl -s -X GET "$baseUrl/assessments/types" `
  -H "Authorization: Bearer $teacherToken"
Write-Host $r13

Write-Host "`n=================================================="
Write-Host "TEST 14: Create assessment"
Write-Host "==================================================" -ForegroundColor Yellow
$r14 = curl -s -X POST "$baseUrl/assessments" `
  -H "Authorization: Bearer $teacherToken" `
  -H "Content-Type: application/json" `
  -d '{"class_id":'$classId',"assessment_type_id":1,"name":"Quiz 1","description":"Quiz sobre fracciones","total_points":10,"scheduled_date":"2025-11-30"}'
Write-Host $r14

$assessment = ($r14 | ConvertFrom-Json).data
$assessmentId = if ($assessment) { $assessment.id } else { 1 }
Write-Host "Assessment ID: $assessmentId`n"

Write-Host "`n=================================================="
Write-Host "TEST 15: Record single grade"
Write-Host "==================================================" -ForegroundColor Yellow
$r15 = curl -s -X POST "$baseUrl/grades" `
  -H "Authorization: Bearer $teacherToken" `
  -H "Content-Type: application/json" `
  -d '{"assessment_id":'$assessmentId',"student_id":1,"score":9.5,"comments":"Excelente desempenio"}'
Write-Host $r15

Write-Host "`n=================================================="
Write-Host "TEST 16: Record grades in bulk"
Write-Host "==================================================" -ForegroundColor Yellow
$r16 = curl -s -X POST "$baseUrl/grades/bulk" `
  -H "Authorization: Bearer $teacherToken" `
  -H "Content-Type: application/json" `
  -d '{"assessment_id":'$assessmentId',"grades":[{"student_id":1,"score":9.5},{"student_id":2,"score":8.0},{"student_id":3,"score":7.5}]}'
Write-Host $r16

Write-Host "`n=================================================="
Write-Host "TEST 17: Get all grades"
Write-Host "==================================================" -ForegroundColor Yellow
$r17 = curl -s -X GET "$baseUrl/grades" `
  -H "Authorization: Bearer $teacherToken"
Write-Host $r17

Write-Host "`n=================================================="
Write-Host "TEST 18: Get grade statistics"
Write-Host "==================================================" -ForegroundColor Yellow
$r18 = curl -s -X GET "$baseUrl/grades/statistics?assessment_id=$assessmentId" `
  -H "Authorization: Bearer $teacherToken"
Write-Host $r18

Write-Host "`n=================================================="
Write-Host "TEST 19: Create report"
Write-Host "==================================================" -ForegroundColor Yellow
$r19 = curl -s -X POST "$baseUrl/reports" `
  -H "Authorization: Bearer $teacherToken" `
  -H "Content-Type: application/json" `
  -d '{"class_id":'$classId',"report_type":"attendance_summary","title":"Reporte de Asistencia","data":{"period":"2025-11-01 to 2025-11-30","attendance_percentage":95.5}}'
Write-Host $r19

$report = ($r19 | ConvertFrom-Json).data
$reportId = if ($report) { $report.id } else { 1 }
Write-Host "Report ID: $reportId`n"

Write-Host "`n=================================================="
Write-Host "TEST 20: Get all reports"
Write-Host "==================================================" -ForegroundColor Yellow
$r20 = curl -s -X GET "$baseUrl/reports" `
  -H "Authorization: Bearer $teacherToken"
Write-Host $r20

Write-Host "`n=================================================="
Write-Host "TEST 21: Get entity statistics (admin)"
Write-Host "==================================================" -ForegroundColor Yellow
$r21 = curl -s -X GET "$baseUrl/statistics/dashboard" `
  -H "Authorization: Bearer $adminToken"
Write-Host $r21

Write-Host "`n=================================================="
Write-Host "TEST 22: Get class statistics"
Write-Host "==================================================" -ForegroundColor Yellow
$r22 = curl -s -X GET "$baseUrl/statistics/class?class_id=$classId" `
  -H "Authorization: Bearer $teacherToken"
Write-Host $r22

Write-Host "`n=================================================="
Write-Host "TEST 23: Get student statistics"
Write-Host "==================================================" -ForegroundColor Yellow
$r23 = curl -s -X GET "$baseUrl/statistics/student?student_id=1" `
  -H "Authorization: Bearer $teacherToken"
Write-Host $r23

Write-Host "`n=================================================="
Write-Host "TEST 24: Student tries to create class (DEBE FALLAR)"
Write-Host "==================================================" -ForegroundColor Red
$r24 = curl -s -X POST "$baseUrl/classes" `
  -H "Authorization: Bearer $studentToken" `
  -H "Content-Type: application/json" `
  -d '{"name":"Clase No Permitida","subject_id":1,"section_id":1,"academic_year_id":'$yearId',"max_students":30,"weeks_duration":16,"teachers":[1]}'
Write-Host $r24

Write-Host "`n=================================================="
Write-Host "TEST 25: Delete report"
Write-Host "==================================================" -ForegroundColor Yellow
$r25 = curl -s -X DELETE "$baseUrl/reports/$reportId" `
  -H "Authorization: Bearer $teacherToken"
Write-Host $r25

Write-Host "`n=================================================="
Write-Host "PRUEBAS COMPLETADAS"
Write-Host "==================================================" -ForegroundColor Green
