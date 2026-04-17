import { NextFunction, Request, Response } from 'express';
import {
  createMedicoSchema,
  listMedicosSchema,
  medicoIdParamSchema,
  updateMedicoSchema,
} from '../schemas/medicoSchemas';
import {
  createMedico as createMedicoService,
  deleteMedico as deleteMedicoService,
  listMedicos as listMedicosService,
  listSlotsOcupados as listSlotsOcupadosService,
  updateMedico as updateMedicoService,
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

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = medicoIdParamSchema.parse(req.params);
    const data = updateMedicoSchema.parse(req.body);
    const medico = await updateMedicoService(id, data);
    return res.json(medico);
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

export async function slotsOcupados(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = medicoIdParamSchema.parse(req.params);
    const ocupados = await listSlotsOcupadosService(id);
    return res.json(ocupados);
  } catch (err) {
    return next(err);
  }
}
