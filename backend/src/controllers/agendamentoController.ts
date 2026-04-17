import { NextFunction, Request, Response } from 'express';
import {
  agendamentoIdParamSchema,
  createAgendamentoSchema,
  listAgendamentosSchema,
  updateStatusSchema,
} from '../schemas/agendamentoSchemas';
import {
  createAgendamento as createService,
  listAgendamentos as listService,
  updateAgendamentoStatus as updateStatusService,
} from '../services/agendamentoService';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.usuario) return res.status(401).json({ message: 'Não autenticado' });
    const data = createAgendamentoSchema.parse(req.body);
    const result = await createService(data, { sub: req.usuario.sub, role: req.usuario.role });
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.usuario) return res.status(401).json({ message: 'Não autenticado' });
    const query = listAgendamentosSchema.parse(req.query);
    const result = await listService(query, { sub: req.usuario.sub, role: req.usuario.role });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.usuario) return res.status(401).json({ message: 'Não autenticado' });
    const { id } = agendamentoIdParamSchema.parse(req.params);
    const data = updateStatusSchema.parse(req.body);
    const result = await updateStatusService(id, data, {
      sub: req.usuario.sub,
      role: req.usuario.role,
    });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}
