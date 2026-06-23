import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const EMAILS = [
  'manfred@medsync.local',
  'manseira@medsync.local',
  'glauco@medsync.local',
  'camargo@medsync.local',
  'diogo@medsync.local',
  'edicarsia@medsync.local',
  'mauricio@medsync.local',
  'livia.andrade@medsync.local',
  'rebeca.biondi@medsync.local',
];

async function main() {
  for (const email of EMAILS) {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      console.log(`Não encontrado: ${email}`);
      continue;
    }
    const semPrefixo = usuario.nome.replace(/^Dr\(a\)\.\s*/i, '').replace(/^Dra?\.\s*/i, '');
    const nomeCorrigido = `Dr(a). ${semPrefixo}`;
    if (nomeCorrigido !== usuario.nome) {
      await prisma.usuario.update({ where: { email }, data: { nome: nomeCorrigido } });
      console.log(`Corrigido: "${usuario.nome}" -> "${nomeCorrigido}"`);
    } else {
      console.log(`Sem alteração: ${email} ("${usuario.nome}")`);
    }
  }
}

main()
  .catch((err) => {
    console.error('Erro:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
