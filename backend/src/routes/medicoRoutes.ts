import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  create,
  list,
  remove,
  slotsOcupados,
  update,
} from '../controllers/medicoController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

export const medicoRouter = Router();

medicoRouter.get('/', authenticate, list);
medicoRouter.get('/:id/slots-ocupados', authenticate, slotsOcupados);
medicoRouter.post('/', authenticate, authorize(Role.ADMINISTRADOR), create);
medicoRouter.patch('/:id', authenticate, authorize(Role.ADMINISTRADOR), update);
medicoRouter.delete('/:id', authenticate, authorize(Role.ADMINISTRADOR), remove);
