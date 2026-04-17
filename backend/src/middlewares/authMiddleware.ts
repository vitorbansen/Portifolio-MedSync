import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { verifyToken, JwtPayload } from '../lib/jwt';

declare global {
  namespace Express {
    interface Request {
      usuario?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token ausente' });
  }

  const token = header.slice(7);
  try {
    req.usuario = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.status(401).json({ message: 'Não autenticado' });
    }
    if (!roles.includes(req.usuario.role)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    return next();
  };
}
