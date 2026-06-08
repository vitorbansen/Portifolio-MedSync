'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Agendamento,
  createAgendamento,
  fetchMe,
  listAgendamentos,
  Usuario,
  cancelarAgendamento,
  reagendarAgendamento,
} from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth';
import { formatIntervalo } from '@/lib/format';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const STATUS_COR: Record<Agendamento['status'], string> = {
  AGENDADO: 'bg-blue-100 text-blue-800',
  CONFIRMADO: 'bg-emerald-100 text-emerald-800',
  CANCELADO: 'bg-slate-200 text-slate-600',
  REALIZADO: 'bg-purple-100 text-purple-800',
};

const BLOCO_COR: Record<Agendamento['status'], string> = {
  AGENDADO: 'bg-blue-50 border-blue-300 text-blue-900',
  CONFIRMADO: 'bg-emerald-50 border-emerald-300 text-emerald-900',
  CANCELADO: 'bg-slate-100 border-slate-300 text-slate-500 line-through',
  REALIZADO: 'bg-purple-50 border-purple-300 text-purple-900',
};

const DIA_INICIO_H = 8;
const DIA_FIM_H = 22;
const SLOT_MIN = 30;
const SLOT_PX = 40;
const TOTAL_SLOTS = ((DIA_FIM_H - DIA_INICIO_H) * 60) / SLOT_MIN;
const TIMELINE_PX = TOTAL_SLOTS * SLOT_PX;

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatHora(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [agendamentos, setAgendamentos] = useState<Agendamento[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);
  const [historicoVisiveis, setHistoricoVisiveis] = useState(3);
  const [reagendandoId, setReagendandoId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    try {
      const [u, ags] = await Promise.all([fetchMe(token), listAgendamentos(token)]);
      setUsuario(u);
      setAgendamentos(ags);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Sessão expirada');
      clearToken();
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function cancelar(id: string) {
    const token = getToken();
    if (!token) return;
    setCancelandoId(id);
    try {
      const atualizado = await cancelarAgendamento(token, id);
      setAgendamentos((atual) =>
        atual?.map((a) => (a.id === id ? atualizado : a)) ?? atual,
      );
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cancelar');
    } finally {
      setCancelandoId(null);
    }
  }

  async function reagendar(id: string, periodoInicio: string, periodoFim: string) {
    const token = getToken();
    if (!token) return;
    try {
      const atualizado = await reagendarAgendamento(token, id, periodoInicio, periodoFim);
      setAgendamentos((atual) =>
        atual?.map((a) => (a.id === id ? atualizado : a)) ?? atual,
      );
      setReagendandoId(null);
    } catch (err) {
      throw err;
    }
  }

  function sair() {
    clearToken();
    router.push('/login');
  }

  if (erro)
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />
        <main className="flex-1 p-6 text-red-700">{erro}</main>
        <Footer />
      </div>
    );
  if (!usuario || !agendamentos) return <SkeletonDashboard />;

  const isMedico = usuario.role === 'MEDICO';
  const isAdmin = usuario.role === 'ADMINISTRADOR';
  const ativos = agendamentos.filter(
    (a) => a.status === 'AGENDADO' || a.status === 'CONFIRMADO',
  );
  const passados = agendamentos.filter(
    (a) => a.status === 'CANCELADO' || a.status === 'REALIZADO',
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Olá, {usuario.nome}</h1>
          <p className="mt-1 text-slate-500">Bem-vindo de volta à sua área.</p>
        </div>

      {isMedico ? (
        <FormAgendamentoMedico
          onCriado={(novo) => setAgendamentos((atual) => [...(atual ?? []), novo])}
        />
      ) : (
        <div className="mb-8 flex flex-wrap gap-3">
          {!isAdmin && (
            <Link
              href="/medicos"
              className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700"
            >
              Buscar médicos e agendar
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin/medicos"
              className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700"
            >
              Gerenciar médicos
            </Link>
          )}
        </div>
      )}

      {isMedico ? (
        <>
          <TimelineMedico agendamentos={agendamentos} />
          <section className="mb-10">
            <h2 className="mb-3 text-lg font-semibold text-slate-800">Próximas consultas</h2>
            {ativos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <p className="text-slate-800">Nenhuma consulta ativa</p>
                <p className="mt-1 text-sm text-slate-500">
                  Registre novos agendamentos pelo formulário acima.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {ativos.map((a) => (
                  <AgendamentoItem
                    key={a.id}
                    agendamento={a}
                    isMedico={true}
                    cancelando={cancelandoId === a.id}
                    onCancelar={() => cancelar(a.id)}
                    onReagendar={() => setReagendandoId(a.id)}
                  />
                ))}
              </ul>
            )}
          </section>
        </>
      ) : (
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">
            Próximos agendamentos
          </h2>
          {ativos.length === 0 ? (
            <EmptyState
              titulo="Nenhum agendamento ativo"
              descricao="Você ainda não tem consultas marcadas."
              acao={{ href: '/medicos', texto: 'Buscar médico' }}
            />
          ) : (
            <ul className="space-y-3">
              {ativos.map((a) => (
                <AgendamentoItem
                  key={a.id}
                  agendamento={a}
                  isMedico={isMedico}
                  cancelando={cancelandoId === a.id}
                  onCancelar={() => cancelar(a.id)}
                  onReagendar={() => setReagendandoId(a.id)}
                />
              ))}
            </ul>
          )}
        </section>
      )}

      {passados.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Histórico</h2>
          <ul className="space-y-3">
            {passados.slice(0, historicoVisiveis).map((a) => (
              <AgendamentoItem key={a.id} agendamento={a} isMedico={isMedico} />
            ))}
          </ul>
          {passados.length > historicoVisiveis && (
            <button
              onClick={() => setHistoricoVisiveis((v) => v + 10)}
              className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Carregar mais ({passados.length - historicoVisiveis} restantes)
            </button>
          )}
        </section>
      )}
      </main>
      <Footer />

      {reagendandoId && (
        <ModalReagendar
          agendamento={agendamentos!.find((a) => a.id === reagendandoId)!}
          onConfirmar={(inicio, fim) => reagendar(reagendandoId, inicio, fim)}
          onFechar={() => setReagendandoId(null)}
        />
      )}
    </div>
  );
}

