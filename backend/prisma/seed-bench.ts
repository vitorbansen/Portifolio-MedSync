import bcrypt from 'bcrypt';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const ESPECIALIDADES = [
  'Cardiologia',
  'Dermatologia',
  'Pediatria',
  'Ortopedia',
  'Ginecologia',
  'Psiquiatria',
  'Endocrinologia',
  'Neurologia',
  'Oftalmologia',
  'Biomedicina',
];

const QUANTIDADE = Number(process.env.BENCH_MEDICOS ?? 200);

async function main() {
  console.log(`Seed de benchmark: criando ${QUANTIDADE} médicos...`);
  const senhaHash = await bcrypt.hash('bench123', 10);

  for (let i = 0; i < QUANTIDADE; i++) {
    const n = i + 1;
    const email = `bench-medico-${n}@medsync.local`;
    const crm = `BENCH-${String(n).padStart(5, '0')}`;
    const especialidade = ESPECIALIDADES[i % ESPECIALIDADES.length];
    await prisma.usuario.upsert({
      where: { email },
      update: {},
      create: {
        nome: `Dr(a). Bench ${n}`,
        email,
        senhaHash,
        role: Role.MEDICO,
        medico: {
          create: {
            crm,
            especialidade,
            horariosAtendimento: {
              seg: ['08:00-12:00', '14:00-18:00'],
              ter: ['08:00-12:00', '14:00-18:00'],
              qua: ['08:00-12:00'],
              qui: ['14:00-18:00'],
              sex: ['08:00-12:00', '14:00-18:00'],
            },
          },
        },
      },
    });
    if (n % 50 === 0) console.log(`  ${n}/${QUANTIDADE}`);
  }
  console.log('Pronto.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
