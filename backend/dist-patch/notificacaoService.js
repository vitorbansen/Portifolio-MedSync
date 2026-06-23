"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificarConfirmacao = notificarConfirmacao;
exports.notificarLembrete = notificarLembrete;
exports.notificarReagendamento = notificarReagendamento;
exports.notificarCancelamento = notificarCancelamento;
const zapi_1 = require("../lib/zapi");
function formatData(date) {
    return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        timeZone: 'America/Sao_Paulo',
    });
}
function formatHora(date) {
    return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo',
    });
}
async function notificarConfirmacao(ag) {
    const inicio = new Date(ag.periodoInicio);
    const mensagem = `Ola, ${ag.paciente.nome}! Sua consulta com ${ag.medico.usuario.nome}` +
        ` (${ag.medico.especialidade}) esta confirmada para ${formatData(inicio)} as ${formatHora(inicio)}.` +
        ` Em caso de duvidas, entre em contato. — MedSync`;
    await (0, zapi_1.enviarWhatsApp)(ag.paciente.telefone, mensagem);
}
async function notificarLembrete(ag) {
    const inicio = new Date(ag.periodoInicio);
    const mensagem = `Ola, ${ag.paciente.nome}! Lembrete: voce tem consulta com ${ag.medico.usuario.nome}` +
        ` (${ag.medico.especialidade}) amanha as ${formatHora(inicio)}. Nao se esqueca! — MedSync`;
    await (0, zapi_1.enviarWhatsApp)(ag.paciente.telefone, mensagem);
}
async function notificarReagendamento(ag) {
    const inicio = new Date(ag.periodoInicio);
    const mensagem = `Ola, ${ag.paciente.nome}! Seu agendamento com ${ag.medico.usuario.nome}` +
        ` foi remarcado para ${formatData(inicio)} as ${formatHora(inicio)}. — MedSync`;
    await (0, zapi_1.enviarWhatsApp)(ag.paciente.telefone, mensagem);
}
async function notificarCancelamento(ag) {
    const inicio = new Date(ag.periodoInicio);
    const mensagem = `Ola, ${ag.paciente.nome}! Sua consulta com ${ag.medico.usuario.nome}` +
        ` (${ag.medico.especialidade}) prevista para ${formatData(inicio)} as ${formatHora(inicio)}` +
        ` foi cancelada. — MedSync`;
    await (0, zapi_1.enviarWhatsApp)(ag.paciente.telefone, mensagem);
}
//# sourceMappingURL=notificacaoService.js.map
