import { formatBRL, formatPercent } from '@/lib/format';
import type { ProposalResults } from '@/state/deriveResults';
import type { ProposalState } from '@/types/proposal';

interface ResultsSummaryProps {
  state: ProposalState;
  results: ProposalResults;
}

interface Stat {
  label: string;
  value: string;
}

function Column({ title, stats, muted }: { title: string; stats: Stat[]; muted?: boolean }) {
  return (
    <div className={`rounded-xl border border-ink-700 bg-ink-950/60 p-4 ${muted ? 'opacity-50' : ''}`}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">{title}</p>
      <dl className="space-y-2">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-baseline justify-between gap-3">
            <dt className="text-xs text-ink-400">{stat.label}</dt>
            <dd className="text-sm font-semibold tabular-nums text-white">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function ResultsSummary({ state, results }: ResultsSummaryProps) {
  const economia = results.comparison?.economia;
  const comparison = results.comparison;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {state.propostas.map((proposta, index) => {
          const title = `Proposta ${String(index + 1).padStart(2, '0')}`;
          const resultItem = results.propostas.find((r) => r.id === proposta.id);
          if (!resultItem) return null;

          let stats: Stat[] = [];
          if (proposta.type === 'financiamento') {
            const fin = (resultItem as any).result;
            stats = [
              { label: '1ª parcela', value: formatBRL(fin.parcela) },
              { label: 'Total pago', value: formatBRL(fin.totalPago) },
            ];
          } else {
            const cons = (resultItem as any).result;
            stats = [
              { label: 'Parcela cheia', value: formatBRL(cons.cheia ?? 0) },
              { label: 'Total pago', value: formatBRL(cons.totalPago) },
            ];
          }

          return (
            <Column
              key={proposta.id}
              title={title}
              muted={!proposta.includeInPdf}
              stats={stats}
            />
          );
        })}
      </div>
      {comparison && comparison.economia && state.comparison.show && (
        <p className="animate-fade-in rounded-xl border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-sm text-gold-100">
          Entre as propostas comparadas, a economia estimada é de <span className="font-semibold text-gold-300">{formatBRL(comparison.economia.valor)}</span> (
          {formatPercent(comparison.economia.percent)}) com a{' '}
          <span className="font-semibold text-gold-300">
            {comparison.economia.best === 'financiamento' ? comparison.label1 : comparison.label2}
          </span>
          .
        </p>
      )}
    </div>
  );
}