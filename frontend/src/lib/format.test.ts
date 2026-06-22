import {
  formatData,
  formatDataHora,
  formatHora,
  formatIntervalo,
  toIsoYmd,
  DIAS_SEMANA,
  DIAS_SEMANA_LABEL,
} from './format';

describe('format', () => {
  it('formatData formata para dd/mm/aaaa', () => {
    expect(formatData('2026-06-22T10:00:00')).toMatch(/^\d{2}\/\d{2}\/2026$/);
  });

  it('formatHora formata para hh:mm', () => {
    expect(formatHora('2026-06-22T10:30:00')).toMatch(/^\d{2}:\d{2}$/);
  });

  it('formatDataHora combina data e hora', () => {
    const r = formatDataHora('2026-06-22T10:30:00');
    expect(r).toMatch(/^\d{2}\/\d{2}\/2026.*\d{2}:\d{2}$/);
  });

  it('formatIntervalo combina inicio e fim com separadores', () => {
    const r = formatIntervalo('2026-06-22T10:00:00', '2026-06-22T10:30:00');
    expect(r).toContain('·');
    expect(r).toContain('–');
  });

  it('toIsoYmd formata yyyy-mm-dd com zero-padding', () => {
    expect(toIsoYmd(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toIsoYmd(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  it('DIAS_SEMANA_LABEL mapeia todos os dias da semana', () => {
    DIAS_SEMANA.forEach((dia) => {
      expect(DIAS_SEMANA_LABEL[dia]).toBeTruthy();
    });
  });
});
