import { addDaysISO } from '@/lib/format';
import { calcConsorcio, resolveCheia, validateConsorcio, type ConsorcioResult } from '@/calc/consorcio';
import {
  calcFinanciamento,
  validateFinanciamento,
  type FieldErrors,
  type FinanciamentoResult,
} from '@/calc/financiamento';
import { buildComparativo, calcEconomia, type ComparativoRow, type Economia } from '@/calc/comparativo';
import type { ProposalState } from '@/types/proposal';

export interface Comparison {
  rows: ComparativoRow[];
  economia: Economia | null;
}

export interface ProposalResults {
  financiamento: { result: FinanciamentoResult; errors: FieldErrors<'down' | 'term' | 'annualRatePct'> };
  consorcio: { result: ConsorcioResult; errors: FieldErrors<'term' | 'embutidas' | 'cheia'> };
  comparison: Comparison | null;
  validUntil: string;
  hasErrors: boolean;
}

export function deriveResults(state: ProposalState): ProposalResults {
  const fin = state.financiamento;
  const cons = state.consorcio;

  const finResult = calcFinanciamento(fin, fin.overrides);
  const finErrors = validateFinanciamento(fin);

  const consResult = calcConsorcio(cons, cons.overrides);
  const consErrors = validateConsorcio(cons, resolveCheia(cons, cons.overrides));

  const finSide = {
    parcela: finResult.parcela,
    totalPago: finResult.totalPago,
    custoAlemDoBem: finResult.totalPago - fin.credit,
    rendaMinima: finResult.rendaExigida,
    prazo: fin.term,
  };
  const consSide = {
    parcela: consResult.cheia ?? 0,
    totalPago: consResult.totalPago,
    custoAlemDoBem: consResult.taxas,
    rendaMinima: consResult.rendaMinima,
    prazo: consResult.parcelasPagas,
  };

  const comparison =
    state.includeFinanciamento && state.includeConsorcio
      ? { rows: buildComparativo(finSide, consSide), economia: calcEconomia(finSide, consSide) }
      : null;

  const hasErrors =
    (state.includeFinanciamento && Object.keys(finErrors).length > 0) ||
    (state.includeConsorcio && Object.keys(consErrors).length > 0);

  return {
    financiamento: { result: finResult, errors: finErrors },
    consorcio: { result: consResult, errors: consErrors },
    comparison,
    validUntil: addDaysISO(state.meta.issueDate, state.meta.validityDays),
    hasErrors,
  };
}
