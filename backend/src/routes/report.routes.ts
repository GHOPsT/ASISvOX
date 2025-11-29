import { Router } from 'express';
import { requireTeacherOrAdmin } from '../middleware/auth';
import {
  getReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
} from '../controllers/report.controller';

const router = Router();

// Reports CRUD
router.get('/', requireTeacherOrAdmin, getReports);
router.get('/:reportId', requireTeacherOrAdmin, getReport);
router.post('/', requireTeacherOrAdmin, createReport);
router.put('/:reportId', requireTeacherOrAdmin, updateReport);
router.delete('/:reportId', requireTeacherOrAdmin, deleteReport);

export default router;