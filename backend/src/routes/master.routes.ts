import { Router } from 'express';
import { requireTeacherOrAdmin } from '../middleware/auth';
import {
  getSubjects,
  getSections,
  getAcademicYears,
  getGrades
} from '../controllers/master.controller';

const router = Router();

// Obtener asignaturas
router.get('/subjects', requireTeacherOrAdmin, getSubjects);

// Obtener secciones
router.get('/sections', requireTeacherOrAdmin, getSections);

// Obtener años académicos
router.get('/academic-years', requireTeacherOrAdmin, getAcademicYears);

// Obtener grados
router.get('/grades', requireTeacherOrAdmin, getGrades);

export default router;
