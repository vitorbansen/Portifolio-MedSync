const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: 'PACIENTE' | 'MEDICO' | 'ADMINISTRADOR';
}

export interface AuthResponse {
  usuario: Usuario;
  token: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Erro de requisição' }));
    throw new Error(body.message ?? 'Erro de requisição');
  }
  return res.json() as Promise<T>;
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
