"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const entity_controller_1 = require("../controllers/entity.controller");
const router = (0, express_1.Router)();
// Todas las rutas están protegidas con requireAdminGeneral
// Solo admin_general puede acceder a entidades
// GET - Listar entidades
router.get('/', auth_1.requireAdminGeneral, entity_controller_1.getEntities);
// GET - Obtener entidad por ID
router.get('/:id', auth_1.requireAdminGeneral, entity_controller_1.getEntityById);
// POST - Crear entidad
router.post('/', auth_1.requireAdminGeneral, entity_controller_1.createEntity);
// PUT - Actualizar entidad
router.put('/:id', auth_1.requireAdminGeneral, entity_controller_1.updateEntity);
// DELETE - Eliminar entidad
router.delete('/:id', auth_1.requireAdminGeneral, entity_controller_1.deleteEntity);
// POST - Activar entidad
router.post('/:id/activate', auth_1.requireAdminGeneral, entity_controller_1.activateEntity);
// POST - Desactivar entidad
router.post('/:id/deactivate', auth_1.requireAdminGeneral, entity_controller_1.deactivateEntity);
// GET - Obtener estadísticas de una entidad
router.get('/:id/stats', auth_1.requireAdminGeneral, entity_controller_1.getEntityStats);
exports.default = router;
//# sourceMappingURL=entity.routes.js.map