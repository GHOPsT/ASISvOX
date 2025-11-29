"use strict";
// ===============================
// CONTROLADOR DE PROFESORES
// ===============================
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTeacherSchedule = exports.getTeacherStudents = exports.getTeacherClasses = exports.getTeacherSchedule = exports.getTeacherById = exports.getTeachers = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const connection_1 = require("../config/connection");
// Mock data de profesores (reemplazar con base de datos)
const mockTeachers = [
    {
        id: '1',
        name: 'Prof. María González',
        email: 'maria.gonzalez@asisVox.com',
        role: 'teacher',
        entityId: 'default-entity',
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
        entityId: 'default-entity',
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
        entityId: 'default-entity',
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
const mockClasses = [
    {
        id: '1',
        name: 'Matemáticas 10°A',
        subject: 'Matemáticas',
        teacherId: '1',
        entityId: 'default-entity',
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
const mockStudents = [
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
exports.getTeachers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10, search, subject, status } = req.query;
    let filteredTeachers = [...mockTeachers];
    // Filtros
    if (search) {
        const searchTerm = search.toString().toLowerCase();
        filteredTeachers = filteredTeachers.filter(teacher => teacher.name.toLowerCase().includes(searchTerm) ||
            teacher.email.toLowerCase().includes(searchTerm) ||
            teacher.subjects.some(s => s.toLowerCase().includes(searchTerm)));
    }
    if (subject) {
        filteredTeachers = filteredTeachers.filter(teacher => teacher.subjects.includes(subject.toString()));
    }
    if (status) {
        filteredTeachers = filteredTeachers.filter(teacher => teacher.status === status.toString());
    }
    // Paginación
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex);
    const response = {
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
exports.getTeacherById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const teacher = mockTeachers.find(t => t.id === id);
    if (!teacher) {
        throw (0, errorHandler_1.createError)('Profesor no encontrado', 404);
    }
    const response = {
        success: true,
        data: teacher,
        message: 'Profesor obtenido exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// GET /api/teachers/:id/schedule
exports.getTeacherSchedule = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const teacher = mockTeachers.find(t => t.id === id);
    if (!teacher) {
        throw (0, errorHandler_1.createError)('Profesor no encontrado', 404);
    }
    const response = {
        success: true,
        data: teacher.schedule,
        message: 'Horario obtenido exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// GET /api/teachers/:id/classes
exports.getTeacherClasses = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    // Buscar en la base de datos si el usuario es un profesor
    const teacherResult = await (0, connection_1.query)('SELECT id, email, full_name, role FROM users WHERE id = $1 AND role = $2', [id, 'teacher']);
    if (teacherResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Profesor no encontrado', 404);
    }
    // Obtener clases del profesor desde la BD
    const classesResult = await (0, connection_1.query)(`SELECT 
      c.id,
      c.classroom,
      c.is_active,
      c.created_at,
      sub.name as subject,
      sec.name as section,
      gr.name as grade,
      ay.name as academic_year,
      COUNT(DISTINCT e.student_id) as student_count,
      COALESCE(AVG(grc.score), 0) as average_grade
    FROM classes c
    LEFT JOIN subjects sub ON c.subject_id = sub.id
    LEFT JOIN sections sec ON c.section_id = sec.id
    LEFT JOIN grades gr ON sec.grade_id = gr.id
    LEFT JOIN academic_years ay ON c.academic_year_id = ay.id
    LEFT JOIN enrollments e ON sec.id = e.section_id AND e.academic_year_id = c.academic_year_id
    LEFT JOIN grades_records grc ON e.student_id = grc.student_id
    WHERE c.teacher_id = $1 AND c.is_active = true
    GROUP BY c.id, sub.name, sec.name, gr.name, ay.name
    ORDER BY c.created_at DESC`, [id]);
    const teacherClasses = classesResult.rows.map((row) => ({
        id: row.id,
        name: `${row.grade}° ${row.section} - ${row.subject}`,
        subject: row.subject,
        section: row.section,
        grade: row.grade,
        classroom: row.classroom,
        academicYear: row.academic_year,
        studentCount: parseInt(row.student_count),
        averageGrade: parseFloat(row.average_grade),
        isActive: row.is_active,
        createdAt: row.created_at
    }));
    const response = {
        success: true,
        data: teacherClasses,
        message: teacherClasses.length === 0
            ? 'No hay clases asignadas actualmente'
            : 'Clases obtenidas exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// GET /api/teachers/:id/students
exports.getTeacherStudents = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const teacher = mockTeachers.find(t => t.id === id);
    if (!teacher) {
        throw (0, errorHandler_1.createError)('Profesor no encontrado', 404);
    }
    // Obtener estudiantes de todas las clases del profesor
    const teacherClasses = mockClasses.filter(c => c.teacherId === id);
    const studentIds = [];
    teacherClasses.forEach(cls => {
        studentIds.push(...cls.students);
    });
    const students = mockStudents.filter(s => studentIds.includes(s.id));
    const response = {
        success: true,
        data: students,
        message: 'Estudiantes obtenidos exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
// PUT /api/teachers/:id/schedule
exports.updateTeacherSchedule = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { schedule } = req.body;
    // Verificar permisos (un profesor solo puede actualizar su propio horario)
    if (req.user?.role === 'teacher' && req.user.id !== id) {
        throw (0, errorHandler_1.createError)('No tienes permisos para actualizar este horario', 403);
    }
    const teacherIndex = mockTeachers.findIndex(t => t.id === id);
    if (teacherIndex === -1) {
        throw (0, errorHandler_1.createError)('Profesor no encontrado', 404);
    }
    // Actualizar horario
    mockTeachers[teacherIndex].schedule = schedule;
    mockTeachers[teacherIndex].updatedAt = new Date();
    const response = {
        success: true,
        data: mockTeachers[teacherIndex],
        message: 'Horario actualizado exitosamente',
        timestamp: new Date(),
    };
    res.status(200).json(response);
});
//# sourceMappingURL=teacher.controller.js.map