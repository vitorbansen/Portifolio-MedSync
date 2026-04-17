'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { login } from '@/lib/api';
import { saveToken } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const { token } = await login(email, senha);
      saveToken(token);
      router.push('/dashboard');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao entrar');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-brand-dark">Entrar</h1>
        <p className="mb-6 text-sm text-slate-500">Acesse sua conta MedSync</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="senha" className="mb-1 block text-sm font-medium text-slate-700">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand focus:outline-none"
            />
          </div>

          {erro && (
            <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{erro}</div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white shadow transition hover:bg-brand-dark disabled:opacity-60"
          >
            {carregando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Ainda não tem conta?{' '}
          <Link href="/register" className="font-semibold text-brand-dark hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </main>
  );
}
