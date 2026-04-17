import { Router } from 'express';
import { login, me, register } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', authenticate, me);
