import { Router } from 'express';
import { authRouter } from './authRoutes';
import { medicoRouter } from './medicoRoutes';
import { agendamentoRouter } from './agendamentoRoutes';

export const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));
router.use('/auth', authRouter);
router.use('/medicos', medicoRouter);
router.use('/agendamentos', agendamentoRouter);
