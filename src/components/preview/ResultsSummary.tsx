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
  const fin = results.financiamento.result;
  const cons = results.consorcio.result;
  const economia = results.comparison?.economia;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Column
          title="Financiamento"
          muted={!state.includeFinanciamento}
          stats={[
            { label: '1ª parcela', value: formatBRL(fin.parcela) },
            { label: 'Total pago', value: formatBRL(fin.totalPago) },
          ]}
        />
        <Column
          title="Consórcio"
          muted={!state.includeConsorcio}
          stats={[
            { label: 'Parcela cheia', value: formatBRL(cons.cheia ?? 0) },
            { label: 'Total pago', value: formatBRL(cons.totalPago) },
          ]}
        />
      </div>
      {economia && (
        <p className="animate-fade-in rounded-xl border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-sm text-gold-100">
          Economia de <span className="font-semibold text-gold-300">{formatBRL(economia.valor)}</span> (
          {formatPercent(economia.percent)}) com{' '}
          <span className="font-semibold text-gold-300">
            {economia.best === 'financiamento' ? 'financiamento' : 'consórcio'}
          </span>
          .
        </p>
      )}
    </div>
  );
}
