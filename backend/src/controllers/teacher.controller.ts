// ===============================
// CONTROLADOR DE PROFESORES
// ===============================

import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { Teacher, Class, Student, ApiResponse, PaginatedResponse } from '../../../shared/types';

// Mock data de profesores (reemplazar con base de datos)
const mockTeachers: Teacher[] = [
  {
    id: '1',
    name: 'Prof. María González',
    email: 'maria.gonzalez@asisVox.com',
    role: 'teacher',
    status: 'active',
    subjects: ['Matemáticas', 'Álgebra'],
    classes: ['1', '2', '3', '4'],
    totalStudents: 120,
    lastActivity: new Date('2024-01-20T10:30:00Z'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    schedule: {
      'Lunes': [
        { time: '8:00-9:30', subject: 'Matemáticas', class: '10°A', classId: '1' },
        { time: '14:00-15:30', subject: 'Geometría', class: '9°C', classId: '3' }
      ],
      'Martes': [
        { time: '10:00-11:30', subject: 'Álgebra', class: '11°B', classId: '2' }
      ],
      'Miércoles': [
        { time: '8:00-9:30', subject: 'Matemáticas', class: '10°A', classId: '1' },
        { time: '14:00-15:30', subject: 'Geometría', class: '9°C', classId: '3' }
      ],
      'Jueves': [
        { time: '10:00-11:30', subject: 'Álgebra', class: '11°B', classId: '2' },
        { time: '9:00-10:30', subject: 'Cálculo', class: '12°A', classId: '4' }
      ],
      'Viernes': [
        { time: '8:00-9:30', subject: 'Matemáticas', class: '10°A', classId: '1' },
        { time: '14:00-15:30', subject: 'Geometría', class: '9°C', classId: '3' }
      ],
      'Sábado': [
        { time: '9:00-10:30', subject: 'Cálculo', class: '12°A', classId: '4' }
      ]
    }
  },
  {
    id: '2',
    name: 'Prof. Carlos Ruiz',
    email: 'carlos.ruiz@asisVox.com',
    role: 'teacher',
    status: 'active',
    subjects: ['Física', 'Química'],
    classes: ['5', '6', '7'],
    totalStudents: 85,
    lastActivity: new Date('2024-01-20T09:45:00Z'),
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-20'),
    schedule: {
      'Lunes': [
        { time: '9:30-11:00', subject: 'Física', class: '11°A', classId: '5' },
        { time: '15:30-17:00', subject: 'Química', class: '10°B', classId: '6' }
      ],
      'Martes': [
        { time: '8:00-9:30', subject: 'Física', class: '12°A', classId: '7' }
      ],
      'Miércoles': [
        { time: '9:30-11:00', subject: 'Física', class: '11°A', classId: '5' }
      ],
      'Jueves': [
        { time: '8:00-9:30', subject: 'Física', class: '12°A', classId: '7' },
        { time: '15:30-17:00', subject: 'Química', class: '10°B', classId: '6' }
      ],
      'Viernes': [
        { time: '9:30-11:00', subject: 'Física', class: '11°A', classId: '5' }
      ]
    }
  },
  {
    id: '3',
    name: 'Prof. Ana López',
    email: 'ana.lopez@asisVox.com',
    role: 'teacher',
    status: 'active',
    subjects: ['Historia', 'Geografía'],
    classes: ['8', '9', '10'],
    totalStudents: 90,
    lastActivity: new Date('2024-01-20T08:15:00Z'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
    schedule: {
      'Lunes': [
        { time: '11:00-12:30', subject: 'Historia', class: '9°A', classId: '8' }
      ],
      'Martes': [
        { time: '14:00-15:30', subject: 'Geografía', class: '10°A', classId: '9' },
        { time: '15:30-17:00', subject: 'Historia', class: '11°C', classId: '10' }
      ],
      'Miércoles': [
        { time: '11:00-12:30', subject: 'Historia', class: '9°A', classId: '8' }
      ],
      'Jueves': [
        { time: '14:00-15:30', subject: 'Geografía', class: '10°A', classId: '9' }
      ],
      'Viernes': [
        { time: '11:00-12:30', subject: 'Historia', class: '9°A', classId: '8' },
        { time: '15:30-17:00', subject: 'Historia', class: '11°C', classId: '10' }
      ]
    }
  }
];

// Mock data de clases
const mockClasses: Class[] = [
  {
    id: '1',
    name: 'Matemáticas 10°A',
    subject: 'Matemáticas',
    teacherId: '1',
    students: ['1', '2', '3', '4', '5'],
    schedule: 'Lun, Mié, Vie - 8:00 AM',
    period: '2024-1',
    academicYear: '2024',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  // ... más clases mock
];

// Mock data de estudiantes
const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Juan Pérez García',
    email: 'juan.perez@asisVox.com',
    role: 'student',
    status: 'active',
    code: '2024001',
    classId: '1',
    attendance: [],
    grades: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  // ... más estudiantes mock
];

// ===============================
// CONTROLADORES
// ===============================

// GET /api/teachers
export const getTeachers = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search, subject, status } = req.query;

  let filteredTeachers = [...mockTeachers];

  // Filtros
  if (search) {
    const searchTerm = search.toString().toLowerCase();
    filteredTeachers = filteredTeachers.filter(teacher =>
      teacher.name.toLowerCase().includes(searchTerm) ||
      teacher.email.toLowerCase().includes(searchTerm) ||
      teacher.subjects.some(s => s.toLowerCase().includes(searchTerm))
    );
  }

  if (subject) {
    filteredTeachers = filteredTeachers.filter(teacher =>
      teacher.subjects.includes(subject.toString())
    );
  }

  if (status) {
    filteredTeachers = filteredTeachers.filter(teacher =>
      teacher.status === status.toString()
    );
  }

  // Paginación
  const pageNum = parseInt(page.toString());
  const limitNum = parseInt(limit.toString());
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex);

  const response: PaginatedResponse<Teacher> = {
    success: true,
    data: paginatedTeachers,
    message: 'Profesores obtenidos exitosamente',
    timestamp: new Date(),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: filteredTeachers.length,
      totalPages: Math.ceil(filteredTeachers.length / limitNum),
    },
  };

  res.status(200).json(response);
});

