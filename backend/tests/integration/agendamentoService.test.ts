import bcrypt from 'bcrypt';
import { Role, StatusAgendamento } from '@prisma/client';
import { prisma } from '../../src/lib/prisma';
import {
  AgendamentoError,
  createAgendamento,
  updateAgendamentoStatus,
} from '../../src/services/agendamentoService';
import { closeDatabase, resetDatabase } from './helpers';

async function criarMedico() {
  const senhaHash = await bcrypt.hash('bench123', 4);
  const usuario = await prisma.usuario.create({
    data: {
      nome: 'Dra. Teste',
      email: `medico-${Date.now()}@medsync.local`,
      senhaHash,
      role: Role.MEDICO,
      medico: {
        create: {
          crm: `CRM-${Math.random().toString(36).slice(2, 8)}`,
          especialidade: 'Clínica Geral',
        },
      },
    },
    include: { medico: true },
  });
  return { usuario, medico: usuario.medico! };
}

async function criarPaciente() {
  const senhaHash = await bcrypt.hash('bench123', 4);
  const usuario = await prisma.usuario.create({
    data: {
      nome: 'Paciente Teste',
      email: `paciente-${Date.now()}-${Math.random()}@medsync.local`,
      senhaHash,
      role: Role.PACIENTE,
      paciente: {
        create: { nome: 'Paciente Teste', telefone: `11${Math.floor(Math.random() * 1e9)}` },
      },
    },
    include: { paciente: true },
  });
  return { usuario, paciente: usuario.paciente! };
}

function dataFutura(offsetMs = 0) {
  return new Date(Date.now() + 24 * 60 * 60 * 1000 + offsetMs);
}

beforeEach(resetDatabase);
afterAll(closeDatabase);

describe('agendamentoService.createAgendamento', () => {
  it('cria agendamento quando paciente solicita horário livre', async () => {
    const { medico } = await criarMedico();
    const { usuario: usuarioPaciente } = await criarPaciente();

    const inicio = dataFutura();
    const fim = new Date(inicio.getTime() + 30 * 60 * 1000);

    const result = await createAgendamento(
      { medicoId: medico.id, periodoInicio: inicio, periodoFim: fim },
      { sub: usuarioPaciente.id, role: Role.PACIENTE },
    );

    expect(result.status).toBe(StatusAgendamento.AGENDADO);
    expect(result.medico.id).toBe(medico.id);
  });

  it('retorna 409 quando horário se sobrepõe a outro AGENDADO do mesmo médico', async () => {
    const { medico } = await criarMedico();
    const { usuario: p1 } = await criarPaciente();
    const { usuario: p2 } = await criarPaciente();

    const inicio = dataFutura();
    const fim = new Date(inicio.getTime() + 30 * 60 * 1000);

    await createAgendamento(
      { medicoId: medico.id, periodoInicio: inicio, periodoFim: fim },
      { sub: p1.id, role: Role.PACIENTE },
    );

    const sobreposto = new Date(inicio.getTime() + 10 * 60 * 1000);
    const fimSobreposto = new Date(sobreposto.getTime() + 30 * 60 * 1000);

    await expect(
      createAgendamento(
        { medicoId: medico.id, periodoInicio: sobreposto, periodoFim: fimSobreposto },
        { sub: p2.id, role: Role.PACIENTE },
      ),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('permite novo agendamento após CANCELADO no mesmo horário', async () => {
    const { medico } = await criarMedico();
    const { usuario: p1 } = await criarPaciente();
    const { usuario: p2 } = await criarPaciente();

    const inicio = dataFutura();
    const fim = new Date(inicio.getTime() + 30 * 60 * 1000);

    const primeiro = await createAgendamento(
      { medicoId: medico.id, periodoInicio: inicio, periodoFim: fim },
      { sub: p1.id, role: Role.PACIENTE },
    );

    await updateAgendamentoStatus(
      primeiro.id,
      { status: StatusAgendamento.CANCELADO },
      { sub: p1.id, role: Role.PACIENTE },
    );

    const novo = await createAgendamento(
      { medicoId: medico.id, periodoInicio: inicio, periodoFim: fim },
      { sub: p2.id, role: Role.PACIENTE },
    );
    expect(novo.status).toBe(StatusAgendamento.AGENDADO);
  });

  it('médico agendando para si cria paciente walk-in pelo nome+telefone', async () => {
    const { usuario: usuarioMedico, medico } = await criarMedico();

    const inicio = dataFutura();
    const fim = new Date(inicio.getTime() + 30 * 60 * 1000);

    const result = await createAgendamento(
      {
        periodoInicio: inicio,
        periodoFim: fim,
        pacienteNome: 'João Silva',
        pacienteTelefone: '11987654321',
      },
      { sub: usuarioMedico.id, role: Role.MEDICO },
    );

    expect(result.medico.id).toBe(medico.id);
    expect(result.paciente.nome).toBe('João Silva');
    expect(result.paciente.telefone).toBe('11987654321');
  });

  it('rejeita periodoInicio no passado com 400', async () => {
    const { medico } = await criarMedico();
    const { usuario: p1 } = await criarPaciente();
    const passado = new Date(Date.now() - 60 * 1000);
    const fim = new Date(passado.getTime() + 30 * 60 * 1000);

    await expect(
      createAgendamento(
        { medicoId: medico.id, periodoInicio: passado, periodoFim: fim },
        { sub: p1.id, role: Role.PACIENTE },
      ),
    ).rejects.toMatchObject({ status: 400 });
  });
});

describe('agendamentoService.updateAgendamentoStatus', () => {
  it('rejeita transição inválida AGENDADO → REALIZADO', async () => {
    const { medico } = await criarMedico();
    const { usuario: p } = await criarPaciente();
    const inicio = dataFutura();
    const fim = new Date(inicio.getTime() + 30 * 60 * 1000);

    const ag = await createAgendamento(
      { medicoId: medico.id, periodoInicio: inicio, periodoFim: fim },
      { sub: p.id, role: Role.PACIENTE },
    );

    await expect(
      updateAgendamentoStatus(
        ag.id,
        { status: StatusAgendamento.REALIZADO },
        { sub: p.id, role: Role.PACIENTE },
      ),
    ).rejects.toBeInstanceOf(AgendamentoError);
  });

  it('paciente só pode cancelar, não confirmar', async () => {
    const { medico } = await criarMedico();
    const { usuario: p } = await criarPaciente();
    const inicio = dataFutura();
    const fim = new Date(inicio.getTime() + 30 * 60 * 1000);

    const ag = await createAgendamento(
      { medicoId: medico.id, periodoInicio: inicio, periodoFim: fim },
      { sub: p.id, role: Role.PACIENTE },
    );

    await expect(
      updateAgendamentoStatus(
        ag.id,
        { status: StatusAgendamento.CONFIRMADO },
        { sub: p.id, role: Role.PACIENTE },
      ),
    ).rejects.toMatchObject({ status: 403 });
  });
});
