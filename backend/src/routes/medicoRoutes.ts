import { Router } from 'express';
import { Role } from '@prisma/client';
import { create, list, remove } from '../controllers/medicoController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

export const medicoRouter = Router();

medicoRouter.get('/', authenticate, list);
medicoRouter.post('/', authenticate, authorize(Role.ADMINISTRADOR), create);
medicoRouter.delete('/:id', authenticate, authorize(Role.ADMINISTRADOR), remove);
