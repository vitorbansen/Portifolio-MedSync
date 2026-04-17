import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AuthError } from '../services/authService';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Dados inválidos',
      errors: err.flatten().fieldErrors,
    });
  }

  if (err instanceof AuthError) {
    return res.status(err.status).json({ message: err.message });
  }

  console.error('Erro não tratado:', err);
  return res.status(500).json({ message: 'Erro interno do servidor' });
}
