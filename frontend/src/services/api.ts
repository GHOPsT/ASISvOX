// ===============================
// CLIENTE API - FRONTEND
// ===============================

import { 
  AuthAPI,
  UserAPI,
  TeacherAPI,
  StudentAPI,
  ClassAPI,
  AttendanceAPI,
  AssessmentAPI,
  GradingAPI,
  ReportAPI,
  StatisticsAPI,
  VoiceAPI
} from '../../../shared/api/interfaces';

import {
  ApiResponse,
  PaginatedResponse,
  AuthCredentials,
  AuthResponse,
  RegisterData,
  User,
  Teacher,
  Student,
  Class,
  AttendanceSession,
  AttendanceRecord,
  Assessment,
  Grade,
  Report
} from '../../../shared/types';

// Configuración base de la API
const API_BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Recuperar token del localStorage si existe
    this.token = localStorage.getItem('auth_token');
  }

  // Configurar token de autenticación
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Limpiar token
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Método base para hacer peticiones HTTP
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Métodos HTTP específicos
  private get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  private post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ===============================
  // AUTH API
  // ===============================
  
  auth: AuthAPI = {
    login: async (credentials: AuthCredentials): Promise<ApiResponse<AuthResponse>> => {
      const response = await this.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      if (response.success && response.data) {
        this.setToken(response.data.token);
      }
      return response;
    },

    register: async (data: RegisterData): Promise<ApiResponse<AuthResponse>> => {
      const response = await this.post<ApiResponse<AuthResponse>>('/auth/register', data);
      if (response.success && response.data) {
        this.setToken(response.data.token);
      }
      return response;
    },

    logout: async (token: string): Promise<ApiResponse<void>> => {
      const response = await this.post<ApiResponse<void>>('/auth/logout', { token });
      this.clearToken();
      return response;
    },

    refreshToken: async (refreshToken: string): Promise<ApiResponse<AuthResponse>> => {
      const response = await this.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken });
      if (response.success && response.data) {
        this.setToken(response.data.token);
      }
      return response;
    },

    getCurrentUser: async (token: string): Promise<ApiResponse<User>> => {
      return this.get<ApiResponse<User>>('/auth/me');
    },
  };

  // ===============================
  // USER API
  // ===============================

  users: UserAPI = {
    getUsers: async (filters = {}): Promise<PaginatedResponse<User>> => {
      const params = new URLSearchParams(filters as any).toString();
      return this.get<PaginatedResponse<User>>(`/users?${params}`);
    },

    getUserById: async (id: string): Promise<ApiResponse<User>> => {
      return this.get<ApiResponse<User>>(`/users/${id}`);
    },

    updateUser: async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
      return this.put<ApiResponse<User>>(`/users/${id}`, data);
    },

    deleteUser: async (id: string): Promise<ApiResponse<void>> => {
      return this.delete<ApiResponse<void>>(`/users/${id}`);
    },

    activateUser: async (id: string): Promise<ApiResponse<User>> => {
      return this.post<ApiResponse<User>>(`/users/${id}/activate`);
    },

    deactivateUser: async (id: string): Promise<ApiResponse<User>> => {
      return this.post<ApiResponse<User>>(`/users/${id}/deactivate`);
    },
  };

  // ===============================
  // TEACHER API
  // ===============================

  teachers: TeacherAPI = {
    getTeachers: async (filters = {}): Promise<PaginatedResponse<Teacher>> => {
      const params = new URLSearchParams(filters as any).toString();
      return this.get<PaginatedResponse<Teacher>>(`/teachers?${params}`);
    },

    getTeacherById: async (id: string): Promise<ApiResponse<Teacher>> => {
      return this.get<ApiResponse<Teacher>>(`/teachers/${id}`);
    },

    getTeacherSchedule: async (id: string): Promise<ApiResponse<Teacher['schedule']>> => {
      return this.get<ApiResponse<Teacher['schedule']>>(`/teachers/${id}/schedule`);
    },

    getTeacherClasses: async (id: string): Promise<ApiResponse<Class[]>> => {
      return this.get<ApiResponse<Class[]>>(`/teachers/${id}/classes`);
    },

    getTeacherStudents: async (id: string): Promise<ApiResponse<Student[]>> => {
      return this.get<ApiResponse<Student[]>>(`/teachers/${id}/students`);
    },

    updateTeacherSchedule: async (id: string, schedule: Teacher['schedule']): Promise<ApiResponse<Teacher>> => {
      return this.put<ApiResponse<Teacher>>(`/teachers/${id}/schedule`, { schedule });
    },
  };

  // ===============================
  // STUDENT API
  // ===============================

  students: StudentAPI = {
    getStudents: async (filters = {}): Promise<PaginatedResponse<Student>> => {
      const params = new URLSearchParams(filters as any).toString();
      return this.get<PaginatedResponse<Student>>(`/students?${params}`);
    },

    getStudentById: async (id: string): Promise<ApiResponse<Student>> => {
      return this.get<ApiResponse<Student>>(`/students/${id}`);
    },

    createStudent: async (data: any): Promise<ApiResponse<Student>> => {
      return this.post<ApiResponse<Student>>('/students', data);
    },

    updateStudent: async (id: string, data: Partial<Student>): Promise<ApiResponse<Student>> => {
      return this.put<ApiResponse<Student>>(`/students/${id}`, data);
    },

    deleteStudent: async (id: string): Promise<ApiResponse<void>> => {
      return this.delete<ApiResponse<void>>(`/students/${id}`);
    },

    getStudentAttendance: async (id: string, filters = {}): Promise<ApiResponse<AttendanceRecord[]>> => {
      const params = new URLSearchParams(filters as any).toString();
      return this.get<ApiResponse<AttendanceRecord[]>>(`/students/${id}/attendance?${params}`);
    },

    getStudentGrades: async (id: string, filters = {}): Promise<ApiResponse<Grade[]>> => {
      const params = new URLSearchParams(filters as any).toString();
      return this.get<ApiResponse<Grade[]>>(`/students/${id}/grades?${params}`);
    },
  };

  // ===============================
  // CLASS API
  // ===============================

  classes: ClassAPI = {
    getClasses: async (filters = {}): Promise<PaginatedResponse<Class>> => {
      const params = new URLSearchParams(filters as any).toString();
      return this.get<PaginatedResponse<Class>>(`/classes?${params}`);
    },

    getClassById: async (id: string): Promise<ApiResponse<Class>> => {
      return this.get<ApiResponse<Class>>(`/classes/${id}`);
    },

    createClass: async (data: any): Promise<ApiResponse<Class>> => {
      return this.post<ApiResponse<Class>>('/classes', data);
    },

    updateClass: async (id: string, data: Partial<Class>): Promise<ApiResponse<Class>> => {
      return this.put<ApiResponse<Class>>(`/classes/${id}`, data);
    },

    deleteClass: async (id: string): Promise<ApiResponse<void>> => {
      return this.delete<ApiResponse<void>>(`/classes/${id}`);
    },

    getClassStudents: async (id: string): Promise<ApiResponse<Student[]>> => {
      return this.get<ApiResponse<Student[]>>(`/classes/${id}/students`);
    },

    addStudentToClass: async (classId: string, studentId: string): Promise<ApiResponse<void>> => {
      return this.post<ApiResponse<void>>(`/classes/${classId}/students`, { studentId });
    },

    removeStudentFromClass: async (classId: string, studentId: string): Promise<ApiResponse<void>> => {
      return this.delete<ApiResponse<void>>(`/classes/${classId}/students/${studentId}`);
    },
  };

  // ===============================
  // ATTENDANCE API
  // ===============================

  attendance: AttendanceAPI = {
    getAttendanceSessions: async (filters = {}): Promise<PaginatedResponse<AttendanceSession>> => {
      const params = new URLSearchParams(filters as any).toString();
      return this.get<PaginatedResponse<AttendanceSession>>(`/attendance/sessions?${params}`);
    },

    getAttendanceSession: async (id: string): Promise<ApiResponse<AttendanceSession>> => {
      return this.get<ApiResponse<AttendanceSession>>(`/attendance/sessions/${id}`);
    },

    createAttendanceSession: async (data: any): Promise<ApiResponse<AttendanceSession>> => {
      return this.post<ApiResponse<AttendanceSession>>('/attendance/sessions', data);
    },

    updateAttendanceSession: async (id: string, data: Partial<AttendanceSession>): Promise<ApiResponse<AttendanceSession>> => {
      return this.put<ApiResponse<AttendanceSession>>(`/attendance/sessions/${id}`, data);
    },

    completeAttendanceSession: async (id: string): Promise<ApiResponse<AttendanceSession>> => {
      return this.post<ApiResponse<AttendanceSession>>(`/attendance/sessions/${id}/complete`);
    },

    recordAttendance: async (data: any): Promise<ApiResponse<AttendanceRecord>> => {
      return this.post<ApiResponse<AttendanceRecord>>('/attendance/records', data);
    },

    updateAttendanceRecord: async (id: string, data: Partial<AttendanceRecord>): Promise<ApiResponse<AttendanceRecord>> => {
      return this.put<ApiResponse<AttendanceRecord>>(`/attendance/records/${id}`, data);
    },

    getAttendanceRecords: async (filters = {}): Promise<PaginatedResponse<AttendanceRecord>> => {
      const params = new URLSearchParams(filters as any).toString();
      return this.get<PaginatedResponse<AttendanceRecord>>(`/attendance/records?${params}`);
    },
  };

  // ===============================
  // ASSESSMENT API
  // ===============================

  assessments: AssessmentAPI = {
    getAssessments: async (filters = {}): Promise<PaginatedResponse<Assessment>> => {
      const params = new URLSearchParams(filters as any).toString();
      return this.get<PaginatedResponse<Assessment>>(`/assessments?${params}`);
    },

    getAssessmentById: async (id: string): Promise<ApiResponse<Assessment>> => {
      return this.get<ApiResponse<Assessment>>(`/assessments/${id}`);
    },

    createAssessment: async (data: any): Promise<ApiResponse<Assessment>> => {
      return this.post<ApiResponse<Assessment>>('/assessments', data);
    },

    updateAssessment: async (id: string, data: Partial<Assessment>): Promise<ApiResponse<Assessment>> => {
      return this.put<ApiResponse<Assessment>>(`/assessments/${id}`, data);
    },

    deleteAssessment: async (id: string): Promise<ApiResponse<void>> => {
      return this.delete<ApiResponse<void>>(`/assessments/${id}`);
    },
  };

  // ===============================
  // GRADING API
  // ===============================

  grading: GradingAPI = {
    getGrades: async (filters = {}): Promise<PaginatedResponse<Grade>> => {
      const params = new URLSearchParams(filters as any).toString();
      return this.get<PaginatedResponse<Grade>>(`/grades?${params}`);
    },

    recordGrade: async (data: any): Promise<ApiResponse<Grade>> => {
      return this.post<ApiResponse<Grade>>('/grades', data);
    },

    updateGrade: async (id: string, data: Partial<Grade>): Promise<ApiResponse<Grade>> => {
      return this.put<ApiResponse<Grade>>(`/grades/${id}`, data);
    },

    deleteGrade: async (id: string): Promise<ApiResponse<void>> => {
      return this.delete<ApiResponse<void>>(`/grades/${id}`);
    },

    recordGradesBulk: async (data: any[]): Promise<ApiResponse<Grade[]>> => {
      return this.post<ApiResponse<Grade[]>>('/grades/bulk', data);
    },
  };

  // ===============================
  // REPORTS API
  // ===============================

  reports: ReportAPI = {
    getReports: async (filters = {}): Promise<PaginatedResponse<Report>> => {
      const params = new URLSearchParams(filters as any).toString();
      return this.get<PaginatedResponse<Report>>(`/reports?${params}`);
    },

    generateReport: async (data: any): Promise<ApiResponse<Report>> => {
      return this.post<ApiResponse<Report>>('/reports/generate', data);
    },

    getReport: async (id: string): Promise<ApiResponse<Report>> => {
      return this.get<ApiResponse<Report>>(`/reports/${id}`);
    },

    downloadReport: async (id: string, format: 'pdf' | 'excel'): Promise<Blob> => {
      const response = await fetch(`${this.baseURL}/reports/${id}/download?format=${format}`, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      return response.blob();
    },

    deleteReport: async (id: string): Promise<ApiResponse<void>> => {
      return this.delete<ApiResponse<void>>(`/reports/${id}`);
    },
  };

  // ===============================
  // STATISTICS API
  // ===============================

  statistics: StatisticsAPI = {
    getDashboardStats: async (): Promise<ApiResponse<any>> => {
      return this.get<ApiResponse<any>>('/statistics/dashboard');
    },

    getClassStats: async (id: string): Promise<ApiResponse<any>> => {
      return this.get<ApiResponse<any>>(`/statistics/class/${id}`);
    },

    getTeacherStats: async (id: string): Promise<ApiResponse<any>> => {
      return this.get<ApiResponse<any>>(`/statistics/teacher/${id}`);
    },

    getStudentStats: async (id: string): Promise<ApiResponse<any>> => {
      return this.get<ApiResponse<any>>(`/statistics/student/${id}`);
    },

    getAttendanceStats: async (filters = {}): Promise<ApiResponse<any>> => {
      const params = new URLSearchParams(filters as any).toString();
      return this.get<ApiResponse<any>>(`/statistics/attendance?${params}`);
    },

    getGradeStats: async (filters = {}): Promise<ApiResponse<any>> => {
      const params = new URLSearchParams(filters as any).toString();
      return this.get<ApiResponse<any>>(`/statistics/grades?${params}`);
    },
  };

  // ===============================
  // VOICE API
  // ===============================

  voice: VoiceAPI = {
    processVoiceAttendance: async (data: any): Promise<ApiResponse<AttendanceRecord[]>> => {
      return this.post<ApiResponse<AttendanceRecord[]>>('/voice/process-attendance', data);
    },

    processVoiceGrading: async (data: any): Promise<ApiResponse<Grade[]>> => {
      return this.post<ApiResponse<Grade[]>>('/voice/process-grading', data);
    },

    getVoiceCommands: async (): Promise<ApiResponse<any>> => {
      return this.get<ApiResponse<any>>('/voice/commands');
    },

    updateVoiceConfig: async (config: any): Promise<ApiResponse<any>> => {
      return this.put<ApiResponse<any>>('/voice/config', config);
    },
  };
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient(API_BASE_URL);

// Hook para usar la API en componentes React
export const useAPI = () => {
  return apiClient;
};