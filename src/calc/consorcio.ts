import { round2, safeDivide } from '@/calc/money';
import type { FieldErrors, Overrides } from '@/calc/financiamento';

export type ConsorcioField = 'cheia' | 'desconto' | 'reduzida' | 'taxas' | 'totalPago' | 'rendaMinima';

export type ConsorcioOverrides = Overrides<ConsorcioField>;

export interface ConsorcioInput {
  credit: number;
  adesao: number;
  lance: number;
  entrada: number;
  term: number;
  embutidas: number;
  cheiaAuto: boolean;
  linked: boolean;
  commitmentPct: number;
}

export interface ConsorcioParcelas {
  desconto: number;
  reduzida: number;
}

export interface ConsorcioResult {
  cheia: number | null;
  desconto: number;
  reduzida: number;
  parcelasPagas: number;
  taxas: number;
  totalPago: number;
  rendaMinima: number;
}

export function estimateCheia(credit: number, term: number): number {
  return round2(safeDivide(credit, term));
}

export function resolveCheia(
  input: Pick<ConsorcioInput, 'credit' | 'term' | 'cheiaAuto'>,
  overrides: ConsorcioOverrides,
): number | null {
  if (overrides.cheia !== undefined) return overrides.cheia;
  return input.cheiaAuto ? estimateCheia(input.credit, input.term) : null;
}

/**
 * Resolve o par desconto/reduzida. Com vínculo ativo, a última edição manual
 * prevalece e o outro campo é derivado; sem vínculo, cada campo é independente.
 */
export function resolveParcelas(
  cheia: number,
  linked: boolean,
  overrides: Pick<ConsorcioOverrides, 'desconto' | 'reduzida'>,
): ConsorcioParcelas {
  const hasDesconto = overrides.desconto !== undefined;
  const hasReduzida = overrides.reduzida !== undefined;

  if (linked && hasReduzida && !hasDesconto) {
    const reduzida = overrides.reduzida as number;
    const desconto = cheia > 0 ? round2((1 - reduzida / cheia) * 100) : 0;
    return { desconto, reduzida };
  }

  const desconto = overrides.desconto ?? 0;
  const reduzida = overrides.reduzida ?? round2(cheia * (1 - desconto / 100));
  return { desconto, reduzida };
}

export function calcConsorcio(
  input: ConsorcioInput,
  overrides: ConsorcioOverrides = {},
): ConsorcioResult {
  const cheiaValue = resolveCheia(input, overrides);
  const cheia = cheiaValue ?? 0;
  const { desconto, reduzida } = resolveParcelas(cheia, input.linked, overrides);

  const parcelasPagas = Math.max(0, Math.floor(input.term) - Math.max(0, Math.floor(input.embutidas)));
  const totalPago =
    overrides.totalPago ??
    round2(cheia * parcelasPagas + input.adesao + input.entrada + input.lance);
  const taxas = overrides.taxas ?? round2(totalPago - input.credit);
  const rendaMinima = overrides.rendaMinima ?? round2(safeDivide(cheia, input.commitmentPct / 100));

  return {
    cheia: cheiaValue,
    desconto,
    reduzida,
    parcelasPagas,
    taxas,
    totalPago,
    rendaMinima,
  };
}

export function validateConsorcio(
  input: ConsorcioInput,
  cheia: number | null,
): FieldErrors<'term' | 'embutidas' | 'cheia'> {
  const errors: FieldErrors<'term' | 'embutidas' | 'cheia'> = {};
  if (!Number.isInteger(input.term) || input.term < 1) errors.term = 'Informe um prazo de pelo menos 1 mês.';
  if (input.embutidas < 0 || input.embutidas >= input.term) {
    errors.embutidas = 'Deve ser menor que o prazo original.';
  }
  if (cheia === null || cheia <= 0) errors.cheia = 'Informe o valor da parcela cheia.';
  return errors;
}
