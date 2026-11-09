import type { Dispatch } from 'react';
import { Landmark } from 'lucide-react';
import { Card, FieldGrid, Section } from '@/components/ui/Card';
import SegmentedControl from '@/components/ui/SegmentedControl';
import Toggle from '@/components/ui/Toggle';
import { NumberField, TextField } from '@/components/form/fields';
import type { ProposalAction } from '@/state/proposalReducer';
import type { ProposalResults } from '@/state/deriveResults';
import type { ProposalState } from '@/types/proposal';
import type { FinanciamentoField } from '@/calc/financiamento';

interface FinanciamentoCardProps {
  state: ProposalState;
  results: ProposalResults;
  dispatch: Dispatch<ProposalAction>;
  open: boolean;
  onToggle: () => void;
}

export default function FinanciamentoCard({ state, results, dispatch, open, onToggle }: FinanciamentoCardProps) {
  const fin = state.financiamento;
  const { result, errors } = results.financiamento;
  const ov = fin.overrides;

  const patch = (values: Partial<typeof fin>) => dispatch({ type: 'financiamento', patch: values });
  const calc = (field: FinanciamentoField, label: string, value: number, extra: Partial<{ hint: string }> = {}) => (
    <NumberField
      id={`fin-${field}`}
      label={label}
      value={value}
      calculated
      overridden={ov[field] !== undefined}
      onRestore={() => dispatch({ type: 'financiamentoOverride', field, value: undefined })}
      onChange={(next) => dispatch({ type: 'financiamentoOverride', field, value: next })}
      hint={extra.hint}
    />
  );

  return (
    <Card
      title="Financiamento"
      subtitle={fin.bank || 'Financiamento imobiliário'}
      icon={<Landmark className="h-5 w-5" aria-hidden />}
      open={open}
      onToggle={onToggle}
      trailing={
        <Toggle
          id="fin-include"
          label="No PDF"
          checked={state.includeFinanciamento}
          disabled={state.includeFinanciamento && !state.includeConsorcio}
          onChange={(value) => dispatch({ type: 'include', block: 'financiamento', value })}
        />
      }
    >
      <Section title="Dados">
        <FieldGrid>
          <TextField
            id="fin-bank"
            label="Nome do banco"
            value={fin.bank}
            placeholder="Ex.: Caixa Econômica"
            onChange={(bank) => patch({ bank })}
            className="sm:col-span-2"
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-200">Amortização</span>
            <SegmentedControl
              label="Sistema de amortização"
              options={[
                { value: 'SAC', label: 'SAC' },
                { value: 'PRICE', label: 'Price' },
              ]}
              value={fin.system}
              onChange={(system) => patch({ system })}
            />
          </div>
          <NumberField
            id="fin-annualRatePct"
            label="Juros (% ao ano)"
            kind="percent"
            value={fin.annualRatePct}
            error={errors.annualRatePct}
            onChange={(annualRatePct) => patch({ annualRatePct })}
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-200">Tipo de taxa mensal</span>
            <SegmentedControl
              label="Tipo de taxa mensal"
              options={[
                { value: 'nominal', label: 'Nominal' },
                { value: 'efetiva', label: 'Efetiva' },
              ]}
              value={fin.rateMode}
              onChange={(rateMode) => patch({ rateMode })}
            />
          </div>
          <NumberField
            id="fin-credit"
            label="Crédito (valor do bem)"
            required
            value={fin.credit}
            onChange={(credit) => patch({ credit })}
          />
          <NumberField
            id="fin-down"
            label="Entrada"
            value={fin.down}
            error={errors.down}
            onChange={(down) => patch({ down })}
          />
          <NumberField
            id="fin-term"
            label="Prazo (meses)"
            kind="integer"
            required
            value={fin.term}
            error={errors.term}
            onChange={(term) => patch({ term: Math.round(term) })}
          />
          <NumberField
            id="fin-cartorio"
            label="Cartório"
            value={fin.cartorio}
            onChange={(cartorio) => patch({ cartorio })}
            hint={fin.cartorioInTotal ? 'Somado ao total pago.' : 'Informativo, fora do total pago.'}
          />
        </FieldGrid>
        <Toggle
          id="fin-cartorioInTotal"
          label="Somar cartório ao total pago"
          checked={fin.cartorioInTotal}
          onChange={(cartorioInTotal) => patch({ cartorioInTotal })}
        />
      </Section>

      <Section title="Parcelas e detalhes">
        <FieldGrid>
          <NumberField
            id="fin-commitmentPct"
            label="Comprometimento de renda"
            kind="percent"
            value={fin.commitmentPct}
            onChange={(commitmentPct) => patch({ commitmentPct })}
            hint="Padrão de 30%, editável."
          />
        </FieldGrid>
        <Toggle
          id="fin-showLast"
          label="Exibir última parcela"
          description="Mostra a última parcela no PDF."
          checked={fin.showLast}
          onChange={(showLast) => patch({ showLast })}
        />
      </Section>

      <Section title="Resultados">
        <FieldGrid>
          {calc('financiado', 'Valor financiado', result.financiado, { hint: 'Crédito menos entrada.' })}
          {calc('parcela', 'Valor da 1ª parcela', result.parcela)}
          {fin.showLast && calc('ultimaParcela', 'Última parcela', result.ultimaParcela)}
          {calc('rendaExigida', 'Renda exigida', result.rendaExigida)}
          {calc('apenasJuros', 'Apenas juros (mês)', result.apenasJuros)}
          {calc('totalJuros', 'Total de juros', result.totalJuros)}
          {calc('financiadoMaisJuros', 'Financiado + juros', result.financiadoMaisJuros)}
          {calc('totalPago', 'Total pago', result.totalPago)}
        </FieldGrid>
      </Section>
    </Card>
  );
}
