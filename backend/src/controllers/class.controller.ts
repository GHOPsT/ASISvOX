import { Request, Response } from 'express';
import { pool } from '../config/connection';

// ===============================
// CONTROLADOR DE CLASES
// ===============================

// Obtener todas las clases con filtros
export const getClasses = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, teacherId, isActive = 'true' } = req.query;
    
    let whereClause = 'WHERE c.is_active = $1';
    const params: any[] = [isActive === 'true'];
    let paramIndex = 2;
    
    if (teacherId) {
      whereClause += ` AND c.teacher_id = $${paramIndex}`;
      params.push(teacherId);
      paramIndex++;
    }
    
    // Consulta principal con paginación
    const classesQuery = `
      SELECT 
        c.id,
        c.classroom,
        c.is_active,
        c.created_at,
        c.updated_at,
        s.name as subject_name,
        s.code as subject_code,
        sec.name as section_name,
        g.name as grade_name,
        ay.name as academic_year_name,
        u.full_name as teacher_name,
        u.email as teacher_email,
        COUNT(DISTINCT e.student_id) as student_count
      FROM classes c
      JOIN subjects s ON c.subject_id = s.id
      JOIN sections sec ON c.section_id = sec.id
      JOIN grades g ON sec.grade_id = g.id
      JOIN academic_years ay ON c.academic_year_id = ay.id
      JOIN users u ON c.teacher_id = u.id
      LEFT JOIN enrollments e ON sec.id = e.section_id 
        AND e.academic_year_id = c.academic_year_id 
        AND e.status = 'active'
      ${whereClause}
      GROUP BY c.id, s.id, sec.id, g.id, ay.id, u.id
      ORDER BY c.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const offset = (Number(page) - 1) * Number(limit);
    params.push(Number(limit), offset);
    
    const classesResult = await pool.query(classesQuery, params);
    
    // Consulta para contar total
    const countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM classes c
      JOIN subjects s ON c.subject_id = s.id
      JOIN sections sec ON c.section_id = sec.id
      JOIN grades g ON sec.grade_id = g.id
      JOIN academic_years ay ON c.academic_year_id = ay.id
      JOIN users u ON c.teacher_id = u.id
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, params.slice(0, -2)); // Remover limit y offset
    const total = parseInt(countResult.rows[0].total);
    
    const formattedClasses = classesResult.rows.map(row => ({
      id: row.id,
      name: `${row.subject_name} ${row.grade_name}°${row.section_name}`,
      subject: row.subject_name,
      classroom: row.classroom,
      teacher: {
        name: row.teacher_name,
        email: row.teacher_email
      },
      studentCount: parseInt(row.student_count) || 0,
      academicYear: row.academic_year_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isActive: row.is_active
    }));
    
    return res.json({
      success: true,
      data: {
        classes: formattedClasses,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: formattedClasses.length,
          totalRecords: total
        }
      },
      message: 'Clases obtenidas exitosamente',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting classes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      timestamp: new Date()
    });
  }
};

// Obtener clase por ID
export const getClassById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const classQuery = `
      SELECT 
        c.id,
        c.classroom,
        c.is_active,
        c.created_at,
        c.updated_at,
        s.name as subject_name,
        s.code as subject_code,
        sec.name as section_name,
        g.name as grade_name,
        ay.name as academic_year_name,
        u.full_name as teacher_name,
        u.email as teacher_email,
        COUNT(DISTINCT e.student_id) as student_count
      FROM classes c
      JOIN subjects s ON c.subject_id = s.id
      JOIN sections sec ON c.section_id = sec.id
      JOIN grades g ON sec.grade_id = g.id
      JOIN academic_years ay ON c.academic_year_id = ay.id
      JOIN users u ON c.teacher_id = u.id
      LEFT JOIN enrollments e ON sec.id = e.section_id 
        AND e.academic_year_id = c.academic_year_id 
        AND e.status = 'active'
      WHERE c.id = $1
      GROUP BY c.id, s.id, sec.id, g.id, ay.id, u.id
    `;
    
    const result = await pool.query(classQuery, [id]);
      
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Clase no encontrada',
        timestamp: new Date()
      });
    }
    
    const row = result.rows[0];
    const classData = {
      id: row.id,
      name: `${row.subject_name} ${row.grade_name}°${row.section_name}`,
      subject: row.subject_name,
      classroom: row.classroom,
      teacher: {
        name: row.teacher_name,
        email: row.teacher_email
      },
      studentCount: parseInt(row.student_count) || 0,
      academicYear: row.academic_year_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isActive: row.is_active
    };
    
    return res.json({
      success: true,
      data: classData,
      message: 'Clase obtenida exitosamente',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting class:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      timestamp: new Date()
    });
  }
};

// Crear nueva clase
export const createClass = async (req: Request, res: Response) => {
  try {
    const {
      subjectId,
      sectionId,
      teacherId,
      academicYearId,
      classroom
    } = req.body;

    // Verificar que el docente existe
    const teacherQuery = `
      SELECT id, full_name, email 
      FROM users 
      WHERE id = $1 AND role = 'teacher' AND is_active = true
    `;
    
    const teacherResult = await pool.query(teacherQuery, [teacherId]);
    
    if (teacherResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Docente no encontrado',
        timestamp: new Date()
      });
    }

    // Verificar que la materia, sección y año académico existen
    const validationQuery = `
      SELECT 
        s.id as subject_exists,
        sec.id as section_exists,
        ay.id as academic_year_exists
      FROM subjects s
      CROSS JOIN sections sec
      CROSS JOIN academic_years ay
      WHERE s.id = $1 AND sec.id = $2 AND ay.id = $3
        AND s.is_active = true AND sec.is_active = true
    `;
    
    const validationResult = await pool.query(validationQuery, [subjectId, sectionId, academicYearId]);
    
    if (validationResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Materia, sección o año académico no válidos',
        timestamp: new Date()
      });
    }

    // Verificar que no existe ya una clase con esta combinación
    const existingClassQuery = `
      SELECT id FROM classes 
      WHERE section_id = $1 AND subject_id = $2 AND academic_year_id = $3
    `;
    
    const existingResult = await pool.query(existingClassQuery, [sectionId, subjectId, academicYearId]);
    
    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una clase para esta materia y sección en el año académico',
        timestamp: new Date()
      });
    }

    // Crear la nueva clase
    const insertQuery = `
      INSERT INTO classes (section_id, subject_id, teacher_id, academic_year_id, classroom, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id, created_at, updated_at
    `;
    
    const insertResult = await pool.query(insertQuery, [
      sectionId, 
      subjectId, 
      teacherId, 
      academicYearId, 
      classroom
    ]);

    const newClass = insertResult.rows[0];

    // Obtener la clase creada con toda la información
    const fullClassQuery = `
      SELECT 
        c.id,
        c.classroom,
        c.is_active,
        c.created_at,
        c.updated_at,
        s.name as subject_name,
        s.code as subject_code,
        sec.name as section_name,
        g.name as grade_name,
        ay.name as academic_year_name,
        u.full_name as teacher_name,
        u.email as teacher_email
      FROM classes c
      JOIN subjects s ON c.subject_id = s.id
      JOIN sections sec ON c.section_id = sec.id
      JOIN grades g ON sec.grade_id = g.id
      JOIN academic_years ay ON c.academic_year_id = ay.id
      JOIN users u ON c.teacher_id = u.id
      WHERE c.id = $1
    `;

    const fullClassResult = await pool.query(fullClassQuery, [newClass.id]);
    const classData = fullClassResult.rows[0];

    const formattedClass = {
      id: classData.id,
      name: `${classData.subject_name} ${classData.grade_name}°${classData.section_name}`,
      subject: classData.subject_name,
      classroom: classData.classroom,
      teacher: {
        name: classData.teacher_name,
        email: classData.teacher_email
      },
      academicYear: classData.academic_year_name,
      createdAt: classData.created_at,
      updatedAt: classData.updated_at,
      isActive: classData.is_active
    };

    return res.status(201).json({
      success: true,
      data: formattedClass,
      message: 'Clase creada exitosamente',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error creating class:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      timestamp: new Date()
    });
  }
};

// TODO: Implementar updateClass con SQL
// export const updateClass = async (req: Request, res: Response) => {
//   // Implementar con consultas SQL cuando sea necesario
// };

// TODO: Implementar deleteClass con SQL  
// export const deleteClass = async (req: Request, res: Response) => {
//   // Implementar con consultas SQL cuando sea necesario
// };

// Obtener clases de un docente específico
export const getTeacherClasses = async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.params;
    
    // Verificar que el docente existe
    const teacherQuery = `
      SELECT id, full_name, email, role 
      FROM users 
      WHERE id = $1 AND role = 'teacher' AND is_active = true
    `;
    
    const teacherResult = await pool.query(teacherQuery, [teacherId]);
    
    if (teacherResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Docente no encontrado',
        timestamp: new Date()
      });
    }

    // Obtener las clases del docente con información completa
    const classesQuery = `
      SELECT 
        c.id,
        c.classroom,
        c.is_active,
        c.created_at,
        c.updated_at,
        s.name as subject_name,
        s.code as subject_code,
        s.color as subject_color,
        sec.name as section_name,
        g.name as grade_name,
        g.level as grade_level,
        ay.name as academic_year_name,
        ay.is_current,
        -- Contar estudiantes matriculados
        COUNT(DISTINCT e.student_id) as student_count
      FROM classes c
      JOIN subjects s ON c.subject_id = s.id
      JOIN sections sec ON c.section_id = sec.id
      JOIN grades g ON sec.grade_id = g.id
      JOIN academic_years ay ON c.academic_year_id = ay.id
      LEFT JOIN enrollments e ON sec.id = e.section_id 
        AND e.academic_year_id = c.academic_year_id 
        AND e.status = 'active'
      WHERE c.teacher_id = $1 AND c.is_active = true
      GROUP BY c.id, s.id, sec.id, g.id, ay.id
      ORDER BY ay.is_current DESC, c.created_at DESC
    `;

    const classesResult = await pool.query(classesQuery, [teacherId]);

    // Formatear los datos para el frontend
    const formattedClasses = classesResult.rows.map(row => ({
      id: row.id,
      name: `${row.subject_name} ${row.grade_name}°${row.section_name}`,
      subject: row.subject_name,
      grade: `${row.grade_name}°`,
      section: row.section_name,
      schedule: "Por definir", // Se puede agregar lógica para obtener horarios
      studentCount: parseInt(row.student_count) || 0,
      averageGrade: 8.0, // Valor por defecto hasta implementar cálculo
      nextClass: "Por programar", // Se puede mejorar con lógica de horarios
      classroom: row.classroom || 'Sin asignar',
      academicYear: row.academic_year_name,
      isCurrent: row.is_current,
      subjectColor: row.subject_color,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isActive: row.is_active
    }));

    return res.json({
      success: true,
      data: formattedClasses,
      message: 'Clases del docente obtenidas exitosamente',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting teacher classes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      timestamp: new Date()
    });
  }
};