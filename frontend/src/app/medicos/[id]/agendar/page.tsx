'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createAgendamento,
  getMedico,
  listSlotsOcupados,
  Medico,
  SlotOcupado,
} from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth';
import { formatData, formatHora } from '@/lib/format';
import { gerarProximosDias, Slot } from '@/lib/slots';

export default function AgendarPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const medicoId = params.id;

  const [medico, setMedico] = useState<Medico | null>(null);
  const [ocupados, setOcupados] = useState<SlotOcupado[]>([]);
  const [slotSelecionado, setSlotSelecionado] = useState<Slot | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sucessoId, setSucessoId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    try {
      const [m, o] = await Promise.all([
        getMedico(token, medicoId),
        listSlotsOcupados(token, medicoId),
      ]);
      setMedico(m);
      setOcupados(o);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar médico';
      if (msg.toLowerCase().includes('token')) {
        clearToken();
        router.replace('/login');
        return;
      }
      setErro(msg);
    }
  }, [medicoId, router]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const dias = useMemo(() => {
    if (!medico?.horariosAtendimento) return [];
    const todos = gerarProximosDias(medico.horariosAtendimento);
    const ocupadosRanges = ocupados.map((o) => ({
      inicio: new Date(o.periodoInicio).getTime(),
      fim: new Date(o.periodoFim).getTime(),
    }));
    return todos
      .map(({ dia, slots }) => ({
        dia,
        slots: slots.filter((s) => {
          const ini = s.inicio.getTime();
          const fim = s.fim.getTime();
          return !ocupadosRanges.some((r) => ini < r.fim && fim > r.inicio);
        }),
      }))
      .filter((d) => d.slots.length > 0);
  }, [medico, ocupados]);

  async function confirmar() {
    if (!slotSelecionado) return;
    const token = getToken();
    if (!token) return;
    setEnviando(true);
    setErro(null);
    try {
      const agendamento = await createAgendamento(token, {
        medicoId,
        periodoInicio: slotSelecionado.inicio.toISOString(),
        periodoFim: slotSelecionado.fim.toISOString(),
      });
      setSucessoId(agendamento.id);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao agendar');
      setSlotSelecionado(null);
      carregar();
    } finally {
      setEnviando(false);
    }
  }

  if (!medico && !erro) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
      </main>
    );
  }

  if (sucessoId) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
          ✓
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Agendamento confirmado</h1>
        {slotSelecionado && (
          <p className="mb-6 text-slate-600">
            {medico?.usuario.nome} · {formatData(slotSelecionado.inicio.toISOString())} às{' '}
            {formatHora(slotSelecionado.inicio.toISOString())}
          </p>
        )}
        <Link
          href="/dashboard"
          className="inline-block rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Ver meus agendamentos
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/medicos" className="text-sm text-slate-500 hover:text-slate-700">
        ← Voltar à busca
      </Link>

      {medico && (
        <header className="mt-2 mb-6">
          <h1 className="text-3xl font-bold text-slate-900">{medico.usuario.nome}</h1>
          <p className="text-emerald-700">{medico.especialidade}</p>
          <p className="text-xs text-slate-500">{medico.crm}</p>
        </header>
      )}

      {erro && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {erro}
          {erro.toLowerCase().includes('horário') && (
            <span className="ml-1">Selecione outro horário abaixo.</span>
          )}
        </div>
      )}

      {dias.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
          Este profissional não possui horários cadastrados nos próximos 14 dias.
        </div>
      ) : (
        <div className="space-y-6">
          {dias.map(({ dia, slots }) => (
            <section
              key={dia.toISOString()}
              className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
            >
              <h2 className="mb-3 font-semibold text-slate-800">
                {dia.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: '2-digit',
                })}
              </h2>
              <div className="flex flex-wrap gap-2">
                {slots.map((s) => {
                  const selecionado =
                    slotSelecionado?.inicio.getTime() === s.inicio.getTime();
                  return (
                    <button
                      key={s.inicio.toISOString()}
                      onClick={() => setSlotSelecionado(s)}
                      className={`rounded-md border px-3 py-2 text-sm transition ${
                        selecionado
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      {formatHora(s.inicio.toISOString())}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {slotSelecionado && (
        <div className="sticky bottom-4 mt-6 flex items-center justify-between gap-4 rounded-xl bg-slate-900 p-4 text-white shadow-lg">
          <div className="text-sm">
            <div className="font-semibold">
              {formatData(slotSelecionado.inicio.toISOString())} ·{' '}
              {formatHora(slotSelecionado.inicio.toISOString())} –{' '}
              {formatHora(slotSelecionado.fim.toISOString())}
            </div>
            <div className="text-slate-300">{medico?.usuario.nome}</div>
          </div>
          <button
            onClick={confirmar}
            disabled={enviando}
            className="rounded-lg bg-emerald-500 px-5 py-2 font-semibold hover:bg-emerald-400 disabled:opacity-50"
          >
            {enviando ? 'Agendando…' : 'Confirmar agendamento'}
          </button>
        </div>
      )}
    </main>
  );
}
