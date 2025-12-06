// ===============================
// TIPOS COMPARTIDOS - ASISvOX
// ===============================

// ===============================
// ENTIDADES/INSTITUCIONES
// ===============================

export interface Entity {
  id: string;
  name: string;
  code: string;
  address?: string;
  imageUrl?: string;
  representativeName?: string;
  representativePhone?: string;
  representativeEmail?: string;
  institutionalPhone?: string;
  institutionalAddress?: string;
  institutionalEmail?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===============================
// USUARIOS
// ===============================

// Usuario Base
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin_general' | 'admin_entity' | 'teacher' | 'student';
  entityId?: string; // Para admin_entity y teachers
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Administrador General
export interface AdminGeneral extends User {
  role: 'admin_general';
  entityId?: undefined; // Admin general no pertenece a una entidad
  permissions: string[];
}

// Administrador de Entidad
export interface AdminEntity extends User {
  role: 'admin_entity';
  entityId: string; // Pertenece a una entidad
  entity?: Entity;
  maxTeachersAllowed: number;
  currentTeachersCount?: number;
  permissions: string[];
}

// Profesor
export interface Teacher extends User {
  role: 'teacher';
  entityId: string; // Pertenece a una entidad
  entity?: Entity;
  subjects: string[];
  classes: string[];
  totalStudents: number;
  lastActivity: Date;
  schedule: WeeklySchedule;
}

// Administrador (para compatibilidad)
export interface Admin extends User {
  role: 'admin_general' | 'admin_entity';
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

// ===============================
// CLASES/MATERIAS
// ===============================

// Clase/Materia
export interface Class {
  id: string;
  entityId: string;
  entity?: Entity;
  name: string;
  subject: string;
  teacherId: string;
  teacher?: Teacher;
  students: string[];
  schedule?: string;
  period?: string;
  academicYear?: string;
  classroom?: string;
  weeksDuration?: number; // Duración en semanas (1-52)
  studentCount?: number;
  averageGrade?: number;
  nextClass?: string;
  isCurrent?: boolean;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ===============================
// HORARIOS
// ===============================

// Schedule - Horario de una clase
export interface Schedule {
  id: string;
  classId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // HH:MM:SS
  endTime: string;   // HH:MM:SS
  createdAt?: Date;
  updatedAt?: Date;
}

// ===============================
// ASISTENCIA
// ===============================

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

// ===============================
// EVALUACIONES Y CALIFICACIONES
// ===============================

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

// ===============================
// REPORTES
// ===============================

// Reportes
export interface Report {
  id: string;
  entityId?: string; // Para filtrar por entidad
  type: 'attendance' | 'grades' | 'performance' | 'summary';
  title: string;
  generatedBy: string;
  generatedAt: Date;
  filters: ReportFilters;
  data: any;
  format: 'pdf' | 'excel' | 'json';
}

export interface ReportFilters {
  entityId?: string;
  classId?: string;
  studentId?: string;
  teacherId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  subject?: string;
  assessmentType?: string;
}

// ===============================
// ESTADÍSTICAS
// ===============================

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

export interface EntityStats {
  totalAdmins: number;
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  averageAttendance: number;
  averageGrades: number;
}

export interface SystemStats {
  totalEntities: number;
  totalAdminsGeneral: number;
  totalAdminsEntity: number;
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  totalAttendanceRecords: number;
  totalGrades: number;
  activeUsers: number;
}

// ===============================
// RESPUESTAS DE API
// ===============================

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

// ===============================
// AUTENTICACIÓN
// ===============================

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
  role: 'admin_general' | 'admin_entity' | 'teacher';
  entityId?: string;
  subjects?: string[];
}

// ===============================
// CONFIGURACIÓN DE VOZ
// ===============================

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

// ===============================
// NOTIFICACIONES
// ===============================

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

// ===============================
// CONFIGURACIÓN DEL SISTEMA
// ===============================

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