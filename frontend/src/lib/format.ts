export const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'] as const;

export const DIAS_SEMANA_LABEL: Record<string, string> = {
  dom: 'Domingo',
  seg: 'Segunda',
  ter: 'Terça',
  qua: 'Quarta',
  qui: 'Quinta',
  sex: 'Sexta',
  sab: 'Sábado',
};

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const dateTimeFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const timeFmt = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
});

export function formatData(iso: string) {
  return dateFmt.format(new Date(iso));
}

export function formatDataHora(iso: string) {
  return dateTimeFmt.format(new Date(iso));
}

export function formatHora(iso: string) {
  return timeFmt.format(new Date(iso));
}

export function formatIntervalo(inicio: string, fim: string) {
  return `${formatData(inicio)} · ${formatHora(inicio)} – ${formatHora(fim)}`;
}

export function toIsoYmd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
