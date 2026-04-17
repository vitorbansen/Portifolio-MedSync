import { z } from 'zod';

const horariosAtendimentoSchema = z
  .record(z.string(), z.array(z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/)))
  .optional();

export const createMedicoSchema = z.object({
  nome: z.string().min(2).max(120),
  email: z.string().email(),
  senha: z.string().min(8).max(72),
  crm: z.string().min(3).max(30),
  especialidade: z.string().min(2).max(80),
  horariosAtendimento: horariosAtendimentoSchema,
});

export const listMedicosSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  especialidade: z.string().trim().min(1).optional(),
});

export const medicoIdParamSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export type CreateMedicoInput = z.infer<typeof createMedicoSchema>;
export type ListMedicosQuery = z.infer<typeof listMedicosSchema>;
