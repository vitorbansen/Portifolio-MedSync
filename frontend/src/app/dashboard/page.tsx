'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchMe, Usuario } from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    fetchMe(token)
      .then(setUsuario)
      .catch((err) => {
        setErro(err instanceof Error ? err.message : 'Sessão expirada');
        clearToken();
        router.replace('/login');
      });
  }, [router]);

  function sair() {
    clearToken();
    router.push('/login');
  }

  if (erro) return <div className="p-6 text-red-700">{erro}</div>;
  if (!usuario) return <div className="p-6 text-slate-500">Carregando…</div>;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Olá, {usuario.nome}</h1>
          <p className="text-slate-500">Perfil: {usuario.role}</p>
        </div>
        <button
          onClick={sair}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Sair
        </button>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-2 text-lg font-semibold text-slate-800">Próximos passos</h2>
        <p className="text-slate-600">
          A autenticação está funcionando. Os módulos de busca de médicos e agendamentos
          serão implementados nas Semanas 5 a 8 do cronograma.
        </p>
      </section>
    </main>
  );
}
