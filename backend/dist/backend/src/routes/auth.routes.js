"use strict";
// ===============================
// RUTAS DE AUTENTICACIÓN
// ===============================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/auth/login
router.post('/login', auth_controller_1.login);
// POST /api/auth/register
router.post('/register', auth_controller_1.register);
// POST /api/auth/logout
router.post('/logout', auth_controller_1.logout);
// POST /api/auth/refresh
router.post('/refresh', auth_controller_1.refreshToken);
// GET /api/auth/me (requiere autenticación)
router.get('/me', auth_1.authMiddleware, auth_controller_1.getCurrentUser);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map