function FormAgendamentoMedico({
  onCriado,
}: {
  onCriado: (novo: Agendamento) => void;
}) {
  const [pacienteNome, setPacienteNome] = useState('');
  const [pacienteTelefone, setPacienteTelefone] = useState('');
  const [data, setData] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [duracao, setDuracao] = useState(30);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setSucesso(null);
    const token = getToken();
    if (!token) return;

    const inicio = new Date(`${data}T${horaInicio}:00`);
    if (Number.isNaN(inicio.getTime())) {
      setErro('Data ou hora inválida');
      return;
    }
    const fim = new Date(inicio.getTime() + duracao * 60000);

    setEnviando(true);
    try {
      const criado = await createAgendamento(token, {
        pacienteNome: pacienteNome.trim(),
        pacienteTelefone: pacienteTelefone.trim(),
        periodoInicio: inicio.toISOString(),
        periodoFim: fim.toISOString(),
      });
      onCriado(criado);
      setSucesso(`Consulta agendada para ${formatIntervalo(criado.periodoInicio, criado.periodoFim)}`);
      setPacienteNome('');
      setPacienteTelefone('');
      setData('');
      setHoraInicio('');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao agendar');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="mb-8 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-1 text-lg font-semibold text-slate-800">Agendar consulta</h2>
      <p className="mb-4 text-sm text-slate-500">
        Preencha os dados do paciente e o horário desejado.
      </p>
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nome do paciente
          </label>
          <input
            type="text"
            required
            minLength={2}
            value={pacienteNome}
            onChange={(e) => setPacienteNome(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Telefone
          </label>
          <input
            type="tel"
            required
            placeholder="(47) 99999-0000"
            value={pacienteTelefone}
            onChange={(e) => setPacienteTelefone(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Duração
          </label>
          <select
            value={duracao}
            onChange={(e) => setDuracao(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand focus:outline-none"
          >
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
            <option value={90}>90 min</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Data</label>
          <input
            type="date"
            required
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Hora de início
          </label>
          <input
            type="time"
            required
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand focus:outline-none"
          />
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
            {enviando ? 'Agendando…' : 'Agendar consulta'}
          </button>
        </div>
      </form>
    </section>
  );
}

function AgendamentoItem({
  agendamento,
  isMedico,
  onCancelar,
  cancelando,
  onReagendar,
}: {
  agendamento: Agendamento;
  isMedico: boolean;
  onCancelar?: () => void;
  cancelando?: boolean;
  onReagendar?: () => void;
}) {
  const ativo =
    agendamento.status === 'AGENDADO' || agendamento.status === 'CONFIRMADO';
  const podeCancelar = onCancelar && ativo;
  const podeReagendar =
    onReagendar &&
    ativo &&
    new Date(agendamento.periodoInicio).getTime() - Date.now() > 24 * 60 * 60 * 1000;

  const titulo = isMedico
    ? agendamento.paciente.nome
    : agendamento.medico.usuario.nome;
  const subtitulo = isMedico
    ? agendamento.paciente.telefone
    : `${agendamento.medico.especialidade} · ${agendamento.medico.crm}`;

  return (
    <li className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-900">{titulo}</div>
          <div className="text-sm text-slate-500">{subtitulo}</div>
          <div className="mt-2 text-sm text-slate-700">
            {formatIntervalo(agendamento.periodoInicio, agendamento.periodoFim)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COR[agendamento.status]}`}
          >
            {agendamento.status}
          </span>
          {podeReagendar && (
            <button
              onClick={onReagendar}
              className="rounded-md border border-amber-300 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50"
            >
              Reagendar
            </button>
          )}
          {podeCancelar && (
            <button
              onClick={onCancelar}
              disabled={cancelando}
              className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {cancelando ? 'Cancelando…' : 'Cancelar'}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function EmptyState({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao: string;
  acao?: { href: string; texto: string };
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="text-slate-800">{titulo}</p>
      <p className="mt-1 text-sm text-slate-500">{descricao}</p>
      {acao && (
        <Link
          href={acao.href}
          className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          {acao.texto}
        </Link>
      )}
    </div>
  );
}

function TimelineMedico({ agendamentos }: { agendamentos: Agendamento[] }) {
  const [dia, setDia] = useState(hojeISO);

  const diaInicio = useMemo(() => {
    const [y, m, d] = dia.split('-').map(Number);
    return new Date(y, m - 1, d, DIA_INICIO_H, 0, 0, 0);
  }, [dia]);

  const diaFim = useMemo(() => {
    const d = new Date(diaInicio);
    d.setHours(DIA_FIM_H, 0, 0, 0);
    return d;
  }, [diaInicio]);

  const agendamentosDoDia = useMemo(
    () =>
      agendamentos.filter((a) => {
        if (a.status !== 'AGENDADO' && a.status !== 'CONFIRMADO') return false;
        const inicio = new Date(a.periodoInicio);
        return inicio >= diaInicio && inicio < diaFim;
      }),
    [agendamentos, diaInicio, diaFim],
  );

  const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
    const minutes = DIA_INICIO_H * 60 + i * SLOT_MIN;
    return `${pad2(Math.floor(minutes / 60))}:${pad2(minutes % 60)}`;
  });

  function getBlockStyle(inicio: Date, fim: Date) {
    const minDoInicio = Math.max(0, (inicio.getTime() - diaInicio.getTime()) / 60000);
    const duracao = (fim.getTime() - inicio.getTime()) / 60000;
    const top = (minDoInicio / SLOT_MIN) * SLOT_PX;
    const height = Math.max(SLOT_PX * 0.5, (duracao / SLOT_MIN) * SLOT_PX);
    return { top: `${top}px`, height: `${height}px` };
  }

  return (
    <section className="mb-10">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-800">Agenda do dia</h2>
        <input
          type="date"
          value={dia}
          onChange={(e) => setDia(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="relative" style={{ height: TIMELINE_PX }}>
          {slots.map((time, i) => (
            <div
              key={time}
              className="absolute inset-x-0 flex items-start border-t border-slate-100"
              style={{ top: i * SLOT_PX, height: SLOT_PX }}
            >
              <span className="w-14 pl-1 pt-1 text-xs font-medium text-slate-400">
                {time}
              </span>
            </div>
          ))}
          {agendamentosDoDia.map((a) => {
            const inicio = new Date(a.periodoInicio);
            const fim = new Date(a.periodoFim);
            const email = a.paciente.usuario?.email;
            const tooltip = [
              a.paciente.nome,
              `${formatHora(inicio)}–${formatHora(fim)}`,
              a.paciente.telefone,
              email ?? 'sem e-mail cadastrado',
              a.status,
            ].join(' · ');
            return (
              <div
                key={a.id}
                className={`absolute left-16 right-2 overflow-hidden rounded-md border px-3 py-1 text-xs leading-tight shadow-sm ${BLOCO_COR[a.status]}`}
                style={getBlockStyle(inicio, fim)}
                title={tooltip}
              >
                <div className="truncate text-sm font-semibold">
                  {a.paciente.nome}{' '}
                  <span className="font-normal opacity-80">
                    · {formatHora(inicio)}–{formatHora(fim)}
                  </span>
                </div>
                <div className="truncate opacity-80">
                  {a.paciente.telefone}
                  {email ? ` · ${email}` : ''}
                </div>
              </div>
            );
          })}
        </div>
        {agendamentosDoDia.length === 0 && (
          <p className="mt-3 text-center text-sm text-slate-400">
            Nenhum agendamento neste dia.
          </p>
        )}
      </div>
    </section>
  );
}

function ModalReagendar({
  agendamento,
  onConfirmar,
  onFechar,
}: {
  agendamento: Agendamento;
  onConfirmar: (periodoInicio: string, periodoFim: string) => Promise<void>;
  onFechar: () => void;
}) {
  const duracaoMs =
    new Date(agendamento.periodoFim).getTime() -
    new Date(agendamento.periodoInicio).getTime();

  const [data, setData] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const inicio = new Date(`${data}T${horaInicio}:00`);
    if (Number.isNaN(inicio.getTime())) {
      setErro('Data ou hora inválida');
      return;
    }
    const fim = new Date(inicio.getTime() + duracaoMs);
    setSalvando(true);
    try {
      await onConfirmar(inicio.toISOString(), fim.toISOString());
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao reagendar');
      setSalvando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-1 text-lg font-bold text-slate-900">Reagendar consulta</h2>
        <p className="mb-5 text-sm text-slate-500">
          A duração será mantida ({Math.round(duracaoMs / 60000)} min). Escolha uma nova data e
          hora.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nova data</label>
            <input
              type="date"
              required
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Novo horário de início
            </label>
            <input
              type="time"
              required
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand focus:outline-none"
            />
          </div>

          {erro && (
            <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{erro}</div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 rounded-lg bg-amber-500 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
            >
              {salvando ? 'Salvando…' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="mb-8 h-10 w-64 animate-pulse rounded bg-slate-200" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
