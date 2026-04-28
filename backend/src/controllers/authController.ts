import { NextFunction, Request, Response } from 'express';
import { registerSchema, loginSchema, updateMeSchema } from '../schemas/authSchemas';
import {
  deleteUsuario,
  getUsuarioById,
  loginUser,
  registerUser,
  updateUsuario,
} from '../services/authService';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);
    const result = await registerUser(data);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.usuario) return res.status(401).json({ message: 'Não autenticado' });
    const usuario = await getUsuarioById(req.usuario.sub);
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado' });
    return res.json(usuario);
  } catch (err) {
    return next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.usuario) return res.status(401).json({ message: 'Não autenticado' });
    const data = updateMeSchema.parse(req.body);
    const atualizado = await updateUsuario(req.usuario.sub, data);
    return res.json(atualizado);
  } catch (err) {
    return next(err);
  }
}

export async function deleteMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.usuario) return res.status(401).json({ message: 'Não autenticado' });
    await deleteUsuario(req.usuario.sub);
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
}
