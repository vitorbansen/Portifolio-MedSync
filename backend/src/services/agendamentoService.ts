import { Prisma, Role, StatusAgendamento } from '@prisma/client';
import { prisma } from '../lib/prisma';
import {
  CreateAgendamentoInput,
  ListAgendamentosQuery,
  UpdateStatusInput,
} from '../schemas/agendamentoSchemas';

export class AgendamentoError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const agendamentoSelect = {
  id: true,
  periodoInicio: true,
  periodoFim: true,
  status: true,
  criadoEm: true,
  medico: {
    select: {
      id: true,
      crm: true,
      especialidade: true,
      usuario: { select: { id: true, nome: true, email: true } },
    },
  },
  paciente: {
    select: {
      id: true,
      telefone: true,
      usuario: { select: { id: true, nome: true, email: true } },
    },
  },
} satisfies Prisma.AgendamentoSelect;

type Solicitante = { sub: string; role: Role };

async function getPacienteIdDoUsuario(usuarioId: string) {
  const paciente = await prisma.paciente.findUnique({ where: { usuarioId } });
  return paciente?.id ?? null;
}

async function getMedicoIdDoUsuario(usuarioId: string) {
  const medico = await prisma.medico.findUnique({ where: { usuarioId } });
  return medico?.id ?? null;
}

export async function createAgendamento(input: CreateAgendamentoInput, solicitante: Solicitante) {
  if (input.periodoInicio < new Date()) {
    throw new AgendamentoError(400, 'periodoInicio deve ser no futuro');
  }

  const medico = await prisma.medico.findUnique({ where: { id: input.medicoId } });
  if (!medico) throw new AgendamentoError(404, 'Médico não encontrado');

  let pacienteId: string;
  if (solicitante.role === Role.PACIENTE) {
    const proprioId = await getPacienteIdDoUsuario(solicitante.sub);
    if (!proprioId) throw new AgendamentoError(403, 'Usuário não é paciente');
    if (input.pacienteId && input.pacienteId !== proprioId) {
      throw new AgendamentoError(403, 'Paciente só pode agendar para si mesmo');
    }
    pacienteId = proprioId;
  } else {
    if (!input.pacienteId) {
      throw new AgendamentoError(400, 'pacienteId obrigatório para este perfil');
    }
    const paciente = await prisma.paciente.findUnique({ where: { id: input.pacienteId } });
    if (!paciente) throw new AgendamentoError(404, 'Paciente não encontrado');
    pacienteId = paciente.id;
  }

  // RN01: impedir sobreposição de horário para o mesmo médico
  const conflito = await prisma.agendamento.findFirst({
    where: {
      medicoId: input.medicoId,
      status: { in: [StatusAgendamento.AGENDADO, StatusAgendamento.CONFIRMADO] },
      periodoInicio: { lt: input.periodoFim },
      periodoFim: { gt: input.periodoInicio },
    },
  });
  if (conflito) {
    throw new AgendamentoError(409, 'Médico já possui agendamento neste horário');
  }

  return prisma.agendamento.create({
    data: {
      medicoId: input.medicoId,
      pacienteId,
      periodoInicio: input.periodoInicio,
      periodoFim: input.periodoFim,
    },
    select: agendamentoSelect,
  });
}

export async function listAgendamentos(query: ListAgendamentosQuery, solicitante: Solicitante) {
  const where: Prisma.AgendamentoWhereInput = {
    status: query.status,
    periodoInicio: query.de ? { gte: query.de } : undefined,
    periodoFim: query.ate ? { lte: query.ate } : undefined,
  };

  if (solicitante.role === Role.PACIENTE) {
    const pacienteId = await getPacienteIdDoUsuario(solicitante.sub);
    if (!pacienteId) return [];
    where.pacienteId = pacienteId;
  } else if (solicitante.role === Role.MEDICO) {
    const medicoId = await getMedicoIdDoUsuario(solicitante.sub);
    if (!medicoId) return [];
    where.medicoId = medicoId;
  } else {
    if (query.medicoId) where.medicoId = query.medicoId;
    if (query.pacienteId) where.pacienteId = query.pacienteId;
  }

  return prisma.agendamento.findMany({
    where,
    orderBy: { periodoInicio: 'asc' },
    select: agendamentoSelect,
  });
}

const transicoesValidas: Record<StatusAgendamento, StatusAgendamento[]> = {
  AGENDADO: [StatusAgendamento.CONFIRMADO, StatusAgendamento.CANCELADO],
  CONFIRMADO: [StatusAgendamento.REALIZADO, StatusAgendamento.CANCELADO],
  CANCELADO: [],
  REALIZADO: [],
};

export async function updateAgendamentoStatus(
  id: string,
  input: UpdateStatusInput,
  solicitante: Solicitante,
) {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id },
    include: { medico: true, paciente: true },
  });
  if (!agendamento) throw new AgendamentoError(404, 'Agendamento não encontrado');

  if (solicitante.role === Role.PACIENTE) {
    const pacienteId = await getPacienteIdDoUsuario(solicitante.sub);
    if (pacienteId !== agendamento.pacienteId) {
      throw new AgendamentoError(403, 'Acesso negado');
    }
    if (input.status !== StatusAgendamento.CANCELADO) {
      throw new AgendamentoError(403, 'Paciente só pode cancelar');
    }
  } else if (solicitante.role === Role.MEDICO) {
    const medicoId = await getMedicoIdDoUsuario(solicitante.sub);
    if (medicoId !== agendamento.medicoId) {
      throw new AgendamentoError(403, 'Acesso negado');
    }
  }

  const permitidas = transicoesValidas[agendamento.status];
  if (!permitidas.includes(input.status)) {
    throw new AgendamentoError(
      409,
      `Transição inválida: ${agendamento.status} → ${input.status}`,
    );
  }

  return prisma.agendamento.update({
    where: { id },
    data: { status: input.status },
    select: agendamentoSelect,
  });
}
