'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { deleteMinhaConta, fetchMe, updateMe, Usuario } from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth';

export default function PerfilPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    try {
      const u = await fetchMe(token);
      setUsuario(u);
      setNome(u.nome);
      setEmail(u.email);
      setTelefone(u.telefone ?? '');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Sessão expirada');
      clearToken();
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!usuario) return;
    const token = getToken();
    if (!token) return;
    setErro(null);
    setSucesso(null);
    setSalvando(true);

    const patch: { nome?: string; email?: string; telefone?: string } = {};
    if (nome.trim() && nome.trim() !== usuario.nome) patch.nome = nome.trim();
    if (email.trim() && email.trim() !== usuario.email) patch.email = email.trim();
    if (usuario.role === 'PACIENTE' && telefone.trim() && telefone.trim() !== (usuario.telefone ?? '')) {
      patch.telefone = telefone.trim();
    }

    if (Object.keys(patch).length === 0) {
      setSucesso('Nenhuma alteração para salvar.');
      setSalvando(false);
      return;
    }

    try {
      const atualizado = await updateMe(token, patch);
      setUsuario(atualizado);
      setNome(atualizado.nome);
      setEmail(atualizado.email);
      setTelefone(atualizado.telefone ?? '');
      setSucesso('Perfil atualizado com sucesso.');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    } finally {
      setSalvando(false);
    }
  }

  async function excluirConta() {
    const token = getToken();
    if (!token) return;
    const confirmado = window.confirm(
      'Tem certeza? Esta ação remove permanentemente sua conta e todos os dados associados (agendamentos inclusos). Não é possível desfazer.',
    );
    if (!confirmado) return;
    try {
      await deleteMinhaConta(token);
      clearToken();
      router.push('/');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao excluir conta');
    }
  }

  if (!usuario) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 h-64 animate-pulse rounded-xl bg-slate-100" />
      </main>
    );
  }

  const isPaciente = usuario.role === 'PACIENTE';

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meu perfil</h1>
          <p className="text-sm text-slate-500">Perfil: {usuario.role}</p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Voltar
        </Link>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nome</label>
          <input
            type="text"
            required
            minLength={2}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand focus:outline-none"
          />
        </div>
        {isPaciente && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Telefone</label>
            <input
              type="tel"
              value={telefone}
              placeholder="(47) 99999-0000"
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand focus:outline-none"
            />
          </div>
        )}

        {erro && (
          <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{erro}</div>
        )}
        {sucesso && (
          <div className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
            {sucesso}
          </div>
        )}

        <button
          type="submit"
          disabled={salvando}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
        >
          {salvando ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </form>

      <section className="mt-10 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-800">Excluir minha conta</h2>
        <p className="mt-1 text-sm text-slate-500">
          Exerça o direito ao esquecimento previsto na LGPD. Esta ação remove sua conta e os
          dados pessoais associados e não pode ser desfeita.
        </p>
        <button
          onClick={excluirConta}
          className="mt-3 rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
        >
          Excluir minha conta
        </button>
      </section>
    </main>
  );
}
