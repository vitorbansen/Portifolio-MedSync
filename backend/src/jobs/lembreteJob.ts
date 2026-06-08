import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { notificarLembrete } from '../services/notificacaoService';
import { StatusAgendamento } from '@prisma/client';

export function iniciarLembreteJob(): void {
  // Roda a cada 30 minutos, verifica agendamentos na janela de 23h–25h
  cron.schedule('*/30 * * * *', async () => {
    try {
      const agora = new Date();
      const em23h = new Date(agora.getTime() + 23 * 60 * 60 * 1000);
      const em25h = new Date(agora.getTime() + 25 * 60 * 60 * 1000);

      const agendamentos = await prisma.agendamento.findMany({
        where: {
          lembreteEnviado: false,
          status: { in: [StatusAgendamento.AGENDADO, StatusAgendamento.CONFIRMADO] },
          periodoInicio: { gte: em23h, lte: em25h },
        },
        select: {
          id: true,
          periodoInicio: true,
          paciente: { select: { nome: true, telefone: true } },
          medico: {
            select: {
              especialidade: true,
              usuario: { select: { nome: true } },
            },
          },
        },
      });

      for (const ag of agendamentos) {
        try {
          await notificarLembrete(ag);
          await prisma.agendamento.update({
            where: { id: ag.id },
            data: { lembreteEnviado: true },
          });
          console.log(`[lembrete] WhatsApp enviado — agendamento ${ag.id}`);
        } catch (err) {
          console.error(`[lembrete] Falha no agendamento ${ag.id}:`, (err as Error).message);
        }
      }
    } catch (err) {
      console.error('[lembrete] Erro no job:', (err as Error).message);
    }
  });

  console.log('[lembrete] Job de lembretes iniciado (a cada 30 min)');
}
