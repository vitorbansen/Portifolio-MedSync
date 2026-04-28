const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: 'PACIENTE' | 'MEDICO' | 'ADMINISTRADOR';
  telefone?: string | null;
}

export interface AuthResponse {
  usuario: Usuario;
  token: string;
}

export type DiaSemana = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';

export interface Medico {
  id: string;
  crm: string;
  especialidade: string;
  horariosAtendimento: Partial<Record<DiaSemana, string[]>> | null;
  usuario: Pick<Usuario, 'id' | 'nome' | 'email'>;
}

export type StatusAgendamento = 'AGENDADO' | 'CONFIRMADO' | 'CANCELADO' | 'REALIZADO';

export interface Agendamento {
  id: string;
  periodoInicio: string;
  periodoFim: string;
  status: StatusAgendamento;
  criadoEm: string;
  medico: {
    id: string;
    crm: string;
    especialidade: string;
    usuario: Pick<Usuario, 'id' | 'nome' | 'email'>;
  };
  paciente: {
    id: string;
    nome: string;
    telefone: string;
    usuario: Pick<Usuario, 'id' | 'nome' | 'email'> | null;
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Erro de requisição' }));
    throw new Error(body.message ?? 'Erro de requisição');
  }
  return res.json() as Promise<T>;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function login(email: string, senha: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function register(params: {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  role?: 'PACIENTE' | 'MEDICO' | 'ADMINISTRADOR';
}): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return handleResponse<AuthResponse>(res);
}

export async function fetchMe(token: string): Promise<Usuario> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<Usuario>(res);
}

export async function listMedicos(
  token: string,
  filtros?: { especialidade?: string; nome?: string },
): Promise<Medico[]> {
  const qs = new URLSearchParams();
  if (filtros?.especialidade) qs.set('especialidade', filtros.especialidade);
  if (filtros?.nome) qs.set('nome', filtros.nome);
  const url = qs.toString() ? `${API_URL}/medicos?${qs}` : `${API_URL}/medicos`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  return handleResponse<Medico[]>(res);
}

export async function getMedico(token: string, id: string): Promise<Medico> {
  const medicos = await listMedicos(token);
  const medico = medicos.find((m) => m.id === id);
  if (!medico) throw new Error('Médico não encontrado');
  return medico;
}

export interface CreateMedicoInput {
  nome: string;
  email: string;
  senha: string;
  crm: string;
  especialidade: string;
  horariosAtendimento?: Partial<Record<DiaSemana, string[]>>;
}

export async function createMedico(
  token: string,
  input: CreateMedicoInput,
): Promise<Medico> {
  const res = await fetch(`${API_URL}/medicos`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });
  return handleResponse<Medico>(res);
}

export interface UpdateMedicoInput {
  nome?: string;
  email?: string;
  crm?: string;
  especialidade?: string;
  horariosAtendimento?: Partial<Record<DiaSemana, string[]>> | null;
}

export async function updateMedico(
  token: string,
  id: string,
  input: UpdateMedicoInput,
): Promise<Medico> {
  const res = await fetch(`${API_URL}/medicos/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });
  return handleResponse<Medico>(res);
}

export async function deleteMedico(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/medicos/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Erro ao excluir' }));
    throw new Error(body.message ?? 'Erro ao excluir');
  }
}

export interface SlotOcupado {
  periodoInicio: string;
  periodoFim: string;
}

export async function listSlotsOcupados(
  token: string,
  medicoId: string,
): Promise<SlotOcupado[]> {
  const res = await fetch(`${API_URL}/medicos/${medicoId}/slots-ocupados`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<SlotOcupado[]>(res);
}

export async function listAgendamentos(
  token: string,
  filtros?: { status?: StatusAgendamento; de?: string; ate?: string },
): Promise<Agendamento[]> {
  const qs = new URLSearchParams();
  if (filtros?.status) qs.set('status', filtros.status);
  if (filtros?.de) qs.set('de', filtros.de);
  if (filtros?.ate) qs.set('ate', filtros.ate);
  const url = qs.toString() ? `${API_URL}/agendamentos?${qs}` : `${API_URL}/agendamentos`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  return handleResponse<Agendamento[]>(res);
}

export interface CreateAgendamentoInput {
  medicoId?: string;
  pacienteId?: string;
  pacienteNome?: string;
  pacienteTelefone?: string;
  periodoInicio: string;
  periodoFim: string;
}

export async function createAgendamento(
  token: string,
  input: CreateAgendamentoInput,
): Promise<Agendamento> {
  const res = await fetch(`${API_URL}/agendamentos`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });
  return handleResponse<Agendamento>(res);
}

export async function cancelarAgendamento(token: string, id: string): Promise<Agendamento> {
  const res = await fetch(`${API_URL}/agendamentos/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ status: 'CANCELADO' }),
  });
  return handleResponse<Agendamento>(res);
}

export interface UpdateMeInput {
  nome?: string;
  email?: string;
  telefone?: string;
}

export async function updateMe(token: string, input: UpdateMeInput): Promise<Usuario> {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });
  return handleResponse<Usuario>(res);
}

export async function deleteMinhaConta(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? 'Falha ao excluir conta');
  }
}
