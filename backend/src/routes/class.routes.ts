import { Router } from 'express';
import { requireTeacherOrAdmin, requireAdmin } from '../middleware/auth';
import { 
  getClasses, 
  getClassById, 
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
  getTeacherClasses,
  createSchedules,
  getSchedules,
  updateSchedule,
  deleteSchedule,
  addStudentsToClass
} from '../controllers/class.controller';

const router = Router();

// Listar clases (con filtros según rol)
router.get('/', requireTeacherOrAdmin, getClasses);

// Obtener clase por ID
router.get('/:id', requireTeacherOrAdmin, getClassById);

// Crear clase (⭐ auto-asignada para teachers)
router.post('/', requireTeacherOrAdmin, createClass);

// Actualizar clase
router.put('/:id', requireTeacherOrAdmin, updateClass);

// Eliminar clase
router.delete('/:id', requireTeacherOrAdmin, deleteClass);

// Obtener estudiantes de una clase
router.get('/:id/students', requireTeacherOrAdmin, getClassStudents);

// Agregar estudiantes a una clase
router.post('/:classId/students', requireTeacherOrAdmin, addStudentsToClass);

// Obtener clases de un docente específico (el teacher puede ver sus propias clases)
router.get('/teacher/:teacherId', requireTeacherOrAdmin, getTeacherClasses);

// ===============================
// RUTAS DE HORARIOS
// ===============================

// Crear horarios para una clase
router.post('/:classId/schedules', requireTeacherOrAdmin, createSchedules);

// Obtener horarios de una clase
router.get('/:classId/schedules', requireTeacherOrAdmin, getSchedules);

// Actualizar un horario específico
router.put('/:classId/schedules/:scheduleId', requireTeacherOrAdmin, updateSchedule);

// Eliminar un horario específico
router.delete('/:classId/schedules/:scheduleId', requireTeacherOrAdmin, deleteSchedule);

export default router;