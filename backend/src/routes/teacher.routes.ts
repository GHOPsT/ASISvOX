// ===============================
// RUTAS DE PROFESORES
// ===============================

import { Router } from 'express';
import {
  getTeachers,
  getTeacherById,
  getTeacherSchedule,
  getTeacherClasses,
  getTeacherStudents,
  updateTeacherSchedule,
} from '../controllers/teacher.controller';
import { requireTeacherOrAdmin } from '../middleware/auth';

const router = Router();

// GET /api/teachers
router.get('/', requireTeacherOrAdmin, getTeachers);

// GET /api/teachers/:id
router.get('/:id', requireTeacherOrAdmin, getTeacherById);

// GET /api/teachers/:id/schedule
router.get('/:id/schedule', requireTeacherOrAdmin, getTeacherSchedule);

// GET /api/teachers/:id/classes
router.get('/:id/classes', requireTeacherOrAdmin, getTeacherClasses);

// GET /api/teachers/:id/students
router.get('/:id/students', requireTeacherOrAdmin, getTeacherStudents);

// PUT /api/teachers/:id/schedule
router.put('/:id/schedule', requireTeacherOrAdmin, updateTeacherSchedule);

export default router;