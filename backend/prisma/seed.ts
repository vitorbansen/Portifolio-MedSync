import bcrypt from 'bcrypt';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SENHA_PADRAO = 'senha123';
const BCRYPT_ROUNDS = 10;

async function main() {
  console.log('Iniciando seed...');
  const senhaHash = await bcrypt.hash(SENHA_PADRAO, BCRYPT_ROUNDS);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@medsync.local' },
    update: {},
    create: {
      nome: 'Administrador MedSync',
      email: 'admin@medsync.local',
      senhaHash,
      role: Role.ADMINISTRADOR,
    },
  });

  const medicos = [
    {
      nome: 'Dra. Lívia Andrade',
      email: 'livia.andrade@medsync.local',
      crm: 'CRM-SC 12345',
      especialidade: 'Biomedicina',
    },
    {
      nome: 'Rebeca Biondi',
      email: 'rebeca.biondi@medsync.local',
      crm: 'CRM-SC 23456',
      especialidade: 'Biomedicina Estética',
    },
  ];

  for (const m of medicos) {
    const usuario = await prisma.usuario.upsert({
      where: { email: m.email },
      update: {},
      create: {
        nome: m.nome,
        email: m.email,
        senhaHash,
        role: Role.MEDICO,
      },
    });

    await prisma.medico.upsert({
      where: { usuarioId: usuario.id },
      update: {},
      create: {
        usuarioId: usuario.id,
        crm: m.crm,
        especialidade: m.especialidade,
        horariosAtendimento: {
          seg: ['08:00-12:00', '14:00-18:00'],
          ter: ['08:00-12:00', '14:00-18:00'],
          qua: ['08:00-12:00'],
          qui: ['14:00-18:00'],
          sex: ['08:00-12:00', '14:00-18:00'],
        },
      },
    });
  }

  const pacientes = [
    {
      nome: 'João da Silva',
      email: 'joao.silva@exemplo.com',
      telefone: '(47) 99999-0001',
      dataNascimento: new Date('1990-05-14'),
    },
    {
      nome: 'Maria Souza',
      email: 'maria.souza@exemplo.com',
      telefone: '(47) 99999-0002',
      dataNascimento: new Date('1985-11-02'),
    },
  ];

  for (const p of pacientes) {
    const usuario = await prisma.usuario.upsert({
      where: { email: p.email },
      update: {},
      create: {
        nome: p.nome,
        email: p.email,
        senhaHash,
        role: Role.PACIENTE,
      },
    });

    await prisma.paciente.upsert({
      where: { usuarioId: usuario.id },
      update: {},
      create: {
        usuarioId: usuario.id,
        telefone: p.telefone,
        dataNascimento: p.dataNascimento,
      },
    });
  }

  console.log('Seed concluído.');
  console.log('Administrador:', admin.email);
  console.log(`Senha padrão para todos: ${SENHA_PADRAO}`);
}

main()
  .catch((err) => {
    console.error('Erro no seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
