import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { RegisterInput, LoginInput, UpdateMeInput } from '../schemas/authSchemas';

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
      paciente:
        role === Role.PACIENTE
          ? { create: { nome: input.nome, telefone: input.telefone! } }
          : undefined,
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
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      criadoEm: true,
      paciente: { select: { telefone: true } },
    },
  });
  if (!usuario) return null;
  const { paciente, ...rest } = usuario;
  return { ...rest, telefone: paciente?.telefone ?? null };
}

export async function updateUsuario(id: string, input: UpdateMeInput) {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    include: { paciente: true },
  });
  if (!usuario) {
    throw new AuthError(404, 'Usuário não encontrado');
  }

  if (input.email && input.email !== usuario.email) {
    const emailJaUsado = await prisma.usuario.findUnique({ where: { email: input.email } });
    if (emailJaUsado) {
      throw new AuthError(409, 'E-mail já cadastrado');
    }
  }

  if (input.telefone && usuario.role !== Role.PACIENTE) {
    throw new AuthError(400, 'Telefone só pode ser atualizado por pacientes');
  }

  await prisma.usuario.update({
    where: { id },
    data: {
      nome: input.nome,
      email: input.email,
      paciente:
        usuario.role === Role.PACIENTE && (input.telefone || input.nome)
          ? {
              update: {
                telefone: input.telefone,
                nome: input.nome,
              },
            }
          : undefined,
    },
  });

  return getUsuarioById(id);
}

export async function deleteUsuario(id: string) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) {
    throw new AuthError(404, 'Usuário não encontrado');
  }
  await prisma.usuario.delete({ where: { id } });
}
