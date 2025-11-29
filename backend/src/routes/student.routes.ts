import { Router } from 'express';
import { requireTeacherOrAdmin } from '../middleware/auth';
import { query } from '../config/connection';

const router = Router();

router.get('/', requireTeacherOrAdmin, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, first_name, last_name, identification_number FROM students LIMIT 10',
      []
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: (error as any).message });
  }
});

router.get('/:id', requireTeacherOrAdmin, (req, res) => res.json({ message: `Get student ${req.params.id}` }));
router.post('/', requireTeacherOrAdmin, (req, res) => res.json({ message: 'Create student' }));
router.put('/:id', requireTeacherOrAdmin, (req, res) => res.json({ message: `Update student ${req.params.id}` }));
router.delete('/:id', requireTeacherOrAdmin, (req, res) => res.json({ message: `Delete student ${req.params.id}` }));

export default router;