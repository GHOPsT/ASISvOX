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
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin_general' | 'admin_entity' | 'teacher' | 'student';
    entityId?: string;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}
export interface AdminGeneral extends User {
    role: 'admin_general';
    entityId?: undefined;
    permissions: string[];
}
export interface AdminEntity extends User {
    role: 'admin_entity';
    entityId: string;
    entity?: Entity;
    maxTeachersAllowed: number;
    currentTeachersCount?: number;
    permissions: string[];
}
export interface Teacher extends User {
    role: 'teacher';
    entityId: string;
    entity?: Entity;
    subjects: string[];
    classes: string[];
    totalStudents: number;
    lastActivity: Date;
    schedule: WeeklySchedule;
}
export interface Admin extends User {
    role: 'admin_general' | 'admin_entity';
    permissions: string[];
}
export interface Student extends User {
    role: 'student';
    code: string;
    classId: string;
    grade?: number;
    attendance: AttendanceRecord[];
    grades: Grade[];
}
export interface WeeklySchedule {
    [day: string]: ClassSession[];
}
export interface ClassSession {
    time: string;
    subject: string;
    class: string;
    classId: string;
}
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
    schedules?: Schedule[];
    period?: string;
    academicYear?: string;
    classroom?: string;
    weeksDuration?: number;
    studentCount?: number;
    averageGrade?: number;
    nextClass?: string;
    isCurrent?: boolean;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface Schedule {
    id: string;
    classId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    createdAt?: Date;
    updatedAt?: Date;
}
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
export interface Report {
    id: string;
    entityId?: string;
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
//# sourceMappingURL=index.d.ts.map