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

export const updateMedicoSchema = z
  .object({
    nome: z.string().min(2).max(120).optional(),
    email: z.string().email().optional(),
    crm: z.string().min(3).max(30).optional(),
    especialidade: z.string().min(2).max(80).optional(),
    horariosAtendimento: z
      .record(z.string(), z.array(z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/)))
      .nullable()
      .optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'Informe ao menos um campo para atualizar',
  });

export const listMedicosSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  especialidade: z.string().trim().min(1).optional(),
});

export const medicoIdParamSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export type CreateMedicoInput = z.infer<typeof createMedicoSchema>;
export type UpdateMedicoInput = z.infer<typeof updateMedicoSchema>;
export type ListMedicosQuery = z.infer<typeof listMedicosSchema>;
