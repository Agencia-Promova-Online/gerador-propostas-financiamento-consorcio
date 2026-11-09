import { addDaysISO } from '@/lib/format';
import { calcConsorcio, resolveCheia, validateConsorcio, type ConsorcioResult } from '@/calc/consorcio';
import {
  calcFinanciamento,
  validateFinanciamento,
  type FieldErrors,
  type FinanciamentoResult,
} from '@/calc/financiamento';
import { buildComparativo, calcEconomia, type ComparativoRow, type Economia } from '@/calc/comparativo';
import type { ProposalState, PropostaItem } from '@/types/proposal';

export interface Comparison {
  rows: ComparativoRow[];
  economia: Economia | null;
  label1: string;
  label2: string;
}

export type PropostaResultItem = 
  | { id: string; type: 'financiamento'; result: FinanciamentoResult; errors: FieldErrors<'down' | 'term' | 'annualRatePct'> }
  | { id: string; type: 'consorcio'; result: ConsorcioResult; errors: FieldErrors<'term' | 'embutidas' | 'cheia'> };

export interface ProposalResults {
  propostas: PropostaResultItem[];
  comparison: Comparison | null;
  validUntil: string;
  hasErrors: boolean;
}

export function deriveResults(state: ProposalState): ProposalResults {
  let hasErrors = false;

  const propostas: PropostaResultItem[] = state.propostas.map(p => {
    if (p.type === 'financiamento') {
      const fin = p.data;
      const result = calcFinanciamento(fin, fin.overrides);
      const errors = validateFinanciamento(fin);
      if (p.includeInPdf && Object.keys(errors).length > 0) hasErrors = true;
      return { id: p.id, type: 'financiamento', result, errors };
    } else {
      const cons = p.data;
      const result = calcConsorcio(cons, cons.overrides);
      const errors = validateConsorcio(cons, resolveCheia(cons, cons.overrides));
      if (p.includeInPdf && Object.keys(errors).length > 0) hasErrors = true;
      return { id: p.id, type: 'consorcio', result, errors };
    }
  });

  let comparison: Comparison | null = null;

  if (state.comparison.show && state.comparison.item1Id && state.comparison.item2Id) {
    const p1 = state.propostas.find(p => p.id === state.comparison.item1Id);
    const p2 = state.propostas.find(p => p.id === state.comparison.item2Id);
    
    const r1 = propostas.find(p => p.id === state.comparison.item1Id);
    const r2 = propostas.find(p => p.id === state.comparison.item2Id);

    if (p1 && p2 && r1 && r2) {
      const side1 = p1.type === 'financiamento' 
        ? {
            parcela: (r1 as any).result.parcela,
            totalPago: r1.result.totalPago,
            custoAlemDoBem: r1.result.totalPago - (p1.data as any).credit,
            rendaMinima: (r1 as any).result.rendaExigida,
            prazo: (p1.data as any).term,
          }
        : {
            parcela: (r1 as any).result.cheia ?? 0,
            totalPago: r1.result.totalPago,
            custoAlemDoBem: (r1 as any).result.taxas,
            rendaMinima: (r1 as any).result.rendaMinima,
            prazo: (r1 as any).result.parcelasPagas,
          };

      const side2 = p2.type === 'financiamento'
        ? {
            parcela: (r2 as any).result.parcela,
            totalPago: r2.result.totalPago,
            custoAlemDoBem: r2.result.totalPago - (p2.data as any).credit,
            rendaMinima: (r2 as any).result.rendaExigida,
            prazo: (p2.data as any).term,
          }
        : {
            parcela: (r2 as any).result.cheia ?? 0,
            totalPago: r2.result.totalPago,
            custoAlemDoBem: (r2 as any).result.taxas,
            rendaMinima: (r2 as any).result.rendaMinima,
            prazo: (r2 as any).result.parcelasPagas,
          };

      const index1 = state.propostas.findIndex(p => p.id === state.comparison.item1Id) + 1;
      const index2 = state.propostas.findIndex(p => p.id === state.comparison.item2Id) + 1;

      comparison = {
        rows: buildComparativo(side1, side2),
        economia: calcEconomia(side1, side2),
        label1: `Proposta ${String(index1).padStart(2, '0')}`,
        label2: `Proposta ${String(index2).padStart(2, '0')}`,
      };
    }
  }

  return {
    propostas,
    comparison,
    validUntil: addDaysISO(state.meta.issueDate, state.meta.validityDays),
    hasErrors,
  };
}