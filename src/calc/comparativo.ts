export type Best = 'financiamento' | 'consorcio' | null;

export interface ComparativoSide {
  parcela: number;
  totalPago: number;
  custoAlemDoBem: number;
  rendaMinima: number;
  prazo: number;
}

export interface ComparativoRow {
  key: 'parcela' | 'totalPago' | 'custo' | 'renda' | 'prazo';
  label: string;
  financiamento: number;
  consorcio: number;
  best: Best;
}

export interface Economia {
  best: Exclude<Best, null>;
  valor: number;
  percent: number;
}

export function buildComparativo(fin: ComparativoSide, cons: ComparativoSide): ComparativoRow[] {
  const lowerBest = (a: number, b: number): Best => {
    if (a === b) return null;
    return a < b ? 'financiamento' : 'consorcio';
  };

  return [
    {
      key: 'parcela',
      label: 'Parcela inicial',
      financiamento: fin.parcela,
      consorcio: cons.parcela,
      best: lowerBest(fin.parcela, cons.parcela),
    },
    {
      key: 'totalPago',
      label: 'Total pago',
      financiamento: fin.totalPago,
      consorcio: cons.totalPago,
      best: lowerBest(fin.totalPago, cons.totalPago),
    },
    {
      key: 'custo',
      label: 'Custo além do bem',
      financiamento: fin.custoAlemDoBem,
      consorcio: cons.custoAlemDoBem,
      best: lowerBest(fin.custoAlemDoBem, cons.custoAlemDoBem),
    },
    {
      key: 'renda',
      label: 'Renda mínima',
      financiamento: fin.rendaMinima,
      consorcio: cons.rendaMinima,
      best: lowerBest(fin.rendaMinima, cons.rendaMinima),
    },
    {
      key: 'prazo',
      label: 'Prazo (meses)',
      financiamento: fin.prazo,
      consorcio: cons.prazo,
      best: null,
    },
  ];
}

export function calcEconomia(fin: ComparativoSide, cons: ComparativoSide): Economia | null {
  const valor = Math.abs(fin.custoAlemDoBem - cons.custoAlemDoBem);
  if (valor === 0) return null;
  const pricier = Math.max(fin.custoAlemDoBem, cons.custoAlemDoBem);
  return {
    best: fin.custoAlemDoBem < cons.custoAlemDoBem ? 'financiamento' : 'consorcio',
    valor: Math.round(valor * 100) / 100,
    percent: pricier > 0 ? (valor / pricier) * 100 : 0,
  };
}
