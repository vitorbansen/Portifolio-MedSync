import { NextFunction, Request, Response } from 'express';
import {
  createMedicoSchema,
  listMedicosSchema,
  medicoIdParamSchema,
} from '../schemas/medicoSchemas';
import {
  createMedico as createMedicoService,
  deleteMedico as deleteMedicoService,
  listMedicos as listMedicosService,
} from '../services/medicoService';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createMedicoSchema.parse(req.body);
    const medico = await createMedicoService(data);
    return res.status(201).json(medico);
  } catch (err) {
    return next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listMedicosSchema.parse(req.query);
    const medicos = await listMedicosService(query);
    return res.json(medicos);
  } catch (err) {
    return next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = medicoIdParamSchema.parse(req.params);
    await deleteMedicoService(id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
