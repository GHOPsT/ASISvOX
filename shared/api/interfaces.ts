// ===============================
// INTERFACES DE API - ASISvOX
// ===============================

import { 
  User, 
  Teacher, 
  Student, 
  Class, 
  AttendanceRecord, 
  AttendanceSession,
  Assessment, 
  Grade, 
  Report,
  AuthCredentials,
  AuthResponse,
  RegisterData,
  ApiResponse,
  PaginatedResponse
} from '../types';

// ===============================
// AUTH ENDPOINTS
// ===============================

export interface AuthAPI {
  // POST /api/auth/login
  login(credentials: AuthCredentials): Promise<ApiResponse<AuthResponse>>;
  
  // POST /api/auth/register
  register(data: RegisterData): Promise<ApiResponse<AuthResponse>>;
  
  // POST /api/auth/logout
  logout(token: string): Promise<ApiResponse<void>>;
  
  // POST /api/auth/refresh
  refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>>;
  
  // GET /api/auth/me
  getCurrentUser(token: string): Promise<ApiResponse<User>>;
}

// ===============================
// USER MANAGEMENT
// ===============================

export interface UserAPI {
  // GET /api/users
  getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>>;
  
  // GET /api/users/:id
  getUserById(id: string): Promise<ApiResponse<User>>;
  
  // PUT /api/users/:id
  updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>>;
  
  // DELETE /api/users/:id
  deleteUser(id: string): Promise<ApiResponse<void>>;
  
  // POST /api/users/:id/activate
  activateUser(id: string): Promise<ApiResponse<User>>;
  
  // POST /api/users/:id/deactivate
  deactivateUser(id: string): Promise<ApiResponse<User>>;
}

export interface UserFilters {
  role?: 'teacher' | 'admin' | 'student';
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  limit?: number;
}

// ===============================
// TEACHER MANAGEMENT
// ===============================

export interface TeacherAPI {
  // GET /api/teachers
  getTeachers(filters?: TeacherFilters): Promise<PaginatedResponse<Teacher>>;
  
  // GET /api/teachers/:id
  getTeacherById(id: string): Promise<ApiResponse<Teacher>>;
  
  // GET /api/teachers/:id/schedule
  getTeacherSchedule(id: string): Promise<ApiResponse<Teacher['schedule']>>;
  
  // GET /api/teachers/:id/classes
  getTeacherClasses(id: string): Promise<ApiResponse<Class[]>>;
  
  // GET /api/teachers/:id/students
  getTeacherStudents(id: string): Promise<ApiResponse<Student[]>>;
  
  // PUT /api/teachers/:id/schedule
  updateTeacherSchedule(id: string, schedule: Teacher['schedule']): Promise<ApiResponse<Teacher>>;
}

export interface TeacherFilters {
  subject?: string;
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  limit?: number;
}

// ===============================
// STUDENT MANAGEMENT
// ===============================

export interface StudentAPI {
  // GET /api/students
  getStudents(filters?: StudentFilters): Promise<PaginatedResponse<Student>>;
  
  // GET /api/students/:id
  getStudentById(id: string): Promise<ApiResponse<Student>>;
  
  // POST /api/students
  createStudent(data: CreateStudentData): Promise<ApiResponse<Student>>;
  
  // PUT /api/students/:id
  updateStudent(id: string, data: Partial<Student>): Promise<ApiResponse<Student>>;
  
  // DELETE /api/students/:id
  deleteStudent(id: string): Promise<ApiResponse<void>>;
  
  // GET /api/students/:id/attendance
  getStudentAttendance(id: string, filters?: AttendanceFilters): Promise<ApiResponse<AttendanceRecord[]>>;
  
  // GET /api/students/:id/grades
  getStudentGrades(id: string, filters?: GradeFilters): Promise<ApiResponse<Grade[]>>;
}

