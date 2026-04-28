import { DiaSemana } from './api';

export interface Slot {
  inicio: Date;
  fim: Date;
}

const DIAS_ORDEM: DiaSemana[] = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
const DURACAO_SLOT_MIN = 30;

function parseHoraMin(hm: string): { h: number; m: number } {
  const [h, m] = hm.split(':').map(Number);
  return { h, m };
}

export function gerarSlotsDoDia(
  dia: Date,
  intervalos: string[],
  duracaoMinutos = DURACAO_SLOT_MIN,
): Slot[] {
  const slots: Slot[] = [];
  const agora = new Date();

  for (const intervalo of intervalos) {
    const [ini, fim] = intervalo.split('-');
    if (!ini || !fim) continue;
    const { h: hi, m: mi } = parseHoraMin(ini);
    const { h: hf, m: mf } = parseHoraMin(fim);

    const inicioIntervalo = new Date(dia);
    inicioIntervalo.setHours(hi, mi, 0, 0);
    const fimIntervalo = new Date(dia);
    fimIntervalo.setHours(hf, mf, 0, 0);

    let cursor = new Date(inicioIntervalo);
    while (cursor < fimIntervalo) {
      const fimSlot = new Date(cursor.getTime() + duracaoMinutos * 60_000);
      if (fimSlot > fimIntervalo) break;
      if (cursor > agora) {
        slots.push({ inicio: new Date(cursor), fim: fimSlot });
      }
      cursor = fimSlot;
    }
  }
  return slots;
}

export function gerarProximosDias(
  horarios: Partial<Record<DiaSemana, string[]>>,
  quantidadeDias = 14,
): { dia: Date; slots: Slot[] }[] {
  const dias: { dia: Date; slots: Slot[] }[] = [];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  for (let i = 0; i < quantidadeDias; i++) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    const chave = DIAS_ORDEM[d.getDay()];
    const intervalos = horarios[chave];
    if (!intervalos || intervalos.length === 0) continue;
    const slots = gerarSlotsDoDia(d, intervalos);
    if (slots.length > 0) dias.push({ dia: d, slots });
  }
  return dias;
}
