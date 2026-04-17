import { z } from 'zod';

export const createAgendamentoSchema = z
  .object({
    medicoId: z.string().uuid('medicoId inválido').optional(),
    pacienteId: z.string().uuid('pacienteId inválido').optional(),
    pacienteNome: z.string().trim().min(2).max(120).optional(),
    pacienteTelefone: z.string().trim().min(8).max(20).optional(),
    periodoInicio: z.coerce.date(),
    periodoFim: z.coerce.date(),
  })
  .refine((d) => d.periodoFim > d.periodoInicio, {
    message: 'periodoFim deve ser maior que periodoInicio',
    path: ['periodoFim'],
  });

export const listAgendamentosSchema = z.object({
  medicoId: z.string().uuid().optional(),
  pacienteId: z.string().uuid().optional(),
  status: z.enum(['AGENDADO', 'CONFIRMADO', 'CANCELADO', 'REALIZADO']).optional(),
  de: z.coerce.date().optional(),
  ate: z.coerce.date().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['CONFIRMADO', 'CANCELADO', 'REALIZADO']),
});

export const agendamentoIdParamSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export type CreateAgendamentoInput = z.infer<typeof createAgendamentoSchema>;
export type ListAgendamentosQuery = z.infer<typeof listAgendamentosSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
