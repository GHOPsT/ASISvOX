// ===============================
// RUTAS DE AUTENTICACIÓN
// ===============================

import { Router } from 'express';
import {
  login,
  register,
  logout,
  refreshToken,
  getCurrentUser,
} from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/logout
router.post('/logout', logout);

// POST /api/auth/refresh
router.post('/refresh', refreshToken);

// GET /api/auth/me (requiere autenticación)
router.get('/me', authMiddleware, getCurrentUser);

export default router;