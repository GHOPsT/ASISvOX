import { Router } from 'express';
import { requireTeacherOrAdmin } from '../middleware/auth';

const router = Router();

router.get('/', requireTeacherOrAdmin, (req, res) => res.json({ message: 'Get reports' }));
router.post('/generate', requireTeacherOrAdmin, (req, res) => res.json({ message: 'Generate report' }));
router.get('/:id', requireTeacherOrAdmin, (req, res) => res.json({ message: `Get report ${req.params.id}` }));
router.get('/:id/download', requireTeacherOrAdmin, (req, res) => res.json({ message: `Download report ${req.params.id}` }));
router.delete('/:id', requireTeacherOrAdmin, (req, res) => res.json({ message: `Delete report ${req.params.id}` }));

export default router;