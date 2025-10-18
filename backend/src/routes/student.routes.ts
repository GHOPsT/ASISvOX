import { Router } from 'express';
import { requireTeacherOrAdmin } from '../middleware/auth';

const router = Router();

router.get('/', requireTeacherOrAdmin, (req, res) => res.json({ message: 'Get students' }));
router.get('/:id', requireTeacherOrAdmin, (req, res) => res.json({ message: `Get student ${req.params.id}` }));
router.post('/', requireTeacherOrAdmin, (req, res) => res.json({ message: 'Create student' }));
router.put('/:id', requireTeacherOrAdmin, (req, res) => res.json({ message: `Update student ${req.params.id}` }));
router.delete('/:id', requireTeacherOrAdmin, (req, res) => res.json({ message: `Delete student ${req.params.id}` }));

export default router;