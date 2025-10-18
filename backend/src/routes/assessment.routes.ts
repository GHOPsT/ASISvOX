import { Router } from 'express';
import { requireTeacherOrAdmin } from '../middleware/auth';

const router = Router();

router.get('/', requireTeacherOrAdmin, (req, res) => res.json({ message: 'Get assessments' }));
router.get('/:id', requireTeacherOrAdmin, (req, res) => res.json({ message: `Get assessment ${req.params.id}` }));
router.post('/', requireTeacherOrAdmin, (req, res) => res.json({ message: 'Create assessment' }));
router.put('/:id', requireTeacherOrAdmin, (req, res) => res.json({ message: `Update assessment ${req.params.id}` }));
router.delete('/:id', requireTeacherOrAdmin, (req, res) => res.json({ message: `Delete assessment ${req.params.id}` }));

export default router;