import { Router } from 'express';
import { requireTeacherOrAdmin } from '../middleware/auth';
import {
  getEntityStatistics,
  getClassStatistics,
  getStudentStatistics,
} from '../controllers/statistics.controller';

const router = Router();

// Statistics
router.get('/dashboard', requireTeacherOrAdmin, getEntityStatistics);
router.get('/class', requireTeacherOrAdmin, getClassStatistics);
router.get('/student', requireTeacherOrAdmin, getStudentStatistics);

export default router;