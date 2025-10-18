import { Router } from 'express';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Placeholder routes - implementar controladores según necesidad
router.get('/', requireAdmin, (req, res) => res.json({ message: 'Get users' }));
router.get('/:id', requireAdmin, (req, res) => res.json({ message: `Get user ${req.params.id}` }));
router.put('/:id', requireAdmin, (req, res) => res.json({ message: `Update user ${req.params.id}` }));
router.delete('/:id', requireAdmin, (req, res) => res.json({ message: `Delete user ${req.params.id}` }));

export default router;