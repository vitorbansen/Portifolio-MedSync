'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  createMedico,
  deleteMedico,
  DiaSemana,
  fetchMe,
  listMedicos,
  Medico,
  Usuario,
} from '@/lib/api';
import { getToken } from '@/lib/auth';
import { DIAS_SEMANA, DIAS_SEMANA_LABEL } from '@/lib/format';

type HorariosForm = Partial<Record<DiaSemana, string>>;

export default function AdminMedicosPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [medicos, setMedicos] = useState<Medico[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    try {
      const [u, ms] = await Promise.all([fetchMe(token), listMedicos(token)]);
      if (u.role !== 'ADMINISTRADOR') {
        router.replace('/dashboard');
        return;
      }
      setUsuario(u);
      setMedicos(ms);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar');
    }
  }, [router]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function excluir(id: string, nome: string) {
    if (!confirm(`Excluir o médico ${nome}? Essa ação remove também o usuário associado.`)) {
      return;
    }
    const token = getToken();
    if (!token) return;
    setExcluindoId(id);
    setErro(null);
    try {
      await deleteMedico(token, id);
      setMedicos((atual) => atual?.filter((m) => m.id !== id) ?? atual);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao excluir');
    } finally {
      setExcluindoId(null);
    }
  }

  if (!usuario || !medicos) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="h-10 w-64 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
        {erro && <p className="mt-4 text-red-700">{erro}</p>}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestão de médicos</h1>
          <p className="text-slate-500">Cadastre e remova profissionais do sistema.</p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Voltar
        </Link>
      </div>

      <FormCadastro
        onCriado={(novo) => setMedicos((atual) => [...(atual ?? []), novo])}
      />

      {erro && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {erro}
        </div>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Médicos cadastrados</h2>
        {medicos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Nenhum médico cadastrado.
          </div>
        ) : (
          <ul className="space-y-3">
            {medicos.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
              >
                <div>
                  <div className="font-semibold text-slate-900">{m.usuario.nome}</div>
                  <div className="text-sm text-slate-500">
                    {m.especialidade} · CRM {m.crm}
                  </div>
                  <div className="text-xs text-slate-400">{m.usuario.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/medicos/${m.id}/editar`}
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => excluir(m.id, m.usuario.nome)}
                    disabled={excluindoId === m.id}
                    className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    {excluindoId === m.id ? 'Excluindo…' : 'Excluir'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function FormCadastro({ onCriado }: { onCriado: (m: Medico) => void }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [crm, setCrm] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [horarios, setHorarios] = useState<HorariosForm>({});
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function parseHorarios(): Partial<Record<DiaSemana, string[]>> | undefined {
    const resultado: Partial<Record<DiaSemana, string[]>> = {};
    let algum = false;
    for (const dia of DIAS_SEMANA) {
      const raw = horarios[dia]?.trim();
      if (!raw) continue;
      const ranges = raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      for (const r of ranges) {
        if (!/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(r)) {
          throw new Error(`Formato inválido em ${DIAS_SEMANA_LABEL[dia]}: "${r}" (use HH:MM-HH:MM)`);
        }
      }
      resultado[dia] = ranges;
      algum = true;
    }
    return algum ? resultado : undefined;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setSucesso(null);
    const token = getToken();
    if (!token) return;

    let horariosAtendimento: Partial<Record<DiaSemana, string[]>> | undefined;
    try {
      horariosAtendimento = parseHorarios();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Horários inválidos');
      return;
    }

    setEnviando(true);
    try {
      const criado = await createMedico(token, {
        nome: nome.trim(),
        email: email.trim(),
        senha,
        crm: crm.trim(),
        especialidade: especialidade.trim(),
        horariosAtendimento,
      });
      onCriado(criado);
      setSucesso(`${criado.usuario.nome} cadastrado com sucesso.`);
      setNome('');
      setEmail('');
      setSenha('');
      setCrm('');
      setEspecialidade('');
      setHorarios({});
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cadastrar');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-1 text-lg font-semibold text-slate-800">Cadastrar médico</h2>
      <p className="mb-4 text-sm text-slate-500">
        O profissional recebe uma conta com perfil MÉDICO e pode acessar o sistema.
      </p>

      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
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
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Senha inicial
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">CRM</label>
          <input
            type="text"
            required
            value={crm}
            onChange={(e) => setCrm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Especialidade
          </label>
          <input
            type="text"
            required
            value={especialidade}
            onChange={(e) => setEspecialidade(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Horários de atendimento
          </label>
          <p className="mb-2 text-xs text-slate-500">
            Para cada dia, informe faixas no formato <code>HH:MM-HH:MM</code>, separadas por
            vírgula. Deixe em branco para dias sem atendimento.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {DIAS_SEMANA.map((dia) => (
              <div key={dia} className="flex items-center gap-3">
                <label className="w-20 shrink-0 text-xs font-medium text-slate-600">
                  {DIAS_SEMANA_LABEL[dia]}
                </label>
                <input
                  type="text"
                  placeholder="08:00-12:00, 14:00-18:00"
                  value={horarios[dia] ?? ''}
                  onChange={(e) =>
                    setHorarios((h) => ({ ...h, [dia]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {erro && (
          <div className="sm:col-span-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            {erro}
          </div>
        )}
        {sucesso && (
          <div className="sm:col-span-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
            {sucesso}
          </div>
        )}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={enviando}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {enviando ? 'Cadastrando…' : 'Cadastrar médico'}
          </button>
        </div>
      </form>
    </section>
  );
}
