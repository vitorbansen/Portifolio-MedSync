import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { RegisterInput, LoginInput } from '../schemas/authSchemas';

const BCRYPT_ROUNDS = 10;

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function registerUser(input: RegisterInput) {
  const emailJaUsado = await prisma.usuario.findUnique({ where: { email: input.email } });
  if (emailJaUsado) {
    throw new AuthError(409, 'E-mail já cadastrado');
  }

  const senhaHash = await bcrypt.hash(input.senha, BCRYPT_ROUNDS);
  const role: Role = (input.role as Role) ?? Role.PACIENTE;

  const usuario = await prisma.usuario.create({
    data: {
      nome: input.nome,
      email: input.email,
      senhaHash,
      role,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      criadoEm: true,
    },
  });

  const token = signToken({ sub: usuario.id, email: usuario.email, role: usuario.role });

  return { usuario, token };
}

export async function loginUser(input: LoginInput) {
  const usuario = await prisma.usuario.findUnique({ where: { email: input.email } });
  if (!usuario) {
    throw new AuthError(401, 'Credenciais inválidas');
  }

  const senhaCorreta = await bcrypt.compare(input.senha, usuario.senhaHash);
  if (!senhaCorreta) {
    throw new AuthError(401, 'Credenciais inválidas');
  }

  const token = signToken({ sub: usuario.id, email: usuario.email, role: usuario.role });

  return {
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
    },
    token,
  };
}

export async function getUsuarioById(id: string) {
  return prisma.usuario.findUnique({
    where: { id },
    select: { id: true, nome: true, email: true, role: true, criadoEm: true },
  });
}
