import {
  login,
  register,
  fetchMe,
  listMedicos,
  getMedico,
  createMedico,
  updateMedico,
  deleteMedico,
  listSlotsOcupados,
  listAgendamentos,
  createAgendamento,
  cancelarAgendamento,
  reagendarAgendamento,
  updateMe,
  deleteMinhaConta,
} from './api';

function mockFetchOnce(ok: boolean, body: unknown) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    json: async () => body,
  });
}

beforeEach(() => {
  global.fetch = jest.fn();
});

describe('api — autenticação', () => {
  it('login envia credenciais e retorna AuthResponse', async () => {
    mockFetchOnce(true, { usuario: { id: '1' }, token: 'tok' });
    const result = await login('a@a.com', 'senha');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.token).toBe('tok');
  });

  it('login propaga a mensagem de erro da API', async () => {
    mockFetchOnce(false, { message: 'Credenciais inválidas' });
    await expect(login('a@a.com', 'errada')).rejects.toThrow('Credenciais inválidas');
  });

  it('register envia o payload completo, incluindo telefone', async () => {
    mockFetchOnce(true, { usuario: { id: '1' }, token: 'tok' });
    await register({ nome: 'A', email: 'a@a.com', senha: 'x', telefone: '47999999999' });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(JSON.parse(options.body)).toMatchObject({ nome: 'A', telefone: '47999999999' });
  });

  it('fetchMe usa o token no header Authorization', async () => {
    mockFetchOnce(true, { id: '1', nome: 'A', email: 'a@a.com', role: 'PACIENTE' });
    await fetchMe('tok123');

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer tok123');
  });
});

describe('api — médicos', () => {
  it('listMedicos monta query string com os filtros informados', async () => {
    mockFetchOnce(true, []);
    await listMedicos('tok', { especialidade: 'Cardiologia', nome: 'Ana' });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('especialidade=Cardiologia');
    expect(url).toContain('nome=Ana');
  });

  it('listMedicos sem filtros não adiciona query string', async () => {
    mockFetchOnce(true, []);
    await listMedicos('tok');

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).not.toContain('?');
  });

  it('getMedico retorna o médico encontrado na lista', async () => {
    mockFetchOnce(true, [{ id: 'm1' }, { id: 'm2' }]);
    const medico = await getMedico('tok', 'm2');
    expect(medico).toEqual({ id: 'm2' });
  });

  it('getMedico lança erro quando o médico não existe na lista', async () => {
    mockFetchOnce(true, [{ id: 'm1' }]);
    await expect(getMedico('tok', 'inexistente')).rejects.toThrow('Médico não encontrado');
  });

  it('createMedico envia POST com headers autenticados', async () => {
    mockFetchOnce(true, { id: 'm1' });
    await createMedico('tok', {
      nome: 'Dr A',
      email: 'dr@a.com',
      senha: 'x',
      crm: '123',
      especialidade: 'Clinico',
    });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.headers.Authorization).toBe('Bearer tok');
  });

  it('updateMedico envia PATCH', async () => {
    mockFetchOnce(true, { id: 'm1' });
    await updateMedico('tok', 'm1', { nome: 'Novo nome' });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.method).toBe('PATCH');
  });

  it('deleteMedico resolve sem erro quando a resposta é ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    await expect(deleteMedico('tok', 'm1')).resolves.toBeUndefined();
  });

  it('deleteMedico lança erro quando a resposta falha', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Falha ao excluir' }),
    });
    await expect(deleteMedico('tok', 'm1')).rejects.toThrow('Falha ao excluir');
  });
});

describe('api — agendamentos', () => {
  it('listSlotsOcupados retorna a lista de slots ocupados', async () => {
    mockFetchOnce(true, [{ periodoInicio: 'a', periodoFim: 'b' }]);
    const slots = await listSlotsOcupados('tok', 'm1');
    expect(slots).toHaveLength(1);
  });

  it('listAgendamentos monta query string com os filtros informados', async () => {
    mockFetchOnce(true, []);
    await listAgendamentos('tok', { status: 'AGENDADO', de: '2026-01-01', ate: '2026-01-31' });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('status=AGENDADO');
    expect(url).toContain('de=2026-01-01');
    expect(url).toContain('ate=2026-01-31');
  });

  it('createAgendamento envia POST com o payload informado', async () => {
    mockFetchOnce(true, { id: 'ag1' });
    await createAgendamento('tok', { medicoId: 'm1', periodoInicio: 'a', periodoFim: 'b' });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.method).toBe('POST');
  });

  it('cancelarAgendamento envia status CANCELADO', async () => {
    mockFetchOnce(true, { id: 'ag1', status: 'CANCELADO' });
    await cancelarAgendamento('tok', 'ag1');

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({ status: 'CANCELADO' });
  });

  it('reagendarAgendamento envia o novo período', async () => {
    mockFetchOnce(true, { id: 'ag1' });
    await reagendarAgendamento('tok', 'ag1', 'novoInicio', 'novoFim');

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({ periodoInicio: 'novoInicio', periodoFim: 'novoFim' });
  });
});

describe('api — perfil', () => {
  it('updateMe envia PATCH com os campos alterados', async () => {
    mockFetchOnce(true, { id: 'u1' });
    await updateMe('tok', { nome: 'Novo' });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.method).toBe('PATCH');
  });

  it('deleteMinhaConta resolve sem erro quando a resposta é ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    await expect(deleteMinhaConta('tok')).resolves.toBeUndefined();
  });

  it('deleteMinhaConta lança erro quando a resposta falha', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Falha ao excluir conta' }),
    });
    await expect(deleteMinhaConta('tok')).rejects.toThrow('Falha ao excluir conta');
  });
});
