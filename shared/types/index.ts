// ===============================
// TIPOS COMPARTIDOS - ASISvOX
// ===============================

// Usuario Base
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'admin' | 'student';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Profesor
export interface Teacher extends User {
  role: 'teacher';
  subjects: string[];
  classes: string[];
  totalStudents: number;
  lastActivity: Date;
  schedule: WeeklySchedule;
}

// Administrador
export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

// Estudiante
export interface Student extends User {
  role: 'student';
  code: string;
  classId: string;
  grade?: number;
  attendance: AttendanceRecord[];
  grades: Grade[];
}

// Horario Semanal
export interface WeeklySchedule {
  [day: string]: ClassSession[];
}

export interface ClassSession {
  time: string;
  subject: string;
  class: string;
  classId: string;
}

// Clase/Materia
export interface Class {
  id: string;
  name: string;
  subject: string;
  teacherId: string;
  students: string[];
  schedule: string;
  period: string;
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}

// Asistencia
export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  recordedBy: string;
  recordedAt: Date;
  method: 'manual' | 'voice';
}

export interface AttendanceSession {
  id: string;
  classId: string;
  teacherId: string;
  date: Date;
  records: AttendanceRecord[];
  status: 'in_progress' | 'completed';
  createdAt: Date;
  completedAt?: Date;
}

// Evaluaciones y Calificaciones
export interface Assessment {
  id: string;
  name: string;
  type: 'exam' | 'quiz' | 'homework' | 'project' | 'participation';
  weight: number;
  maxScore: number;
  classId: string;
  teacherId: string;
  date: Date;
  description?: string;
  createdAt: Date;
}

export interface Grade {
  id: string;
  studentId: string;
  assessmentId: string;
  score: number;
  feedback?: string;
  gradedBy: string;
  gradedAt: Date;
  method: 'manual' | 'voice';
}

// Reportes
export interface Report {
  id: string;
  type: 'attendance' | 'grades' | 'performance' | 'summary';
  title: string;
  generatedBy: string;
  generatedAt: Date;
  filters: ReportFilters;
  data: any;
  format: 'pdf' | 'excel' | 'json';
}

export interface ReportFilters {
  classId?: string;
  studentId?: string;
  teacherId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  subject?: string;
  assessmentType?: string;
}

// Estadísticas
export interface ClassStats {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  averageGrade: number;
  attendanceRate: number;
  passedStudents: number;
}

export interface TeacherStats {
  totalClasses: number;
  totalStudents: number;
  weeklyHours: number;
  averageAttendance: number;
  averageGrades: number;
}

export interface SystemStats {
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  totalAttendanceRecords: number;
  totalGrades: number;
  activeUsers: number;
}

// Respuestas de API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Autenticación
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'teacher' | 'admin';
  subjects?: string[];
}

// Configuración de Voz
export interface VoiceConfig {
  language: string;
  confidence: number;
  enabled: boolean;
  commands: VoiceCommand[];
}

export interface VoiceCommand {
  command: string;
  action: string;
  parameters?: any;
}

// Notificaciones
export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

// Configuración del Sistema
export interface SystemConfig {
  id: string;
  academicYear: string;
  currentPeriod: string;
  gradeScale: {
    min: number;
    max: number;
    passingGrade: number;
  };
  attendanceThreshold: number;
  voiceRecognition: VoiceConfig;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  backup: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    retention: number;
  };
}