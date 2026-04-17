import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AuthError } from '../services/authService';
import { MedicoError } from '../services/medicoService';
import { AgendamentoError } from '../services/agendamentoService';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Dados inválidos',
      errors: err.flatten().fieldErrors,
    });
  }

  if (
    err instanceof AuthError ||
    err instanceof MedicoError ||
    err instanceof AgendamentoError
  ) {
    return res.status(err.status).json({ message: err.message });
  }

  console.error('Erro não tratado:', err);
  return res.status(500).json({ message: 'Erro interno do servidor' });
}
