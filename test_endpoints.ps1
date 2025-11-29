# Script de Pruebas Completas de Endpoints
# Espera 2 segundos entre requests para evitar problemas

$baseUrl = "http://localhost:3001"
$tokens = @{}
$results = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Token = $null
    )
    
    $url = "$baseUrl$Endpoint"
    $headers = @{"Content-Type" = "application/json"}
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $params = @{
            Uri = $url
            Method = $Method
            Headers = $headers
            SkipHttpErrorCheck = $true
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-WebRequest @params
        $content = $response.Content | ConvertFrom-Json
        
        Write-Host "`n✅ $Name (HTTP $($response.StatusCode))" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Cyan
        $content | ConvertTo-Json | Write-Host
        
        return @{
            Name = $Name
            Status = $response.StatusCode
            Success = $response.StatusCode -lt 400
            Data = $content
        }
    }
    catch {
        Write-Host "`n❌ $Name - Error: $_" -ForegroundColor Red
        return @{
            Name = $Name
            Success = $false
            Error = $_.Exception.Message
        }
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host "=" * 80
Write-Host "🚀 INICIANDO PRUEBAS DE ENDPOINTS" -ForegroundColor Yellow
Write-Host "=" * 80

# ============= AUTH TESTS =============
Write-Host "`n📝 PRUEBAS DE AUTENTICACION" -ForegroundColor Magenta

# Test 1: Register admin
$r1 = Test-Endpoint -Name "Test 1: Register admin_general" -Method POST -Endpoint "/auth/register" -Body @{
    email = "admin@test.com"
    password = "Admin123!"
    first_name = "Admin"
    last_name = "Test"
    role = "admin_general"
}
$results += $r1

# Test 2: Register teacher independiente
$r2 = Test-Endpoint -Name "Test 2: Register teacher independiente" -Method POST -Endpoint "/auth/register" -Body @{
    email = "teacher@test.com"
    password = "Teacher123!"
    first_name = "Teacher"
    last_name = "Test"
    role = "teacher"
}
$results += $r2

# Test 3: Register teacher con entity
$r3 = Test-Endpoint -Name "Test 3: Register teacher con entity_id=1" -Method POST -Endpoint "/auth/register" -Body @{
    email = "teacher_entity@test.com"
    password = "Teacher123!"
    first_name = "Teacher"
    last_name = "Entity"
    role = "teacher"
    entity_id = 1
}
$results += $r3

# Test 4: Register student
$r4 = Test-Endpoint -Name "Test 4: Register student" -Method POST -Endpoint "/auth/register" -Body @{
    email = "student@test.com"
    password = "Student123!"
    first_name = "Student"
    last_name = "Test"
    role = "student"
}
$results += $r4

# Test 5: Register admin_entity
$r5 = Test-Endpoint -Name "Test 5: Register admin_entity" -Method POST -Endpoint "/auth/register" -Body @{
    email = "admin_entity@test.com"
    password = "AdminEntity123!"
    first_name = "Admin"
    last_name = "Entity"
    role = "admin_entity"
    entity_id = 1
}
$results += $r5

# Test 6: Login admin
$r6 = Test-Endpoint -Name "Test 6: Login admin" -Method POST -Endpoint "/auth/login" -Body @{
    email = "admin@test.com"
    password = "Admin123!"
}
$results += $r6
if ($r6.Success) { $tokens["admin"] = $r6.Data.token }

# Test 7: Login teacher
$r7 = Test-Endpoint -Name "Test 7: Login teacher" -Method POST -Endpoint "/auth/login" -Body @{
    email = "teacher@test.com"
    password = "Teacher123!"
}
$results += $r7
if ($r7.Success) { $tokens["teacher"] = $r7.Data.token }

# Test 8: Login student
$r8 = Test-Endpoint -Name "Test 8: Login student" -Method POST -Endpoint "/auth/login" -Body @{
    email = "student@test.com"
    password = "Student123!"
}
$results += $r8
if ($r8.Success) { $tokens["student"] = $r8.Data.token }

# Test 9: Login admin_entity
$r9 = Test-Endpoint -Name "Test 9: Login admin_entity" -Method POST -Endpoint "/auth/login" -Body @{
    email = "admin_entity@test.com"
    password = "AdminEntity123!"
}
$results += $r9
if ($r9.Success) { $tokens["admin_entity"] = $r9.Data.token }

Write-Host "`n📦 Tokens obtenidos: $($tokens.Count) tokens activos" -ForegroundColor Yellow

# ============= MASTER DATA TESTS =============
Write-Host "`n📊 PRUEBAS DE DATOS MAESTROS" -ForegroundColor Magenta

# Test 10: Get subjects
$r10 = Test-Endpoint -Name "Test 10: Get subjects" -Method GET -Endpoint "/master/subjects" -Token $tokens["admin"]
$results += $r10

# Test 11: Get sections
$r11 = Test-Endpoint -Name "Test 11: Get sections" -Method GET -Endpoint "/master/sections" -Token $tokens["admin"]
$results += $r11

# Test 12: Get academic years
$r12 = Test-Endpoint -Name "Test 12: Get academic years" -Method GET -Endpoint "/master/academic-years" -Token $tokens["admin"]
$results += $r12

# Test 13: Get grades
$r13 = Test-Endpoint -Name "Test 13: Get grades" -Method GET -Endpoint "/master/grades" -Token $tokens["admin"]
$results += $r13

# ============= CLASS TESTS =============
Write-Host "`n🏫 PRUEBAS DE CLASES" -ForegroundColor Magenta

# Test 14: Create class
$r14 = Test-Endpoint -Name "Test 14: Create class con weeks_duration" -Method POST -Endpoint "/classes" -Token $tokens["admin"] -Body @{
    name = "Matemáticas 1"
    subject_id = 1
    section_id = 1
    academic_year_id = 1
    max_students = 30
    weeks_duration = 16
    teachers = @(1)
}
$results += $r14
$classId = if ($r14.Success) { $r14.Data.id } else { 1 }

# Test 15: Get all classes
$r15 = Test-Endpoint -Name "Test 15: Get all classes" -Method GET -Endpoint "/classes" -Token $tokens["admin"]
$results += $r15

# Test 16: Get class by ID
$r16 = Test-Endpoint -Name "Test 16: Get class by ID" -Method GET -Endpoint "/classes/$classId" -Token $tokens["admin"]
$results += $r16

# ============= ATTENDANCE TESTS =============
Write-Host "`n👥 PRUEBAS DE ASISTENCIA" -ForegroundColor Magenta

# Test 17: Create attendance session
$r17 = Test-Endpoint -Name "Test 17: Create attendance session" -Method POST -Endpoint "/attendance/sessions" -Token $tokens["teacher"] -Body @{
    class_id = $classId
    session_date = "2025-11-29"
    start_time = "09:00:00"
    end_time = "10:00:00"
}
$results += $r17
$sessionId = if ($r17.Success) { $r17.Data.id } else { 1 }

# Test 18: Get attendance sessions
$r18 = Test-Endpoint -Name "Test 18: Get attendance sessions" -Method GET -Endpoint "/attendance/sessions?class_id=$classId" -Token $tokens["teacher"]
$results += $r18

# Test 19: Record attendance
$r19 = Test-Endpoint -Name "Test 19: Record attendance" -Method POST -Endpoint "/attendance/records" -Token $tokens["teacher"] -Body @{
    session_id = $sessionId
    student_id = 1
    status = "present"
}
$results += $r19
$recordId = if ($r19.Success) { $r19.Data.id } else { 1 }

# Test 20: Get attendance records
$r20 = Test-Endpoint -Name "Test 20: Get attendance records" -Method GET -Endpoint "/attendance/records?session_id=$sessionId" -Token $tokens["teacher"]
$results += $r20

# Test 21: Update attendance record
$r21 = Test-Endpoint -Name "Test 21: Update attendance record" -Method PUT -Endpoint "/attendance/records/$recordId" -Token $tokens["teacher"] -Body @{
    status = "late"
}
$results += $r21

# ============= ASSESSMENT TESTS =============
Write-Host "`n📋 PRUEBAS DE EVALUACIONES" -ForegroundColor Magenta

# Test 22: Get assessment types
$r22 = Test-Endpoint -Name "Test 22: Get assessment types" -Method GET -Endpoint "/assessments/types" -Token $tokens["teacher"]
$results += $r22

# Test 23: Create assessment
$r23 = Test-Endpoint -Name "Test 23: Create assessment" -Method POST -Endpoint "/assessments" -Token $tokens["teacher"] -Body @{
    class_id = $classId
    assessment_type_id = 1
    name = "Quiz 1"
    description = "Quiz sobre fracciones"
    total_points = 10
    scheduled_date = "2025-11-30"
}
$results += $r23
$assessmentId = if ($r23.Success) { $r23.Data.id } else { 1 }

# Test 24: Get assessments
$r24 = Test-Endpoint -Name "Test 24: Get assessments" -Method GET -Endpoint "/assessments?class_id=$classId" -Token $tokens["teacher"]
$results += $r24

# Test 25: Get assessment by ID
$r25 = Test-Endpoint -Name "Test 25: Get assessment by ID" -Method GET -Endpoint "/assessments/$assessmentId" -Token $tokens["teacher"]
$results += $r25

# Test 26: Update assessment
$r26 = Test-Endpoint -Name "Test 26: Update assessment" -Method PUT -Endpoint "/assessments/$assessmentId" -Token $tokens["teacher"] -Body @{
    name = "Quiz 1 - Actualizado"
    description = "Quiz sobre fracciones actualizado"
}
$results += $r26

# ============= GRADING TESTS =============
Write-Host "`n📝 PRUEBAS DE CALIFICACIONES" -ForegroundColor Magenta

# Test 27: Record single grade
$r27 = Test-Endpoint -Name "Test 27: Record single grade" -Method POST -Endpoint "/grades" -Token $tokens["teacher"] -Body @{
    assessment_id = $assessmentId
    student_id = 1
    score = 9.5
    comments = "Excelente desempeño"
}
$results += $r27
$gradeId = if ($r27.Success) { $r27.Data.id } else { 1 }

# Test 28: Record grades in bulk
$r28 = Test-Endpoint -Name "Test 28: Record grades in bulk" -Method POST -Endpoint "/grades/bulk" -Token $tokens["teacher"] -Body @{
    assessment_id = $assessmentId
    grades = @(
        @{student_id = 1; score = 9.5},
        @{student_id = 2; score = 8.0},
        @{student_id = 3; score = 7.5}
    )
}
$results += $r28

# Test 29: Get all grades
$r29 = Test-Endpoint -Name "Test 29: Get all grades" -Method GET -Endpoint "/grades" -Token $tokens["teacher"]
$results += $r29

# Test 30: Get grade by ID
$r30 = Test-Endpoint -Name "Test 30: Get grade by ID" -Method GET -Endpoint "/grades/$gradeId" -Token $tokens["teacher"]
$results += $r30

# Test 31: Get grade statistics
$r31 = Test-Endpoint -Name "Test 31: Get grade statistics" -Method GET -Endpoint "/grades/statistics?assessment_id=$assessmentId" -Token $tokens["teacher"]
$results += $r31

# Test 32: Update grade
$r32 = Test-Endpoint -Name "Test 32: Update grade" -Method PUT -Endpoint "/grades/$gradeId" -Token $tokens["teacher"] -Body @{
    score = 9.8
    comments = "Corrección aplicada"
}
$results += $r32

# ============= REPORTS TESTS =============
Write-Host "`n📄 PRUEBAS DE REPORTES" -ForegroundColor Magenta

# Test 33: Create report
$r33 = Test-Endpoint -Name "Test 33: Create report" -Method POST -Endpoint "/reports" -Token $tokens["teacher"] -Body @{
    class_id = $classId
    report_type = "attendance_summary"
    title = "Reporte de Asistencia"
    data = @{period = "2025-11-01 to 2025-11-30"; attendance_percentage = 95.5}
}
$results += $r33
$reportId = if ($r33.Success) { $r33.Data.id } else { 1 }

# Test 34: Get all reports
$r34 = Test-Endpoint -Name "Test 34: Get all reports" -Method GET -Endpoint "/reports" -Token $tokens["teacher"]
$results += $r34

# Test 35: Get report by ID
$r35 = Test-Endpoint -Name "Test 35: Get report by ID" -Method GET -Endpoint "/reports/$reportId" -Token $tokens["teacher"]
$results += $r35

# Test 36: Update report
$r36 = Test-Endpoint -Name "Test 36: Update report" -Method PUT -Endpoint "/reports/$reportId" -Token $tokens["teacher"] -Body @{
    title = "Reporte de Asistencia - Actualizado"
}
$results += $r36

# ============= STATISTICS TESTS =============
Write-Host "`n📊 PRUEBAS DE ESTADÍSTICAS" -ForegroundColor Magenta

# Test 37: Get entity statistics (admin)
$r37 = Test-Endpoint -Name "Test 37: Get entity statistics (admin)" -Method GET -Endpoint "/statistics/dashboard" -Token $tokens["admin"]
$results += $r37

# Test 38: Get class statistics
$r38 = Test-Endpoint -Name "Test 38: Get class statistics" -Method GET -Endpoint "/statistics/class?class_id=$classId" -Token $tokens["teacher"]
$results += $r38

# Test 39: Get student statistics
$r39 = Test-Endpoint -Name "Test 39: Get student statistics" -Method GET -Endpoint "/statistics/student?student_id=1" -Token $tokens["teacher"]
$results += $r39

# ============= PERMISSION TESTS =============
Write-Host "`n🔐 PRUEBAS DE PERMISOS" -ForegroundColor Magenta

# Test 40: Student tries to create class (should fail)
$r40 = Test-Endpoint -Name "Test 40: Student tries to create class (DEBE FALLAR)" -Method POST -Endpoint "/classes" -Token $tokens["student"] -Body @{
    name = "Clase No Permitida"
    subject_id = 1
    section_id = 1
    academic_year_id = 1
    max_students = 30
    weeks_duration = 16
    teachers = @(1)
}
$results += $r40

# Test 41: Delete report
$r41 = Test-Endpoint -Name "Test 41: Delete report" -Method DELETE -Endpoint "/reports/$reportId" -Token $tokens["teacher"]
$results += $r41

# ============= RESUMEN FINAL =============
Write-Host "`n" 
Write-Host "=" * 80
Write-Host "📊 RESUMEN DE PRUEBAS" -ForegroundColor Yellow
Write-Host "=" * 80

$successCount = ($results | Where-Object { $_.Success } | Measure-Object).Count
$failCount = ($results | Where-Object { !$_.Success } | Measure-Object).Count
$totalCount = $results.Count

Write-Host "`n✅ Exitosas: $successCount/$totalCount"
Write-Host "❌ Fallidas: $failCount/$totalCount"
Write-Host "`nTasa de éxito: $([math]::Round(($successCount/$totalCount)*100, 2))%"

Write-Host "`n📋 Detalles de fallos:" -ForegroundColor Red
$results | Where-Object { !$_.Success } | ForEach-Object {
    Write-Host "  - $($_.Name): $($_.Error)"
}

Write-Host "`n" 
Write-Host "=" * 80
Write-Host "✨ PRUEBAS COMPLETADAS" -ForegroundColor Green
Write-Host "=" * 80
