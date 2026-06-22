import { gerarSlotsDoDia, gerarProximosDias } from './slots';

describe('gerarSlotsDoDia', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-22T10:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('gera slots de 30 minutos dentro do intervalo', () => {
    const dia = new Date('2026-06-23T00:00:00');
    const slots = gerarSlotsDoDia(dia, ['08:00-09:00']);

    expect(slots).toHaveLength(2);
    expect(slots[0].inicio.getHours()).toBe(8);
    expect(slots[0].inicio.getMinutes()).toBe(0);
    expect(slots[0].fim.getMinutes()).toBe(30);
    expect(slots[1].inicio.getMinutes()).toBe(30);
    expect(slots[1].fim.getHours()).toBe(9);
  });

  it('ignora intervalos malformados', () => {
    const dia = new Date('2026-06-23T00:00:00');
    expect(gerarSlotsDoDia(dia, ['invalido'])).toHaveLength(0);
  });

  it('nao gera slot que extrapola o fim do intervalo', () => {
    const dia = new Date('2026-06-23T00:00:00');
    const slots = gerarSlotsDoDia(dia, ['08:00-08:45'], 30);
    expect(slots).toHaveLength(1);
  });

  it('exclui horarios que ja passaram no dia de hoje', () => {
    const hoje = new Date('2026-06-22T00:00:00');
    expect(gerarSlotsDoDia(hoje, ['08:00-09:00'])).toHaveLength(0);
  });

  it('inclui horarios futuros no dia de hoje', () => {
    const hoje = new Date('2026-06-22T00:00:00');
    expect(gerarSlotsDoDia(hoje, ['11:00-12:00'])).toHaveLength(2);
  });

  it('suporta multiplos intervalos no mesmo dia', () => {
    const dia = new Date('2026-06-23T00:00:00');
    const slots = gerarSlotsDoDia(dia, ['08:00-09:00', '14:00-14:30']);
    expect(slots).toHaveLength(3);
  });
});

describe('gerarProximosDias', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-22T08:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('retorna apenas dias com horarios configurados e slots futuros', () => {
    const DIAS_ORDEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'] as const;
    const hojeKey = DIAS_ORDEM[new Date().getDay()];
    const dias = gerarProximosDias({ [hojeKey]: ['09:00-10:00'] }, 14);

    expect(dias.length).toBeGreaterThan(0);
    expect(dias.every((d) => d.slots.length > 0)).toBe(true);
  });

  it('retorna vazio quando nao ha horarios configurados', () => {
    expect(gerarProximosDias({}, 14)).toHaveLength(0);
  });

  it('respeita a quantidade de dias informada', () => {
    const dias = gerarProximosDias({}, 5);
    expect(dias.length).toBeLessThanOrEqual(5);
  });
});
