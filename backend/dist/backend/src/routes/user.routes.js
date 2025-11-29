"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET - Listar usuarios (requiere admin)
router.get('/', auth_1.requireAdmin, user_controller_1.getUsers);
// GET - Obtener usuario por ID (requiere admin)
router.get('/:id', auth_1.requireAdmin, user_controller_1.getUserById);
// PUT - Actualizar usuario (requiere admin)
router.put('/:id', auth_1.requireAdmin, user_controller_1.updateUser);
// PUT - Actualizar max_teachers_allowed (SOLO admin_general)
router.put('/:id/max-teachers', auth_1.requireAdminGeneral, user_controller_1.updateMaxTeachersAllowed);
// POST - Activar usuario (SOLO admin_general)
router.post('/:id/activate', auth_1.requireAdminGeneral, user_controller_1.activateUser);
// POST - Desactivar usuario (SOLO admin_general)
router.post('/:id/deactivate', auth_1.requireAdminGeneral, user_controller_1.deactivateUser);
// DELETE - Eliminar usuario (SOLO admin_general)
router.delete('/:id', auth_1.requireAdminGeneral, user_controller_1.deleteUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map