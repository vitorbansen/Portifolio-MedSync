/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { middleware } from './middleware';

function buildRequest(pathname: string, token?: string): NextRequest {
  const url = new URL(pathname, 'http://localhost:3000');
  const headers = new Headers();
  if (token) headers.set('cookie', `medsync.token=${token}`);
  return new NextRequest(url, { headers });
}

describe('middleware', () => {
  it('redireciona para /login ao acessar /dashboard sem token', () => {
    const res = middleware(buildRequest('/dashboard'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/login');
  });

  it('permite acesso a /dashboard com token', () => {
    const res = middleware(buildRequest('/dashboard', 'token-valido'));
    expect(res.headers.get('location')).toBeNull();
  });

  it('redireciona para /dashboard ao acessar /login já autenticado', () => {
    const res = middleware(buildRequest('/login', 'token-valido'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });

  it('redireciona para /dashboard ao acessar /register já autenticado', () => {
    const res = middleware(buildRequest('/register', 'token-valido'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });

  it('permite acesso a /login sem token', () => {
    const res = middleware(buildRequest('/login'));
    expect(res.headers.get('location')).toBeNull();
  });
});