// GET /api/teachers/:id
export const getTeacherById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const teacher = mockTeachers.find(t => t.id === id);
  
  if (!teacher) {
    throw createError('Profesor no encontrado', 404);
  }

  const response: ApiResponse<Teacher> = {
    success: true,
    data: teacher,
    message: 'Profesor obtenido exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// GET /api/teachers/:id/schedule
export const getTeacherSchedule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const teacher = mockTeachers.find(t => t.id === id);
  
  if (!teacher) {
    throw createError('Profesor no encontrado', 404);
  }

  const response: ApiResponse<Teacher['schedule']> = {
    success: true,
    data: teacher.schedule,
    message: 'Horario obtenido exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// GET /api/teachers/:id/classes
export const getTeacherClasses = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Buscar en mock data primero, luego en base de datos
  let teacher = mockTeachers.find(t => t.id === id);
  
  if (!teacher) {
    throw createError('Profesor no encontrado', 404);
  }

  // Para pruebas, usar mock data de clases
  const teacherClasses = mockClasses.filter(c => c.teacherId === id);

  const response: ApiResponse<Class[]> = {
    success: true,
    data: teacherClasses,
    message: 'Clases obtenidas exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// GET /api/teachers/:id/students
export const getTeacherStudents = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const teacher = mockTeachers.find(t => t.id === id);
  
  if (!teacher) {
    throw createError('Profesor no encontrado', 404);
  }

  // Obtener estudiantes de todas las clases del profesor
  const teacherClasses = mockClasses.filter(c => c.teacherId === id);
  const studentIds: string[] = [];
  
  teacherClasses.forEach(cls => {
    studentIds.push(...cls.students);
  });

  const students = mockStudents.filter(s => studentIds.includes(s.id));

  const response: ApiResponse<Student[]> = {
    success: true,
    data: students,
    message: 'Estudiantes obtenidos exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});

// PUT /api/teachers/:id/schedule
export const updateTeacherSchedule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { schedule } = req.body;

  // Verificar permisos (un profesor solo puede actualizar su propio horario)
  if (req.user?.role === 'teacher' && req.user.id !== id) {
    throw createError('No tienes permisos para actualizar este horario', 403);
  }

  const teacherIndex = mockTeachers.findIndex(t => t.id === id);
  
  if (teacherIndex === -1) {
    throw createError('Profesor no encontrado', 404);
  }

  // Actualizar horario
  mockTeachers[teacherIndex].schedule = schedule;
  mockTeachers[teacherIndex].updatedAt = new Date();

  const response: ApiResponse<Teacher> = {
    success: true,
    data: mockTeachers[teacherIndex],
    message: 'Horario actualizado exitosamente',
    timestamp: new Date(),
  };

  res.status(200).json(response);
});