import { Router } from 'express';
import { create, list, updateStatus } from '../controllers/agendamentoController';
import { authenticate } from '../middlewares/authMiddleware';

export const agendamentoRouter = Router();

agendamentoRouter.use(authenticate);
agendamentoRouter.post('/', create);
agendamentoRouter.get('/', list);
agendamentoRouter.patch('/:id/status', updateStatus);
