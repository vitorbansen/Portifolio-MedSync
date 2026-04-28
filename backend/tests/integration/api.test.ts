import bcrypt from 'bcrypt';
import request from 'supertest';
import { Role } from '@prisma/client';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { closeDatabase, resetDatabase } from './helpers';

async function criarAdmin() {
  const senhaHash = await bcrypt.hash('admin12345', 4);
  return prisma.usuario.create({
    data: {
      nome: 'Admin',
      email: `admin-${Date.now()}@medsync.local`,
      senhaHash,
      role: Role.ADMINISTRADOR,
    },
  });
}

async function criarMedicoComHorarios() {
  const senhaHash = await bcrypt.hash('medico12345', 4);
  const usuario = await prisma.usuario.create({
    data: {
      nome: 'Dr. Teste',
      email: `medico-${Date.now()}@medsync.local`,
      senhaHash,
      role: Role.MEDICO,
      medico: {
        create: {
          crm: `CRM-${Math.random().toString(36).slice(2, 8)}`,
          especialidade: 'Cardiologia',
        },
      },
    },
    include: { medico: true },
  });
  return { usuario, medico: usuario.medico! };
}

function dataFutura(offsetMs = 0) {
  return new Date(Date.now() + 24 * 60 * 60 * 1000 + offsetMs);
}

beforeEach(resetDatabase);
afterAll(closeDatabase);

