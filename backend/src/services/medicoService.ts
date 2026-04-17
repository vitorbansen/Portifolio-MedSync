import bcrypt from 'bcrypt';
import { Prisma, Role, StatusAgendamento } from '@prisma/client';
import { prisma } from '../lib/prisma';
import {
  CreateMedicoInput,
  ListMedicosQuery,
  UpdateMedicoInput,
} from '../schemas/medicoSchemas';

const BCRYPT_ROUNDS = 10;

export class MedicoError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const medicoSelect = {
  id: true,
  crm: true,
  especialidade: true,
  horariosAtendimento: true,
  usuario: {
    select: { id: true, nome: true, email: true, role: true, criadoEm: true },
  },
} satisfies Prisma.MedicoSelect;

export async function createMedico(input: CreateMedicoInput) {
  const emailJaUsado = await prisma.usuario.findUnique({ where: { email: input.email } });
  if (emailJaUsado) {
    throw new MedicoError(409, 'E-mail já cadastrado');
  }

  const crmJaUsado = await prisma.medico.findUnique({ where: { crm: input.crm } });
  if (crmJaUsado) {
    throw new MedicoError(409, 'CRM já cadastrado');
  }

  const senhaHash = await bcrypt.hash(input.senha, BCRYPT_ROUNDS);

  const medico = await prisma.medico.create({
    data: {
      crm: input.crm,
      especialidade: input.especialidade,
      horariosAtendimento: input.horariosAtendimento,
      usuario: {
        create: {
          nome: input.nome,
          email: input.email,
          senhaHash,
          role: Role.MEDICO,
        },
      },
    },
    select: medicoSelect,
  });

  return medico;
}

export async function listMedicos(query: ListMedicosQuery) {
  return prisma.medico.findMany({
    where: {
      especialidade: query.especialidade
        ? { contains: query.especialidade, mode: 'insensitive' }
        : undefined,
      usuario: query.nome
        ? { nome: { contains: query.nome, mode: 'insensitive' } }
        : undefined,
    },
    orderBy: { usuario: { nome: 'asc' } },
    select: medicoSelect,
  });
}

export async function updateMedico(id: string, input: UpdateMedicoInput) {
  const medico = await prisma.medico.findUnique({
    where: { id },
    include: { usuario: true },
  });
  if (!medico) {
    throw new MedicoError(404, 'Médico não encontrado');
  }

  if (input.crm && input.crm !== medico.crm) {
    const crmJaUsado = await prisma.medico.findUnique({ where: { crm: input.crm } });
    if (crmJaUsado) {
      throw new MedicoError(409, 'CRM já cadastrado');
    }
  }

  if (input.email && input.email !== medico.usuario.email) {
    const emailJaUsado = await prisma.usuario.findUnique({ where: { email: input.email } });
    if (emailJaUsado) {
      throw new MedicoError(409, 'E-mail já cadastrado');
    }
  }

  const atualizaUsuario = input.nome !== undefined || input.email !== undefined;

  return prisma.medico.update({
    where: { id },
    data: {
      crm: input.crm,
      especialidade: input.especialidade,
      horariosAtendimento:
        input.horariosAtendimento === undefined
          ? undefined
          : input.horariosAtendimento ?? Prisma.DbNull,
      usuario: atualizaUsuario
        ? { update: { nome: input.nome, email: input.email } }
        : undefined,
    },
    select: medicoSelect,
  });
}

export async function deleteMedico(id: string) {
  const medico = await prisma.medico.findUnique({ where: { id } });
  if (!medico) {
    throw new MedicoError(404, 'Médico não encontrado');
  }

  await prisma.usuario.delete({ where: { id: medico.usuarioId } });
}

export async function listSlotsOcupados(medicoId: string) {
  const medico = await prisma.medico.findUnique({ where: { id: medicoId } });
  if (!medico) {
    throw new MedicoError(404, 'Médico não encontrado');
  }

  const agora = new Date();
  const agendamentos = await prisma.agendamento.findMany({
    where: {
      medicoId,
      status: { in: [StatusAgendamento.AGENDADO, StatusAgendamento.CONFIRMADO] },
      periodoFim: { gt: agora },
    },
    select: { periodoInicio: true, periodoFim: true },
    orderBy: { periodoInicio: 'asc' },
  });
  return agendamentos;
}
