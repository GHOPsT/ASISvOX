import { Router } from 'express';
import { requireTeacherOrAdmin } from '../middleware/auth';
import {
  getAssessments,
  getAssessment,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessmentTypes,
} from '../controllers/assessment.controller';

const router = Router();

// Assessment CRUD
router.get('/', requireTeacherOrAdmin, getAssessments);
router.get('/types', requireTeacherOrAdmin, getAssessmentTypes);
router.get('/:assessmentId', requireTeacherOrAdmin, getAssessment);
router.post('/', requireTeacherOrAdmin, createAssessment);
router.put('/:assessmentId', requireTeacherOrAdmin, updateAssessment);
router.delete('/:assessmentId', requireTeacherOrAdmin, deleteAssessment);

export default router;