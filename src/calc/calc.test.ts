import { describe, expect, it } from 'vitest';
import { calcFinanciamento, monthlyRate, type FinanciamentoInput } from '@/calc/financiamento';
import { calcConsorcio, resolveParcelas, type ConsorcioInput } from '@/calc/consorcio';
import { buildComparativo, calcEconomia } from '@/calc/comparativo';

const finBase: FinanciamentoInput = {
  system: 'SAC',
  rateMode: 'nominal',
  credit: 100000,
  down: 20000,
  annualRatePct: 12,
  term: 12,
  cartorio: 3000,
  cartorioInTotal: false,
  commitmentPct: 30,
};

const consBase: ConsorcioInput = {
  credit: 50000,
  adesao: 500,
  lance: 0,
  entrada: 1000,
  term: 100,
  embutidas: 0,
  cheiaAuto: false,
  linked: true,
  commitmentPct: 30,
};

describe('taxa mensal', () => {
  it('nominal divide a taxa anual por 12', () => {
    expect(monthlyRate(12, 'nominal')).toBeCloseTo(0.01, 10);
  });

  it('efetiva usa raiz 12 da taxa anual', () => {
    expect(monthlyRate(12, 'efetiva')).toBeCloseTo(Math.pow(1.12, 1 / 12) - 1, 10);
  });
});

describe('financiamento SAC', () => {
  const r = calcFinanciamento(finBase);

  it('financia crédito menos entrada', () => {
    expect(r.financiado).toBe(80000);
  });

  it('calcula a primeira parcela como amortização mais juros', () => {
    expect(r.parcela).toBe(7466.67);
  });

  it('calcula a última parcela', () => {
    expect(r.ultimaParcela).toBe(6733.33);
  });

  it('calcula o total de juros pela fórmula i x F x (n + 1) / 2', () => {
    expect(r.totalJuros).toBe(5200);
  });

  it('calcula renda exigida com comprometimento de 30%', () => {
    expect(r.rendaExigida).toBe(24888.9);
  });

  it('soma entrada ao total pago sem cartório por padrão', () => {
    expect(r.totalPago).toBe(105200);
  });

  it('soma cartório ao total quando optado', () => {
    expect(calcFinanciamento({ ...finBase, cartorioInTotal: true }).totalPago).toBe(108200);
  });

  it('respeita valores sobrescritos manualmente', () => {
    const o = calcFinanciamento(finBase, { parcela: 8000 });
    expect(o.parcela).toBe(8000);
    expect(o.rendaExigida).toBe(26666.67);
  });
});

describe('financiamento Price', () => {
  const r = calcFinanciamento({ ...finBase, system: 'PRICE' });

  it('calcula PMT fixo', () => {
    expect(r.parcela).toBeCloseTo(7107.9, 2);
    expect(r.ultimaParcela).toBe(r.parcela);
  });

  it('calcula total de juros como PMT x n - F', () => {
    expect(r.totalJuros).toBeCloseTo(r.parcela * 12 - 80000, 2);
  });
});

describe('consórcio', () => {
  it('calcula total, taxas e renda mínima com parcela cheia manual', () => {
    const r = calcConsorcio(consBase, { cheia: 1000 });
    expect(r.totalPago).toBe(101500);
    expect(r.taxas).toBe(51500);
    expect(r.rendaMinima).toBe(3333.33);
  });

  it('desconta parcelas embutidas do total pago', () => {
    const r = calcConsorcio({ ...consBase, embutidas: 10 }, { cheia: 1000 });
    expect(r.parcelasPagas).toBe(90);
    expect(r.totalPago).toBe(91500);
  });

  it('estima parcela cheia pelo crédito dividido pelo prazo quando automático', () => {
    const r = calcConsorcio({ ...consBase, cheiaAuto: true });
    expect(r.cheia).toBe(500);
  });
});

describe('vínculo desconto e parcela reduzida', () => {
  it('desconto de 20% gera reduzida de 800', () => {
    expect(resolveParcelas(1000, true, { desconto: 20 })).toEqual({ desconto: 20, reduzida: 800 });
  });

  it('reduzida editada recalcula o desconto', () => {
    expect(resolveParcelas(1000, true, { reduzida: 750 })).toEqual({ desconto: 25, reduzida: 750 });
  });

  it('sem vínculo, a reduzida segue o desconto apenas quando não foi editada', () => {
    expect(resolveParcelas(1000, false, { desconto: 10 })).toEqual({ desconto: 10, reduzida: 900 });
    expect(resolveParcelas(1000, false, { desconto: 10, reduzida: 950 })).toEqual({
      desconto: 10,
      reduzida: 950,
    });
  });
});

describe('comparativo', () => {
  const fin = { parcela: 7466.67, totalPago: 105200, custoAlemDoBem: 25200, rendaMinima: 24889, prazo: 12 };
  const cons = { parcela: 1000, totalPago: 101500, custoAlemDoBem: 51500, rendaMinima: 3333.33, prazo: 100 };

  it('destaca o menor custo em cada linha de custo', () => {
    const rows = buildComparativo(fin, cons);
    expect(rows.find((r) => r.key === 'custo')?.best).toBe('financiamento');
    expect(rows.find((r) => r.key === 'renda')?.best).toBe('consorcio');
    expect(rows.find((r) => r.key === 'prazo')?.best).toBeNull();
  });

  it('calcula a economia em reais e percentual', () => {
    const e = calcEconomia(fin, cons);
    expect(e?.best).toBe('financiamento');
    expect(e?.valor).toBe(26300);
    expect(e?.percent).toBeCloseTo((26300 / 51500) * 100, 5);
  });
});
