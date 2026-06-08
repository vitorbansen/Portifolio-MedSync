'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { listMedicos, Medico } from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth';
import { DIAS_SEMANA_LABEL } from '@/lib/format';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function BuscaMedicosPage() {
  const router = useRouter();
  const [medicos, setMedicos] = useState<Medico[] | null>(null);
  const [especialidade, setEspecialidade] = useState('');
  const [nome, setNome] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const buscar = useCallback(
    async (filtros?: { especialidade?: string; nome?: string }) => {
      const token = getToken();
      if (!token) {
        router.replace('/login');
        return;
      }
      setCarregando(true);
      setErro(null);
      try {
        const resultado = await listMedicos(token, filtros);
        setMedicos(resultado);
      } catch (err) {
        if (err instanceof Error && err.message.toLowerCase().includes('token')) {
          clearToken();
          router.replace('/login');
          return;
        }
        setErro(err instanceof Error ? err.message : 'Erro ao buscar médicos');
        setMedicos([]);
      } finally {
        setCarregando(false);
      }
    },
    [router],
  );

  useEffect(() => {
    buscar();
  }, [buscar]);

  function aoSubmeter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    buscar({
      especialidade: especialidade.trim() || undefined,
      nome: nome.trim() || undefined,
    });
  }

  function limpar() {
    setEspecialidade('');
    setNome('');
    buscar();
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Buscar médicos</h1>
          <p className="mt-1 text-sm text-slate-500">Encontre um profissional e agende sua consulta.</p>
        </div>

      <form
        onSubmit={aoSubmeter}
        className="mb-8 flex flex-wrap gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
      >
        <input
          type="text"
          value={especialidade}
          onChange={(e) => setEspecialidade(e.target.value)}
          placeholder="Especialidade (ex: Biomedicina)"
          className="flex-1 min-w-[180px] rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do profissional"
          className="flex-1 min-w-[180px] rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={carregando}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {carregando ? 'Buscando…' : 'Buscar'}
        </button>
        <button
          type="button"
          onClick={limpar}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Limpar
        </button>
      </form>

      {erro && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">{erro}</div>
      )}

      {carregando ? (
        <SkeletonGrid />
      ) : medicos && medicos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-800">Nenhum médico encontrado</p>
          <p className="mt-1 text-sm text-slate-500">Tente ajustar os filtros.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {medicos?.map((m) => <MedicoCard key={m.id} medico={m} />)}
        </div>
      )}
      </main>
      <Footer />
    </div>
  );
}

function MedicoCard({ medico }: { medico: Medico }) {
  const dias = medico.horariosAtendimento
    ? Object.keys(medico.horariosAtendimento)
        .map((d) => DIAS_SEMANA_LABEL[d])
        .filter(Boolean)
    : [];

  return (
    <div className="flex flex-col rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="font-semibold text-slate-900">{medico.usuario.nome}</div>
      <div className="mt-1 text-sm text-emerald-700">{medico.especialidade}</div>
      <div className="text-xs text-slate-500">{medico.crm}</div>
      {dias.length > 0 && (
        <div className="mt-3 text-xs text-slate-600">Atende: {dias.join(', ')}</div>
      )}
      <Link
        href={`/medicos/${medico.id}/agendar`}
        className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Agendar
      </Link>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}
