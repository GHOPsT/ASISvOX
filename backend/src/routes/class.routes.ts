import { Router } from 'express';
import { requireTeacherOrAdmin } from '../middleware/auth';
import { 
  getClasses, 
  getClassById, 
  createClass 
} from '../controllers/class.controller';

const router = Router();

router.get('/', requireTeacherOrAdmin, getClasses);
router.get('/:id', requireTeacherOrAdmin, getClassById);
router.post('/', requireTeacherOrAdmin, createClass);

export default router;