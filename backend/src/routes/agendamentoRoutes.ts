import { Router } from 'express';
import { create, list, reagendar, updateStatus } from '../controllers/agendamentoController';
import { authenticate } from '../middlewares/authMiddleware';

export const agendamentoRouter = Router();

agendamentoRouter.use(authenticate);
agendamentoRouter.post('/', create);
agendamentoRouter.get('/', list);
agendamentoRouter.patch('/:id/reagendar', reagendar);
agendamentoRouter.patch('/:id/status', updateStatus);
