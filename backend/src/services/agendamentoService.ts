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
      nome: true,
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

async function resolverPacienteIdPorNomeTelefone(nome: string, telefone: string) {
  const existente = await prisma.paciente.findFirst({ where: { telefone } });
  if (existente) return existente.id;
  const criado = await prisma.paciente.create({ data: { nome, telefone } });
  return criado.id;
}

export async function createAgendamento(input: CreateAgendamentoInput, solicitante: Solicitante) {
  if (input.periodoInicio < new Date()) {
    throw new AgendamentoError(400, 'periodoInicio deve ser no futuro');
  }

  let medicoId: string;
  let pacienteId: string;

  if (solicitante.role === Role.PACIENTE) {
    if (!input.medicoId) {
      throw new AgendamentoError(400, 'medicoId é obrigatório');
    }
    const medico = await prisma.medico.findUnique({ where: { id: input.medicoId } });
    if (!medico) throw new AgendamentoError(404, 'Médico não encontrado');
    medicoId = medico.id;

    const proprioId = await getPacienteIdDoUsuario(solicitante.sub);
    if (!proprioId) throw new AgendamentoError(403, 'Usuário não é paciente');
    if (input.pacienteId && input.pacienteId !== proprioId) {
      throw new AgendamentoError(403, 'Paciente só pode agendar para si mesmo');
    }
    pacienteId = proprioId;
  } else if (solicitante.role === Role.MEDICO) {
    const proprioMedicoId = await getMedicoIdDoUsuario(solicitante.sub);
    if (!proprioMedicoId) throw new AgendamentoError(403, 'Usuário não é médico');
    if (input.medicoId && input.medicoId !== proprioMedicoId) {
      throw new AgendamentoError(403, 'Médico só pode agendar para si mesmo');
    }
    medicoId = proprioMedicoId;

    if (!input.pacienteNome || !input.pacienteTelefone) {
      throw new AgendamentoError(
        400,
        'pacienteNome e pacienteTelefone são obrigatórios para agendamento criado pelo médico',
      );
    }
    pacienteId = await resolverPacienteIdPorNomeTelefone(
      input.pacienteNome,
      input.pacienteTelefone,
    );
  } else {
    if (!input.medicoId) {
      throw new AgendamentoError(400, 'medicoId é obrigatório');
    }
    const medico = await prisma.medico.findUnique({ where: { id: input.medicoId } });
    if (!medico) throw new AgendamentoError(404, 'Médico não encontrado');
    medicoId = medico.id;

    if (input.pacienteId) {
      const paciente = await prisma.paciente.findUnique({ where: { id: input.pacienteId } });
      if (!paciente) throw new AgendamentoError(404, 'Paciente não encontrado');
      pacienteId = paciente.id;
    } else if (input.pacienteNome && input.pacienteTelefone) {
      pacienteId = await resolverPacienteIdPorNomeTelefone(
        input.pacienteNome,
        input.pacienteTelefone,
      );
    } else {
      throw new AgendamentoError(
        400,
        'informe pacienteId ou (pacienteNome + pacienteTelefone)',
      );
    }
  }

  // RN01: impedir sobreposição de horário para o mesmo médico
  const conflito = await prisma.agendamento.findFirst({
    where: {
      medicoId,
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
      medicoId,
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
