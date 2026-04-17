'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { register } from '@/lib/api';
import { saveToken } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const { token } = await register({ nome, email, senha });
      saveToken(token);
      router.push('/dashboard');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao cadastrar');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-brand-dark">Criar conta</h1>
        <p className="mb-6 text-sm text-slate-500">
          Cadastre-se para agendar consultas em poucos cliques.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome" className="mb-1 block text-sm font-medium text-slate-700">
              Nome completo
            </label>
            <input
              id="nome"
              type="text"
              required
              minLength={2}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand focus:outline-none"
            />
          </div>
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
              minLength={8}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">Mínimo de 8 caracteres.</p>
          </div>

          {erro && (
            <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{erro}</div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white shadow transition hover:bg-brand-dark disabled:opacity-60"
          >
            {carregando ? 'Cadastrando…' : 'Cadastrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Já tem conta?{' '}
          <Link href="/login" className="font-semibold text-brand-dark hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </main>
  );
}