export interface StudentFilters {
  classId?: string;
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateStudentData {
  name: string;
  email: string;
  code: string;
  classId: string;
}

// ===============================
// CLASS MANAGEMENT
// ===============================

export interface ClassAPI {
  // GET /api/classes
  getClasses(filters?: ClassFilters): Promise<PaginatedResponse<Class>>;
  
  // GET /api/classes/:id
  getClassById(id: string): Promise<ApiResponse<Class>>;
  
  // POST /api/classes
  createClass(data: CreateClassData): Promise<ApiResponse<Class>>;
  
  // PUT /api/classes/:id
  updateClass(id: string, data: Partial<Class>): Promise<ApiResponse<Class>>;
  
  // DELETE /api/classes/:id
  deleteClass(id: string): Promise<ApiResponse<void>>;
  
  // GET /api/classes/:id/students
  getClassStudents(id: string): Promise<ApiResponse<Student[]>>;
  
  // POST /api/classes/:id/students
  addStudentToClass(classId: string, studentId: string): Promise<ApiResponse<void>>;
  
  // DELETE /api/classes/:id/students/:studentId
  removeStudentFromClass(classId: string, studentId: string): Promise<ApiResponse<void>>;
}

export interface ClassFilters {
  teacherId?: string;
  subject?: string;
  period?: string;
  academicYear?: string;
  page?: number;
  limit?: number;
}

export interface CreateClassData {
  name: string;
  subject: string;
  teacherId: string;
  schedule: string;
  period: string;
  academicYear: string;
}

// ===============================
// ATTENDANCE MANAGEMENT
// ===============================

export interface AttendanceAPI {
  // GET /api/attendance/sessions
  getAttendanceSessions(filters?: AttendanceSessionFilters): Promise<PaginatedResponse<AttendanceSession>>;
  
  // GET /api/attendance/sessions/:id
  getAttendanceSession(id: string): Promise<ApiResponse<AttendanceSession>>;
  
  // POST /api/attendance/sessions
  createAttendanceSession(data: CreateAttendanceSessionData): Promise<ApiResponse<AttendanceSession>>;
  
  // PUT /api/attendance/sessions/:id
  updateAttendanceSession(id: string, data: Partial<AttendanceSession>): Promise<ApiResponse<AttendanceSession>>;
  
  // POST /api/attendance/sessions/:id/complete
  completeAttendanceSession(id: string): Promise<ApiResponse<AttendanceSession>>;
  
  // POST /api/attendance/records
  recordAttendance(data: RecordAttendanceData): Promise<ApiResponse<AttendanceRecord>>;
  
  // PUT /api/attendance/records/:id
  updateAttendanceRecord(id: string, data: Partial<AttendanceRecord>): Promise<ApiResponse<AttendanceRecord>>;
  
  // GET /api/attendance/records
  getAttendanceRecords(filters?: AttendanceFilters): Promise<PaginatedResponse<AttendanceRecord>>;
}

export interface AttendanceSessionFilters {
  classId?: string;
  teacherId?: string;
  date?: string;
  status?: 'in_progress' | 'completed';
  page?: number;
  limit?: number;
}

export interface CreateAttendanceSessionData {
  classId: string;
  teacherId: string;
  date: Date;
}

export interface RecordAttendanceData {
  sessionId: string;
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  method: 'manual' | 'voice';
}

export interface AttendanceFilters {
  studentId?: string;
  classId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: 'present' | 'absent' | 'late' | 'excused';
  page?: number;
  limit?: number;
}

// ===============================
// ASSESSMENT & GRADING
// ===============================

export interface AssessmentAPI {
  // GET /api/assessments
  getAssessments(filters?: AssessmentFilters): Promise<PaginatedResponse<Assessment>>;
  
  // GET /api/assessments/:id
  getAssessmentById(id: string): Promise<ApiResponse<Assessment>>;
  
  // POST /api/assessments
  createAssessment(data: CreateAssessmentData): Promise<ApiResponse<Assessment>>;
  
  // PUT /api/assessments/:id
  updateAssessment(id: string, data: Partial<Assessment>): Promise<ApiResponse<Assessment>>;
  
