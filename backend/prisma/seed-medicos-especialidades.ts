import bcrypt from 'bcrypt';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SENHA_PADRAO = 'senha123';
const BCRYPT_ROUNDS = 10;

const HORARIOS_PADRAO = {
  seg: ['08:00-12:00', '14:00-18:00'],
  ter: ['08:00-12:00', '14:00-18:00'],
  qua: ['08:00-12:00'],
  qui: ['14:00-18:00'],
  sex: ['08:00-12:00', '14:00-18:00'],
};

const MEDICOS = [
  { nome: 'Manfred', email: 'manfred@medsync.local', registro: 'CRO-SC 30001', especialidade: 'Odontologia' },
  { nome: 'Manseira', email: 'manseira@medsync.local', registro: 'CRO-SC 30002', especialidade: 'Odontologia' },
  { nome: 'Glauco', email: 'glauco@medsync.local', registro: 'CRO-SC 30003', especialidade: 'Odontologia' },
  { nome: 'Camargo', email: 'camargo@medsync.local', registro: 'CREFITO-SC 40001', especialidade: 'Fisioterapia' },
  { nome: 'Diogo', email: 'diogo@medsync.local', registro: 'CREFITO-SC 40002', especialidade: 'Fisioterapia' },
  { nome: 'Edicarsia', email: 'edicarsia@medsync.local', registro: 'CRN-SC 50001', especialidade: 'Nutricionista' },
  { nome: 'Mauricio', email: 'mauricio@medsync.local', registro: 'CRN-SC 50002', especialidade: 'Nutricionista' },
];

async function main() {
  console.log('Iniciando seed de médicos por especialidade...');
  const senhaHash = await bcrypt.hash(SENHA_PADRAO, BCRYPT_ROUNDS);

  for (const m of MEDICOS) {
    const usuario = await prisma.usuario.upsert({
      where: { email: m.email },
      update: {},
      create: {
        nome: `Dr(a). ${m.nome}`,
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
        crm: m.registro,
        especialidade: m.especialidade,
        horariosAtendimento: HORARIOS_PADRAO,
      },
    });

    console.log(`OK: ${m.nome} (${m.especialidade}) — ${m.email}`);
  }

  console.log('Seed de médicos por especialidade concluído.');
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
