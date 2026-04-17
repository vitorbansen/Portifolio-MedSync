import { z } from 'zod';

export const registerSchema = z
  .object({
    nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(120),
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(8, 'Senha deve ter ao menos 8 caracteres').max(72),
    telefone: z.string().min(8, 'Telefone obrigatório').max(20).optional(),
    role: z.enum(['PACIENTE', 'MEDICO', 'ADMINISTRADOR']).optional(),
  })
  .refine((d) => (d.role ?? 'PACIENTE') !== 'PACIENTE' || !!d.telefone, {
    message: 'Telefone é obrigatório para pacientes',
    path: ['telefone'],
  });

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
