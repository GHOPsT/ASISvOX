import { Router } from 'express';
import { requireTeacherOrAdmin } from '../middleware/auth';
import {
  getGrades,
  getGrade,
  recordGrade,
  recordGradesBulk,
  updateGrade,
  deleteGrade,
  getGradeStatistics,
} from '../controllers/grading.controller';

const router = Router();

// Grades CRUD
router.get('/', requireTeacherOrAdmin, getGrades);
router.get('/statistics', requireTeacherOrAdmin, getGradeStatistics);
router.get('/:gradeId', requireTeacherOrAdmin, getGrade);
router.post('/', requireTeacherOrAdmin, recordGrade);
router.post('/bulk', requireTeacherOrAdmin, recordGradesBulk);
router.put('/:gradeId', requireTeacherOrAdmin, updateGrade);
router.delete('/:gradeId', requireTeacherOrAdmin, deleteGrade);

export default router;