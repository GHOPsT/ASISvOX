import { Router } from 'express';
import { 
  getUsers, 
  getUserById, 
  updateUser, 
  updateMaxTeachersAllowed,
  activateUser, 
  deactivateUser, 
  deleteUser 
} from '../controllers/user.controller';
import { requireAdmin, requireAdminGeneral } from '../middleware/auth';

const router = Router();

// GET - Listar usuarios (requiere admin)
router.get('/', requireAdmin, getUsers);

// GET - Obtener usuario por ID (requiere admin)
router.get('/:id', requireAdmin, getUserById);

// PUT - Actualizar usuario (requiere admin)
router.put('/:id', requireAdmin, updateUser);

// PUT - Actualizar max_teachers_allowed (SOLO admin_general)
router.put('/:id/max-teachers', requireAdminGeneral, updateMaxTeachersAllowed);

// POST - Activar usuario (SOLO admin_general)
router.post('/:id/activate', requireAdminGeneral, activateUser);

// POST - Desactivar usuario (SOLO admin_general)
router.post('/:id/deactivate', requireAdminGeneral, deactivateUser);

// DELETE - Eliminar usuario (SOLO admin_general)
router.delete('/:id', requireAdminGeneral, deleteUser);

export default router;