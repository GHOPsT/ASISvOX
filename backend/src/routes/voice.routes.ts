import { Router } from 'express';
import { requireTeacherOrAdmin } from '../middleware/auth';

const router = Router();

router.post('/process-attendance', requireTeacherOrAdmin, (req, res) => res.json({ message: 'Process voice attendance' }));
router.post('/process-grading', requireTeacherOrAdmin, (req, res) => res.json({ message: 'Process voice grading' }));
router.get('/commands', requireTeacherOrAdmin, (req, res) => res.json({ message: 'Get voice commands' }));
router.put('/config', requireTeacherOrAdmin, (req, res) => res.json({ message: 'Update voice config' }));

export default router;