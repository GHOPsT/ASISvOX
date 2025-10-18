import { Router } from 'express';
import { requireTeacherOrAdmin } from '../middleware/auth';

const router = Router();

router.get('/dashboard', requireTeacherOrAdmin, (req, res) => res.json({ message: 'Get dashboard stats' }));
router.get('/class/:id', requireTeacherOrAdmin, (req, res) => res.json({ message: `Get class stats ${req.params.id}` }));
router.get('/teacher/:id', requireTeacherOrAdmin, (req, res) => res.json({ message: `Get teacher stats ${req.params.id}` }));
router.get('/student/:id', requireTeacherOrAdmin, (req, res) => res.json({ message: `Get student stats ${req.params.id}` }));
router.get('/attendance', requireTeacherOrAdmin, (req, res) => res.json({ message: 'Get attendance stats' }));
router.get('/grades', requireTeacherOrAdmin, (req, res) => res.json({ message: 'Get grades stats' }));

export default router;