describe('API health', () => {
  it('GET /api/health responde ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('Fluxo registro → login → agendamento → conflito', () => {
  it('executa o golden path e valida 409 no conflito', async () => {
    const { medico } = await criarMedicoComHorarios();

    const registro = await request(app).post('/api/auth/register').send({
      nome: 'Paciente A',
      email: 'paciente-a@medsync.local',
      senha: 'senha12345',
      telefone: '11999990000',
      role: Role.PACIENTE,
    });
    expect(registro.status).toBe(201);
    expect(registro.body.token).toBeTruthy();

    const login = await request(app).post('/api/auth/login').send({
      email: 'paciente-a@medsync.local',
      senha: 'senha12345',
    });
    expect(login.status).toBe(200);
    const token = login.body.token as string;
    expect(token).toBeTruthy();

    const listaMedicos = await request(app)
      .get('/api/medicos')
      .set('Authorization', `Bearer ${token}`);
    expect(listaMedicos.status).toBe(200);
    expect(Array.isArray(listaMedicos.body)).toBe(true);
    expect(listaMedicos.body.length).toBeGreaterThan(0);

    const inicio = dataFutura();
    const fim = new Date(inicio.getTime() + 30 * 60 * 1000);

    const agendamento = await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        medicoId: medico.id,
        periodoInicio: inicio.toISOString(),
        periodoFim: fim.toISOString(),
      });
    expect(agendamento.status).toBe(201);
    expect(agendamento.body.status).toBe('AGENDADO');

    const segundoRegistro = await request(app).post('/api/auth/register').send({
      nome: 'Paciente B',
      email: 'paciente-b@medsync.local',
      senha: 'senha12345',
      telefone: '11988887777',
      role: Role.PACIENTE,
    });
    const token2 = segundoRegistro.body.token as string;

    const conflito = await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${token2}`)
      .send({
        medicoId: medico.id,
        periodoInicio: new Date(inicio.getTime() + 10 * 60 * 1000).toISOString(),
        periodoFim: new Date(fim.getTime() + 10 * 60 * 1000).toISOString(),
      });
    expect(conflito.status).toBe(409);
  });

  it('rejeita cadastro sem token em POST /medicos', async () => {
    const res = await request(app).post('/api/medicos').send({});
    expect(res.status).toBe(401);
  });

  it('rejeita POST /medicos por paciente com 403', async () => {
    const registro = await request(app).post('/api/auth/register').send({
      nome: 'Paciente X',
      email: 'paciente-x@medsync.local',
      senha: 'senha12345',
      telefone: '11999999999',
      role: Role.PACIENTE,
    });
    const token = registro.body.token as string;

    const res = await request(app)
      .post('/api/medicos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Dr. Novo',
        email: 'novo@medsync.local',
        senha: 'novo12345',
        crm: 'CRM-ABC',
        especialidade: 'Dermatologia',
      });
    expect(res.status).toBe(403);
  });

  it('admin cria médico via POST /medicos', async () => {
    const admin = await criarAdmin();
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: admin.email, senha: 'admin12345' });
    const token = login.body.token as string;

    const res = await request(app)
      .post('/api/medicos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Dr. Criado',
        email: `dr-${Date.now()}@medsync.local`,
        senha: 'senha12345',
        crm: `CRM-${Math.random().toString(36).slice(2, 8)}`,
        especialidade: 'Pediatria',
      });
    expect(res.status).toBe(201);
    expect(res.body.especialidade).toBe('Pediatria');
  });
});

describe('Endpoints adicionais', () => {
  it('GET /api/auth/me devolve o usuário autenticado', async () => {
    const registro = await request(app).post('/api/auth/register').send({
      nome: 'Me',
      email: 'me@medsync.local',
      senha: 'senha12345',
      telefone: '11999990000',
      role: Role.PACIENTE,
    });
    const token = registro.body.token as string;

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('me@medsync.local');
  });

  it('POST /api/auth/register rejeita payload inválido com 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x' });
    expect(res.status).toBe(400);
  });

  it('POST /api/auth/login com payload sem senha retorna 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
  });

  it('paciente lista apenas seus próprios agendamentos via GET /api/agendamentos', async () => {
    const { medico } = await criarMedicoComHorarios();
    const reg = await request(app).post('/api/auth/register').send({
      nome: 'Only Me',
      email: 'only@medsync.local',
      senha: 'senha12345',
      telefone: '11999990000',
      role: Role.PACIENTE,
    });
    const token = reg.body.token as string;

    const inicio = dataFutura();
    const fim = new Date(inicio.getTime() + 30 * 60 * 1000);
    await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        medicoId: medico.id,
        periodoInicio: inicio.toISOString(),
        periodoFim: fim.toISOString(),
      });

    const lista = await request(app)
      .get('/api/agendamentos')
      .set('Authorization', `Bearer ${token}`);
    expect(lista.status).toBe(200);
    expect(lista.body).toHaveLength(1);
  });

  it('paciente cancela próprio agendamento via PATCH /status', async () => {
    const { medico } = await criarMedicoComHorarios();
    const reg = await request(app).post('/api/auth/register').send({
      nome: 'Cancel',
      email: 'cancel@medsync.local',
      senha: 'senha12345',
      telefone: '11999990000',
      role: Role.PACIENTE,
    });
    const token = reg.body.token as string;

    const inicio = dataFutura();
    const fim = new Date(inicio.getTime() + 30 * 60 * 1000);
    const criado = await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        medicoId: medico.id,
        periodoInicio: inicio.toISOString(),
        periodoFim: fim.toISOString(),
      });

    const cancelado = await request(app)
      .patch(`/api/agendamentos/${criado.body.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'CANCELADO' });
    expect(cancelado.status).toBe(200);
    expect(cancelado.body.status).toBe('CANCELADO');
  });

  it('GET /api/medicos/:id/slots-ocupados devolve janelas ativas', async () => {
    const { medico } = await criarMedicoComHorarios();
    const reg = await request(app).post('/api/auth/register').send({
      nome: 'Slots',
      email: 'slots@medsync.local',
      senha: 'senha12345',
      telefone: '11999990000',
      role: Role.PACIENTE,
    });
    const token = reg.body.token as string;

    const inicio = dataFutura();
    const fim = new Date(inicio.getTime() + 30 * 60 * 1000);
    await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        medicoId: medico.id,
        periodoInicio: inicio.toISOString(),
        periodoFim: fim.toISOString(),
      });

    const res = await request(app)
      .get(`/api/medicos/${medico.id}/slots-ocupados`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('admin edita médico via PATCH /api/medicos/:id', async () => {
    const { medico } = await criarMedicoComHorarios();
    const admin = await criarAdmin();
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: admin.email, senha: 'admin12345' });
    const token = login.body.token as string;

    const res = await request(app)
      .patch(`/api/medicos/${medico.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ especialidade: 'Ortopedia' });
    expect(res.status).toBe(200);
    expect(res.body.especialidade).toBe('Ortopedia');
  });

  it('admin exclui médico via DELETE /api/medicos/:id', async () => {
    const { medico } = await criarMedicoComHorarios();
    const admin = await criarAdmin();
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: admin.email, senha: 'admin12345' });
    const token = login.body.token as string;

    const res = await request(app)
      .delete(`/api/medicos/${medico.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  it('rejeita token inválido com 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token-invalido');
    expect(res.status).toBe(401);
  });

  it('PATCH /api/auth/me atualiza nome e telefone do paciente', async () => {
    const registro = await request(app).post('/api/auth/register').send({
      nome: 'Nome Antigo',
      email: 'editar@medsync.local',
      senha: 'senha12345',
      telefone: '11900000000',
      role: Role.PACIENTE,
    });
    const token = registro.body.token as string;

    const res = await request(app)
      .patch('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Nome Novo', telefone: '11988887777' });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Nome Novo');
    expect(res.body.telefone).toBe('11988887777');
  });

  it('PATCH /api/auth/me rejeita e-mail já em uso com 409', async () => {
    await request(app).post('/api/auth/register').send({
      nome: 'Outro',
      email: 'ocupado@medsync.local',
      senha: 'senha12345',
      telefone: '11900000000',
      role: Role.PACIENTE,
    });
    const reg = await request(app).post('/api/auth/register').send({
      nome: 'Eu',
      email: 'eu@medsync.local',
      senha: 'senha12345',
      telefone: '11900000001',
      role: Role.PACIENTE,
    });
    const token = reg.body.token as string;

    const res = await request(app)
      .patch('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'ocupado@medsync.local' });
    expect(res.status).toBe(409);
  });

  it('DELETE /api/auth/me remove o usuário autenticado (LGPD)', async () => {
    const registro = await request(app).post('/api/auth/register').send({
      nome: 'Apagar',
      email: 'apagar@medsync.local',
      senha: 'senha12345',
      telefone: '11999990000',
      role: Role.PACIENTE,
    });
    const token = registro.body.token as string;

    const del = await request(app)
      .delete('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(204);

    const apos = await request(app)
      .post('/api/auth/login')
      .send({ email: 'apagar@medsync.local', senha: 'senha12345' });
    expect(apos.status).toBe(401);
  });
});
