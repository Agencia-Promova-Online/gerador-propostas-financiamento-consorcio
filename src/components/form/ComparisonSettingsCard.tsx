import type { Dispatch } from 'react';
import { Scale } from 'lucide-react';
import { Card, Section } from '@/components/ui/Card';
import Toggle from '@/components/ui/Toggle';
import type { ProposalAction } from '@/state/proposalReducer';
import type { ComparisonConfig, PropostaItem } from '@/types/proposal';

interface ComparisonSettingsCardProps {
  comparison: ComparisonConfig;
  propostas: PropostaItem[];
  dispatch: Dispatch<ProposalAction>;
  open: boolean;
  onToggle: () => void;
}

export default function ComparisonSettingsCard({
  comparison,
  propostas,
  dispatch,
  open,
  onToggle,
}: ComparisonSettingsCardProps) {
  const options = propostas.map((p, index) => ({
    id: p.id,
    label: `Proposta ${String(index + 1).padStart(2, '0')} (${p.type === 'financiamento' ? 'Financiamento' : 'Consórcio'})`,
  }));

  const patch = (values: Partial<ComparisonConfig>) => dispatch({ type: 'updateComparison', patch: values });

  return (
    <Card
      title="Comparativo"
      subtitle="Configurar seção de comparação no PDF"
      icon={<Scale className="h-5 w-5" aria-hidden />}
      open={open}
      onToggle={onToggle}
      trailing={
        <Toggle
          id="comparison-include"
          label="No PDF"
          checked={comparison.show}
          onChange={(show) => patch({ show })}
        />
      }
    >
      <Section title="Propostas para comparar">
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          <div className="flex-1 space-y-1.5">
            <label htmlFor="comp-item1" className="text-sm font-medium text-ink-200">
              Primeira proposta
            </label>
            <select
              id="comp-item1"
              value={comparison.item1Id || ''}
              onChange={(e) => patch({ item1Id: e.target.value || null })}
              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-white outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            >
              <option value="">Selecione...</option>
              {options.map((opt) => (
                <option key={opt.id} value={opt.id} disabled={opt.id === comparison.item2Id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 space-y-1.5">
            <label htmlFor="comp-item2" className="text-sm font-medium text-ink-200">
              Segunda proposta
            </label>
            <select
              id="comp-item2"
              value={comparison.item2Id || ''}
              onChange={(e) => patch({ item2Id: e.target.value || null })}
              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-white outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            >
              <option value="">Selecione...</option>
              {options.map((opt) => (
                <option key={opt.id} value={opt.id} disabled={opt.id === comparison.item1Id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Section>
    </Card>
  );
}