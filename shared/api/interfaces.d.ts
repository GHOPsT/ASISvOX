import { Entity, User, Teacher, Student, Class, AttendanceRecord, AttendanceSession, Assessment, Grade, Report, AuthCredentials, AuthResponse, RegisterData, ApiResponse, PaginatedResponse } from '../types';
export interface EntityAPI {
    getEntities(filters?: EntityFilters): Promise<PaginatedResponse<Entity>>;
    getEntityById(id: string): Promise<ApiResponse<Entity>>;
    createEntity(data: CreateEntityData): Promise<ApiResponse<Entity>>;
    updateEntity(id: string, data: Partial<Entity>): Promise<ApiResponse<Entity>>;
    deleteEntity(id: string): Promise<ApiResponse<void>>;
    activateEntity(id: string): Promise<ApiResponse<Entity>>;
    deactivateEntity(id: string): Promise<ApiResponse<Entity>>;
    getEntityStats(id: string): Promise<ApiResponse<any>>;
}
export interface EntityFilters {
    status?: 'active' | 'inactive';
    search?: string;
    page?: number;
    limit?: number;
}
export interface CreateEntityData {
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
}
export interface AuthAPI {
    login(credentials: AuthCredentials): Promise<ApiResponse<AuthResponse>>;
    register(data: RegisterData): Promise<ApiResponse<AuthResponse>>;
    logout(token: string): Promise<ApiResponse<void>>;
    refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>>;
    getCurrentUser(token: string): Promise<ApiResponse<User>>;
}
export interface UserAPI {
    getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>>;
    getUserById(id: string): Promise<ApiResponse<User>>;
    updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>>;
    deleteUser(id: string): Promise<ApiResponse<void>>;
    activateUser(id: string): Promise<ApiResponse<User>>;
    deactivateUser(id: string): Promise<ApiResponse<User>>;
}
export interface UserFilters {
    role?: 'admin_general' | 'admin_entity' | 'teacher' | 'student';
    entityId?: string;
    status?: 'active' | 'inactive';
    search?: string;
    page?: number;
    limit?: number;
}
export interface TeacherAPI {
    getTeachers(filters?: TeacherFilters): Promise<PaginatedResponse<Teacher>>;
    getTeacherById(id: string): Promise<ApiResponse<Teacher>>;
    getTeacherSchedule(id: string): Promise<ApiResponse<Teacher['schedule']>>;
    getTeacherClasses(id: string): Promise<ApiResponse<Class[]>>;
    getTeacherStudents(id: string): Promise<ApiResponse<Student[]>>;
    updateTeacherSchedule(id: string, schedule: Teacher['schedule']): Promise<ApiResponse<Teacher>>;
}
export interface TeacherFilters {
    entityId?: string;
    subject?: string;
    status?: 'active' | 'inactive';
    search?: string;
    page?: number;
    limit?: number;
}
export interface StudentAPI {
    getStudents(filters?: StudentFilters): Promise<PaginatedResponse<Student>>;
    getStudentById(id: string): Promise<ApiResponse<Student>>;
    createStudent(data: CreateStudentData): Promise<ApiResponse<Student>>;
    updateStudent(id: string, data: Partial<Student>): Promise<ApiResponse<Student>>;
    deleteStudent(id: string): Promise<ApiResponse<void>>;
    getStudentAttendance(id: string, filters?: AttendanceFilters): Promise<ApiResponse<AttendanceRecord[]>>;
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
export interface ClassAPI {
    getClasses(filters?: ClassFilters): Promise<PaginatedResponse<Class>>;
    getClassById(id: string): Promise<ApiResponse<Class>>;
    createClass(data: CreateClassData): Promise<ApiResponse<Class>>;
    updateClass(id: string, data: Partial<Class>): Promise<ApiResponse<Class>>;
    deleteClass(id: string): Promise<ApiResponse<void>>;
    getClassStudents(id: string): Promise<ApiResponse<Student[]>>;
    addStudentToClass(classId: string, studentId: string): Promise<ApiResponse<void>>;
    removeStudentFromClass(classId: string, studentId: string): Promise<ApiResponse<void>>;
}
export interface ClassFilters {
    entityId?: string;
    teacherId?: string;
    subject?: string;
    period?: string;
    academicYear?: string;
    page?: number;
    limit?: number;
}
export interface CreateClassData {
    entityId: string;
    subjectId: string;
    sectionId: string;
    teacherId?: string;
    academicYearId: string;
    classroom?: string;
}
export interface AttendanceAPI {
    getAttendanceSessions(filters?: AttendanceSessionFilters): Promise<PaginatedResponse<AttendanceSession>>;
    getAttendanceSession(id: string): Promise<ApiResponse<AttendanceSession>>;
    createAttendanceSession(data: CreateAttendanceSessionData): Promise<ApiResponse<AttendanceSession>>;
    updateAttendanceSession(id: string, data: Partial<AttendanceSession>): Promise<ApiResponse<AttendanceSession>>;
    completeAttendanceSession(id: string): Promise<ApiResponse<AttendanceSession>>;
    recordAttendance(data: RecordAttendanceData): Promise<ApiResponse<AttendanceRecord>>;
    updateAttendanceRecord(id: string, data: Partial<AttendanceRecord>): Promise<ApiResponse<AttendanceRecord>>;
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
export interface AssessmentAPI {
    getAssessments(filters?: AssessmentFilters): Promise<PaginatedResponse<Assessment>>;
    getAssessmentById(id: string): Promise<ApiResponse<Assessment>>;
    createAssessment(data: CreateAssessmentData): Promise<ApiResponse<Assessment>>;
    updateAssessment(id: string, data: Partial<Assessment>): Promise<ApiResponse<Assessment>>;
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
    getGrades(filters?: GradeFilters): Promise<PaginatedResponse<Grade>>;
    recordGrade(data: RecordGradeData): Promise<ApiResponse<Grade>>;
    updateGrade(id: string, data: Partial<Grade>): Promise<ApiResponse<Grade>>;
    deleteGrade(id: string): Promise<ApiResponse<void>>;
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
export interface ReportAPI {
    getReports(filters?: ReportFilters): Promise<PaginatedResponse<Report>>;
    generateReport(data: GenerateReportData): Promise<ApiResponse<Report>>;
    getReport(id: string): Promise<ApiResponse<Report>>;
    downloadReport(id: string, format: 'pdf' | 'excel'): Promise<Blob>;
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
export interface StatisticsAPI {
    getDashboardStats(): Promise<ApiResponse<any>>;
    getClassStats(id: string): Promise<ApiResponse<any>>;
    getTeacherStats(id: string): Promise<ApiResponse<any>>;
    getStudentStats(id: string): Promise<ApiResponse<any>>;
    getAttendanceStats(filters?: any): Promise<ApiResponse<any>>;
    getGradeStats(filters?: any): Promise<ApiResponse<any>>;
}
export interface VoiceAPI {
    processVoiceAttendance(data: VoiceAttendanceData): Promise<ApiResponse<AttendanceRecord[]>>;
    processVoiceGrading(data: VoiceGradingData): Promise<ApiResponse<Grade[]>>;
    getVoiceCommands(): Promise<ApiResponse<any>>;
    updateVoiceConfig(config: any): Promise<ApiResponse<any>>;
}
export interface VoiceAttendanceData {
    sessionId: string;
    audioData: string;
    studentNames: string[];
}
export interface VoiceGradingData {
    assessmentId: string;
    audioData: string;
    studentNames: string[];
}
//# sourceMappingURL=interfaces.d.ts.map