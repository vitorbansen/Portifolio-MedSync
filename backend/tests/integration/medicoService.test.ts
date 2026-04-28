import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { prisma } from '../../src/lib/prisma';
import {
  MedicoError,
  createMedico,
  deleteMedico,
  listMedicos,
  listSlotsOcupados,
  updateMedico,
} from '../../src/services/medicoService';
import { createAgendamento } from '../../src/services/agendamentoService';
import { closeDatabase, resetDatabase } from './helpers';

async function criarPaciente(telefone = '11999990000') {
  const senhaHash = await bcrypt.hash('senha12345', 4);
  return prisma.usuario.create({
    data: {
      nome: 'Paciente',
      email: `p-${Date.now()}-${Math.random()}@medsync.local`,
      senhaHash,
      role: Role.PACIENTE,
      paciente: { create: { nome: 'Paciente', telefone } },
    },
  });
}

function dataFutura(offsetMs = 0) {
  return new Date(Date.now() + 24 * 60 * 60 * 1000 + offsetMs);
}

beforeEach(resetDatabase);
afterAll(closeDatabase);

describe('medicoService.createMedico', () => {
  it('cria médico com usuário associado', async () => {
    const medico = await createMedico({
      nome: 'Dra. Nova',
      email: 'nova@medsync.local',
      senha: 'senha12345',
      crm: 'CRM-12345',
      especialidade: 'Cardiologia',
    });
    expect(medico.usuario.role).toBe(Role.MEDICO);
    expect(medico.crm).toBe('CRM-12345');
  });

  it('rejeita email duplicado com 409', async () => {
    await createMedico({
      nome: 'Dra. Nova',
      email: 'dup@medsync.local',
      senha: 'senha12345',
      crm: 'CRM-A',
      especialidade: 'Cardiologia',
    });
    await expect(
      createMedico({
        nome: 'Dr. Outro',
        email: 'dup@medsync.local',
        senha: 'senha12345',
        crm: 'CRM-B',
        especialidade: 'Pediatria',
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('rejeita CRM duplicado com 409', async () => {
    await createMedico({
      nome: 'Dra. Nova',
      email: 'a@medsync.local',
      senha: 'senha12345',
      crm: 'CRM-UNICO',
      especialidade: 'Cardiologia',
    });
    await expect(
      createMedico({
        nome: 'Dr. Outro',
        email: 'b@medsync.local',
        senha: 'senha12345',
        crm: 'CRM-UNICO',
        especialidade: 'Pediatria',
      }),
    ).rejects.toMatchObject({ status: 409 });
  });
});

describe('medicoService.listMedicos', () => {
  it('filtra por especialidade case-insensitive', async () => {
    await createMedico({
      nome: 'Dr. Cardio',
      email: 'cardio@medsync.local',
      senha: 'senha12345',
      crm: 'CRM-C1',
      especialidade: 'Cardiologia',
    });
    await createMedico({
      nome: 'Dr. Ped',
      email: 'ped@medsync.local',
      senha: 'senha12345',
      crm: 'CRM-P1',
      especialidade: 'Pediatria',
    });

    const result = await listMedicos({ especialidade: 'cardio' });
    expect(result).toHaveLength(1);
    expect(result[0].especialidade).toBe('Cardiologia');
  });

  it('filtra por nome case-insensitive', async () => {
    await createMedico({
      nome: 'Dra. Ana Silva',
      email: 'ana@medsync.local',
      senha: 'senha12345',
      crm: 'CRM-AS',
      especialidade: 'Cardiologia',
    });
    const result = await listMedicos({ nome: 'ana' });
    expect(result).toHaveLength(1);
  });
});

describe('medicoService.updateMedico', () => {
  it('atualiza especialidade e nome', async () => {
    const medico = await createMedico({
      nome: 'Dr. Inicial',
      email: 'u1@medsync.local',
      senha: 'senha12345',
      crm: 'CRM-U1',
      especialidade: 'Pediatria',
    });

    const atualizado = await updateMedico(medico.id, {
      nome: 'Dr. Atualizado',
      especialidade: 'Cardiologia',
    });
    expect(atualizado.especialidade).toBe('Cardiologia');
    expect(atualizado.usuario.nome).toBe('Dr. Atualizado');
  });

  it('rejeita id inexistente com 404', async () => {
    await expect(
      updateMedico('00000000-0000-0000-0000-000000000000', { nome: 'X' }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('rejeita CRM em uso por outro médico com 409', async () => {
    const a = await createMedico({
      nome: 'A',
      email: 'a2@medsync.local',
      senha: 'senha12345',
      crm: 'CRM-AA',
      especialidade: 'Cardiologia',
    });
    await createMedico({
      nome: 'B',
      email: 'b2@medsync.local',
      senha: 'senha12345',
      crm: 'CRM-BB',
      especialidade: 'Pediatria',
    });
    await expect(updateMedico(a.id, { crm: 'CRM-BB' })).rejects.toMatchObject({ status: 409 });
  });

  it('limpa horariosAtendimento quando recebe null', async () => {
    const medico = await createMedico({
      nome: 'Dr. H',
      email: 'h@medsync.local',
      senha: 'senha12345',
      crm: 'CRM-H',
      especialidade: 'Cardiologia',
      horariosAtendimento: { seg: ['08:00-12:00'] },
    });
    const atualizado = await updateMedico(medico.id, { horariosAtendimento: null });
    expect(atualizado.horariosAtendimento).toBeNull();
  });
});

describe('medicoService.deleteMedico', () => {
  it('remove médico e usuário em cascata', async () => {
    const medico = await createMedico({
      nome: 'Dr. Bye',
      email: 'bye@medsync.local',
      senha: 'senha12345',
      crm: 'CRM-BYE',
      especialidade: 'Cardiologia',
    });
    await deleteMedico(medico.id);

    const existe = await prisma.medico.findUnique({ where: { id: medico.id } });
    expect(existe).toBeNull();
  });

  it('rejeita id inexistente com 404', async () => {
    await expect(
      deleteMedico('00000000-0000-0000-0000-000000000000'),
    ).rejects.toBeInstanceOf(MedicoError);
  });
});

describe('medicoService.listSlotsOcupados', () => {
  it('devolve apenas janelas futuras de agendamentos ativos', async () => {
    const medico = await createMedico({
      nome: 'Dr. Slot',
      email: 'slot@medsync.local',
      senha: 'senha12345',
      crm: 'CRM-SL',
      especialidade: 'Cardiologia',
    });

    const paciente = await criarPaciente('11988880000');
    const inicio = dataFutura();
    const fim = new Date(inicio.getTime() + 30 * 60 * 1000);

    await createAgendamento(
      { medicoId: medico.id, periodoInicio: inicio, periodoFim: fim },
      { sub: paciente.id, role: Role.PACIENTE },
    );

    const slots = await listSlotsOcupados(medico.id);
    expect(slots).toHaveLength(1);
    expect(slots[0].periodoInicio.getTime()).toBe(inicio.getTime());
  });
});
