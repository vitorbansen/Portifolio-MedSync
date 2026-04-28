import { Router } from 'express';
import { deleteMe, login, me, register, updateMe } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';
import { authLimiter } from '../middlewares/rateLimit';

export const authRouter = Router();

authRouter.post('/register', authLimiter, register);
authRouter.post('/login', authLimiter, login);
authRouter.get('/me', authenticate, me);
authRouter.patch('/me', authenticate, updateMe);
authRouter.delete('/me', authenticate, deleteMe);
