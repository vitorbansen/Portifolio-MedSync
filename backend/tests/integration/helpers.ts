import { prisma } from '../../src/lib/prisma';

export async function resetDatabase() {
  await prisma.agendamento.deleteMany();
  await prisma.medico.deleteMany();
  await prisma.paciente.deleteMany();
  await prisma.usuario.deleteMany();
}

export async function closeDatabase() {
  await prisma.$disconnect();
}
