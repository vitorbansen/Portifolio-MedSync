'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  DiaSemana,
  fetchMe,
  getMedico,
  Medico,
  updateMedico,
} from '@/lib/api';
import { getToken } from '@/lib/auth';
import { DIAS_SEMANA, DIAS_SEMANA_LABEL } from '@/lib/format';

type HorariosForm = Partial<Record<DiaSemana, string>>;

function horariosToForm(h: Medico['horariosAtendimento']): HorariosForm {
  if (!h) return {};
  const out: HorariosForm = {};
  for (const dia of DIAS_SEMANA) {
    const ranges = h[dia];
    if (ranges && ranges.length > 0) out[dia] = ranges.join(', ');
  }
  return out;
}

export default function EditarMedicoPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [medico, setMedico] = useState<Medico | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [crm, setCrm] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [horarios, setHorarios] = useState<HorariosForm>({});
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    try {
      const [u, m] = await Promise.all([fetchMe(token), getMedico(token, id)]);
      if (u.role !== 'ADMINISTRADOR') {
        router.replace('/dashboard');
        return;
      }
      setMedico(m);
      setNome(m.usuario.nome);
      setEmail(m.usuario.email);
      setCrm(m.crm);
      setEspecialidade(m.especialidade);
      setHorarios(horariosToForm(m.horariosAtendimento));
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar');
    }
  }, [id, router]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function parseHorarios(): Partial<Record<DiaSemana, string[]>> | null {
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
          throw new Error(
            `Formato inválido em ${DIAS_SEMANA_LABEL[dia]}: "${r}" (use HH:MM-HH:MM)`,
          );
        }
      }
      resultado[dia] = ranges;
      algum = true;
    }
    return algum ? resultado : null;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setSucesso(null);
    const token = getToken();
    if (!token || !medico) return;

    let horariosAtendimento: Partial<Record<DiaSemana, string[]>> | null;
    try {
      horariosAtendimento = parseHorarios();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Horários inválidos');
      return;
    }

    setEnviando(true);
    try {
      const atualizado = await updateMedico(token, id, {
        nome: nome.trim(),
        email: email.trim(),
        crm: crm.trim(),
        especialidade: especialidade.trim(),
        horariosAtendimento,
      });
      setMedico(atualizado);
      setSucesso('Dados atualizados com sucesso.');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao atualizar');
    } finally {
      setEnviando(false);
    }
  }

  if (!medico) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="h-10 w-64 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 h-80 animate-pulse rounded-xl bg-slate-100" />
        {erro && <p className="mt-4 text-red-700">{erro}</p>}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Editar médico</h1>
          <p className="text-slate-500">
            Atualize os dados de {medico.usuario.nome}.
          </p>
        </div>
        <Link
          href="/admin/medicos"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Voltar
        </Link>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:grid-cols-2"
      >
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
            {enviando ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </main>
  );
}
