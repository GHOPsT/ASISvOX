import { Router } from 'express';
import { requireTeacherOrAdmin } from '../middleware/auth';

const router = Router();

router.get('/', requireTeacherOrAdmin, (req, res) => res.json({ message: 'Get grades' }));
router.post('/', requireTeacherOrAdmin, (req, res) => res.json({ message: 'Record grade' }));
router.post('/bulk', requireTeacherOrAdmin, (req, res) => res.json({ message: 'Record grades bulk' }));
router.put('/:id', requireTeacherOrAdmin, (req, res) => res.json({ message: `Update grade ${req.params.id}` }));
router.delete('/:id', requireTeacherOrAdmin, (req, res) => res.json({ message: `Delete grade ${req.params.id}` }));

export default router;