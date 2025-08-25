import { Router } from 'express';
import { login, register, refresh, me } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { loginSchema, registerSchema, refreshTokenSchema } from '../schemas/auth';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.post('/refresh', validate(refreshTokenSchema), refresh);
router.get('/me', authenticateToken, me);

export default router;