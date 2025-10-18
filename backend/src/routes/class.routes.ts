import { Router } from 'express';
import { requireTeacherOrAdmin } from '../middleware/auth';

const router = Router();

router.get('/', requireTeacherOrAdmin, (req, res) => res.json({ message: 'Get classes' }));
router.get('/:id', requireTeacherOrAdmin, (req, res) => res.json({ message: `Get class ${req.params.id}` }));
router.post('/', requireTeacherOrAdmin, (req, res) => res.json({ message: 'Create class' }));
router.put('/:id', requireTeacherOrAdmin, (req, res) => res.json({ message: `Update class ${req.params.id}` }));
router.delete('/:id', requireTeacherOrAdmin, (req, res) => res.json({ message: `Delete class ${req.params.id}` }));

export default router;