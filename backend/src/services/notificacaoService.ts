import { enviarWhatsApp } from '../lib/zapi';

export interface AgendamentoParaNotificacao {
  paciente: { nome: string; telefone: string };
  medico: { especialidade: string; usuario: { nome: string } };
  periodoInicio: Date | string;
}

function formatData(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    timeZone: 'America/Sao_Paulo',
  });
}

function formatHora(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
}

export async function notificarConfirmacao(ag: AgendamentoParaNotificacao): Promise<void> {
  const inicio = new Date(ag.periodoInicio);
  const mensagem =
    `Ola, ${ag.paciente.nome}! Sua consulta com Dr(a). ${ag.medico.usuario.nome}` +
    ` (${ag.medico.especialidade}) esta confirmada para ${formatData(inicio)} as ${formatHora(inicio)}.` +
    ` Em caso de duvidas, entre em contato. — MedSync`;
  await enviarWhatsApp(ag.paciente.telefone, mensagem);
}

export async function notificarLembrete(ag: AgendamentoParaNotificacao): Promise<void> {
  const inicio = new Date(ag.periodoInicio);
  const mensagem =
    `Ola, ${ag.paciente.nome}! Lembrete: voce tem consulta com Dr(a). ${ag.medico.usuario.nome}` +
    ` (${ag.medico.especialidade}) amanha as ${formatHora(inicio)}. Nao se esqueca! — MedSync`;
  await enviarWhatsApp(ag.paciente.telefone, mensagem);
}

export async function notificarReagendamento(ag: AgendamentoParaNotificacao): Promise<void> {
  const inicio = new Date(ag.periodoInicio);
  const mensagem =
    `Ola, ${ag.paciente.nome}! Seu agendamento com Dr(a). ${ag.medico.usuario.nome}` +
    ` foi remarcado para ${formatData(inicio)} as ${formatHora(inicio)}. — MedSync`;
  await enviarWhatsApp(ag.paciente.telefone, mensagem);
}

export async function notificarCancelamento(ag: AgendamentoParaNotificacao): Promise<void> {
  const inicio = new Date(ag.periodoInicio);
  const mensagem =
    `Ola, ${ag.paciente.nome}! Sua consulta com Dr(a). ${ag.medico.usuario.nome}` +
    ` (${ag.medico.especialidade}) prevista para ${formatData(inicio)} as ${formatHora(inicio)}` +
    ` foi cancelada. — MedSync`;
  await enviarWhatsApp(ag.paciente.telefone, mensagem);
}
