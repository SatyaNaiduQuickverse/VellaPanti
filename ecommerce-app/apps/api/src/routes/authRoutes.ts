import { Router } from 'express';
import { login, register, refresh, me, forgotPassword, resetPassword, sendPhoneOtp, verifyPhoneOtp } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { loginSchema, registerSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema, sendPhoneOtpSchema, verifyPhoneOtpSchema } from '../schemas/auth';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.post('/refresh', validate(refreshTokenSchema), refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/send-phone-otp', validate(sendPhoneOtpSchema), sendPhoneOtp);
router.post('/verify-phone-otp', validate(verifyPhoneOtpSchema), verifyPhoneOtp);
router.get('/me', authenticateToken, me);

export default router;