  // DELETE /api/assessments/:id
  deleteAssessment(id: string): Promise<ApiResponse<void>>;
}

export interface AssessmentFilters {
  classId?: string;
  teacherId?: string;
  type?: Assessment['type'];
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface CreateAssessmentData {
  name: string;
  type: Assessment['type'];
  weight: number;
  maxScore: number;
  classId: string;
  date: Date;
  description?: string;
}

export interface GradingAPI {
  // GET /api/grades
  getGrades(filters?: GradeFilters): Promise<PaginatedResponse<Grade>>;
  
  // POST /api/grades
  recordGrade(data: RecordGradeData): Promise<ApiResponse<Grade>>;
  
  // PUT /api/grades/:id
  updateGrade(id: string, data: Partial<Grade>): Promise<ApiResponse<Grade>>;
  
  // DELETE /api/grades/:id
  deleteGrade(id: string): Promise<ApiResponse<void>>;
  
  // POST /api/grades/bulk
  recordGradesBulk(data: RecordGradeData[]): Promise<ApiResponse<Grade[]>>;
}

export interface GradeFilters {
  studentId?: string;
  assessmentId?: string;
  classId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface RecordGradeData {
  studentId: string;
  assessmentId: string;
  score: number;
  feedback?: string;
  method: 'manual' | 'voice';
}

// ===============================
// REPORTS
// ===============================

export interface ReportAPI {
  // GET /api/reports
  getReports(filters?: ReportFilters): Promise<PaginatedResponse<Report>>;
  
  // POST /api/reports/generate
  generateReport(data: GenerateReportData): Promise<ApiResponse<Report>>;
  
  // GET /api/reports/:id
  getReport(id: string): Promise<ApiResponse<Report>>;
  
  // GET /api/reports/:id/download
  downloadReport(id: string, format: 'pdf' | 'excel'): Promise<Blob>;
  
  // DELETE /api/reports/:id
  deleteReport(id: string): Promise<ApiResponse<void>>;
}

export interface ReportFilters {
  type?: Report['type'];
  generatedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface GenerateReportData {
  type: Report['type'];
  title: string;
  filters: Report['filters'];
  format: 'pdf' | 'excel' | 'json';
}

// ===============================
// STATISTICS
// ===============================

export interface StatisticsAPI {
  // GET /api/statistics/dashboard
  getDashboardStats(): Promise<ApiResponse<any>>;
  
  // GET /api/statistics/class/:id
  getClassStats(id: string): Promise<ApiResponse<any>>;
  
  // GET /api/statistics/teacher/:id
  getTeacherStats(id: string): Promise<ApiResponse<any>>;
  
  // GET /api/statistics/student/:id
  getStudentStats(id: string): Promise<ApiResponse<any>>;
  
  // GET /api/statistics/attendance
  getAttendanceStats(filters?: any): Promise<ApiResponse<any>>;
  
  // GET /api/statistics/grades
  getGradeStats(filters?: any): Promise<ApiResponse<any>>;
}

// ===============================
// VOICE RECOGNITION
// ===============================

export interface VoiceAPI {
  // POST /api/voice/process-attendance
  processVoiceAttendance(data: VoiceAttendanceData): Promise<ApiResponse<AttendanceRecord[]>>;
  
  // POST /api/voice/process-grading
  processVoiceGrading(data: VoiceGradingData): Promise<ApiResponse<Grade[]>>;
  
  // GET /api/voice/commands
  getVoiceCommands(): Promise<ApiResponse<any>>;
  
  // PUT /api/voice/config
  updateVoiceConfig(config: any): Promise<ApiResponse<any>>;
}

export interface VoiceAttendanceData {
  sessionId: string;
  audioData: string; // Base64 encoded audio
  studentNames: string[];
}

export interface VoiceGradingData {
  assessmentId: string;
  audioData: string; // Base64 encoded audio
  studentNames: string[];
}