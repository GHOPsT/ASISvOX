import { Router } from 'express';
import { requireAdminGeneral } from '../middleware/auth';
import {
  getEntities,
  getEntityById,
  createEntity,
  updateEntity,
  deleteEntity,
  activateEntity,
  deactivateEntity,
  getEntityStats,
} from '../controllers/entity.controller';

const router = Router();

// Todas las rutas están protegidas con requireAdminGeneral
// Solo admin_general puede acceder a entidades

// GET - Listar entidades
router.get('/', requireAdminGeneral, getEntities);

// GET - Obtener entidad por ID
router.get('/:id', requireAdminGeneral, getEntityById);

// POST - Crear entidad
router.post('/', requireAdminGeneral, createEntity);

// PUT - Actualizar entidad
router.put('/:id', requireAdminGeneral, updateEntity);

// DELETE - Eliminar entidad
router.delete('/:id', requireAdminGeneral, deleteEntity);

// POST - Activar entidad
router.post('/:id/activate', requireAdminGeneral, activateEntity);

// POST - Desactivar entidad
router.post('/:id/deactivate', requireAdminGeneral, deactivateEntity);

// GET - Obtener estadísticas de una entidad
router.get('/:id/stats', requireAdminGeneral, getEntityStats);

export default router;
