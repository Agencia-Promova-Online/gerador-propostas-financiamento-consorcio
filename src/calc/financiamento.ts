import { round2, safeDivide } from '@/calc/money';

export type AmortSystem = 'SAC' | 'PRICE';
export type RateMode = 'nominal' | 'efetiva';

export interface FinanciamentoInput {
  system: AmortSystem;
  rateMode: RateMode;
  credit: number;
  down: number;
  annualRatePct: number;
  term: number;
  cartorio: number;
  cartorioInTotal: boolean;
  commitmentPct: number;
}

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export type FinanciamentoField =
  | 'financiado'
  | 'parcela'
  | 'ultimaParcela'
  | 'rendaExigida'
  | 'apenasJuros'
  | 'totalJuros'
  | 'financiadoMaisJuros'
  | 'totalPago';

export type Overrides<K extends string> = Partial<Record<K, number>>;

export type FinanciamentoOverrides = Overrides<FinanciamentoField>;

export interface FinanciamentoResult {
  monthlyRate: number;
  financiado: number;
  parcela: number;
  ultimaParcela: number;
  rendaExigida: number;
  apenasJuros: number;
  totalJuros: number;
  financiadoMaisJuros: number;
  totalPago: number;
}

export function monthlyRate(annualRatePct: number, mode: RateMode): number {
  const a = annualRatePct / 100;
  return mode === 'nominal' ? a / 12 : Math.pow(1 + a, 1 / 12) - 1;
}

export function price(principal: number, i: number, n: number): number {
  if (n <= 0) return 0;
  if (i === 0) return safeDivide(principal, n);
  return (principal * i) / (1 - Math.pow(1 + i, -n));
}

export function calcFinanciamento(
  input: FinanciamentoInput,
  overrides: FinanciamentoOverrides = {},
): FinanciamentoResult {
  const i = monthlyRate(input.annualRatePct, input.rateMode);
  const n = Math.max(0, Math.floor(input.term));

  const financiado = overrides.financiado ?? round2(input.credit - input.down);
  const amortizacao = safeDivide(financiado, n);

  const parcelaAuto =
    input.system === 'SAC' ? round2(amortizacao + financiado * i) : round2(price(financiado, i, n));
  const parcela = overrides.parcela ?? parcelaAuto;

  const ultimaParcelaAuto =
    input.system === 'SAC' ? round2(amortizacao * (1 + i)) : round2(price(financiado, i, n));
  const ultimaParcela = overrides.ultimaParcela ?? ultimaParcelaAuto;

  const totalJurosAuto =
    input.system === 'SAC'
      ? round2((i * financiado * (n + 1)) / 2)
      : round2(parcela * n - financiado);
  const totalJuros = overrides.totalJuros ?? totalJurosAuto;

  const rendaExigida = overrides.rendaExigida ?? round2(safeDivide(parcela, input.commitmentPct / 100));
  const apenasJuros = overrides.apenasJuros ?? round2(financiado * i);
  const financiadoMaisJuros = overrides.financiadoMaisJuros ?? round2(financiado + totalJuros);

  const totalPagoAuto = round2(
    financiado + totalJuros + input.down + (input.cartorioInTotal ? input.cartorio : 0),
  );
  const totalPago = overrides.totalPago ?? totalPagoAuto;

  return {
    monthlyRate: i,
    financiado,
    parcela,
    ultimaParcela,
    rendaExigida,
    apenasJuros,
    financiadoMaisJuros,
    totalJuros,
    totalPago,
  };
}

export function validateFinanciamento(input: FinanciamentoInput): FieldErrors<'down' | 'term' | 'annualRatePct'> {
  const errors: FieldErrors<'down' | 'term' | 'annualRatePct'> = {};
  if (input.down > input.credit) errors.down = 'A entrada não pode ser maior que o crédito.';
  if (!Number.isInteger(input.term) || input.term < 1) errors.term = 'Informe um prazo de pelo menos 1 mês.';
  if (input.annualRatePct < 0) errors.annualRatePct = 'Os juros não podem ser negativos.';
  return errors;
}
