import { Router } from 'express';
import { requireTeacherOrAdmin } from '../middleware/auth';
import { 
  createStudents,
  getStudents,
  getStudentById,
  updateStudent,
  getStudentsByClassId
} from '../controllers/student.controller';

const router = Router();

// Obtener todos los estudiantes
router.get('/', requireTeacherOrAdmin, getStudents);

// Obtener estudiantes de una clase específica
router.get('/class/:classId', requireTeacherOrAdmin, getStudentsByClassId);

// Crear uno o varios estudiantes
router.post('/', requireTeacherOrAdmin, createStudents);

// Obtener estudiante por ID
router.get('/:id', requireTeacherOrAdmin, getStudentById);

// Actualizar estudiante
router.put('/:id', requireTeacherOrAdmin, updateStudent);

export default router;