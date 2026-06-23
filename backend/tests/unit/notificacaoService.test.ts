import {
  notificarCancelamento,
  notificarConfirmacao,
  notificarLembrete,
  notificarReagendamento,
  type AgendamentoParaNotificacao,
} from '../../src/services/notificacaoService';
import { enviarWhatsApp } from '../../src/lib/zapi';

jest.mock('../../src/lib/zapi', () => ({
  enviarWhatsApp: jest.fn().mockResolvedValue(undefined),
}));

const mockEnviarWhatsApp = enviarWhatsApp as jest.Mock;

const agendamento: AgendamentoParaNotificacao = {
  paciente: { nome: 'João da Silva', telefone: '47999990001' },
  medico: { especialidade: 'Odontologia', usuario: { nome: 'Dr(a). Camargo' } },
  periodoInicio: new Date('2026-07-01T14:30:00-03:00'),
};

describe('notificacaoService', () => {
  beforeEach(() => {
    mockEnviarWhatsApp.mockClear();
  });

  it('notificarConfirmacao envia o nome do médico sem duplicar o prefixo', async () => {
    await notificarConfirmacao(agendamento);

    expect(mockEnviarWhatsApp).toHaveBeenCalledTimes(1);
    const [telefone, mensagem] = mockEnviarWhatsApp.mock.calls[0];
    expect(telefone).toBe(agendamento.paciente.telefone);
    expect(mensagem).toContain('Dr(a). Camargo');
    expect(mensagem).not.toContain('Dr(a). Dr(a).');
    expect(mensagem).toContain('Odontologia');
  });

  it('notificarLembrete monta a mensagem de lembrete', async () => {
    await notificarLembrete(agendamento);

    const [, mensagem] = mockEnviarWhatsApp.mock.calls[0];
    expect(mensagem).toContain('Lembrete');
    expect(mensagem).toContain('Dr(a). Camargo');
    expect(mensagem).not.toContain('Dr(a). Dr(a).');
  });

  it('notificarReagendamento monta a mensagem de remarcação', async () => {
    await notificarReagendamento(agendamento);

    const [, mensagem] = mockEnviarWhatsApp.mock.calls[0];
    expect(mensagem).toContain('remarcado');
    expect(mensagem).toContain('Dr(a). Camargo');
  });

  it('notificarCancelamento monta a mensagem de cancelamento', async () => {
    await notificarCancelamento(agendamento);

    const [, mensagem] = mockEnviarWhatsApp.mock.calls[0];
    expect(mensagem).toContain('cancelada');
    expect(mensagem).toContain('Dr(a). Camargo');
  });
});
