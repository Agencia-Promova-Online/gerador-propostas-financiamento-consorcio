import type { Dispatch } from 'react';
import { Landmark, Copy, Trash2 } from 'lucide-react';
import { Card, FieldGrid, Section } from '@/components/ui/Card';
import SegmentedControl from '@/components/ui/SegmentedControl';
import Toggle from '@/components/ui/Toggle';
import Button from '@/components/ui/Button';
import { NumberField, TextField } from '@/components/form/fields';
import type { ProposalAction } from '@/state/proposalReducer';
import type { PropostaResultItem } from '@/state/deriveResults';
import type { FinanciamentoField } from '@/calc/financiamento';
import type { PropostaFinanciamento } from '@/types/proposal';

interface FinanciamentoCardProps {
  proposta: PropostaFinanciamento;
  resultItem: PropostaResultItem;
  title: string;
  dispatch: Dispatch<ProposalAction>;
  open: boolean;
  onToggle: () => void;
  canRemove: boolean;
}

export default function FinanciamentoCard({ 
  proposta, 
  resultItem, 
  title, 
  dispatch, 
  open, 
  onToggle, 
  canRemove 
}: FinanciamentoCardProps) {
  const fin = proposta.data;
  const { result, errors } = resultItem as Extract<PropostaResultItem, { type: 'financiamento' }>;
  const ov = fin.overrides;
  const id = proposta.id;

  const patch = (values: Partial<typeof fin>) => dispatch({ type: 'financiamento', id, patch: values });
  const calc = (field: FinanciamentoField, label: string, value: number, extra: Partial<{ hint: string }> = {}) => (
    <NumberField
      id={`fin-${id}-${field}`}
      label={label}
      value={value}
      calculated
      overridden={ov[field] !== undefined}
      onRestore={() => dispatch({ type: 'financiamentoOverride', id, field, value: undefined })}
      onChange={(next) => dispatch({ type: 'financiamentoOverride', id, field, value: next })}
      hint={extra.hint}
    />
  );

  return (
    <Card
      title={title}
      subtitle={fin.titulo || fin.bank || 'Financiamento imobiliário'}
      icon={<Landmark className="h-5 w-5" aria-hidden />}
      open={open}
      onToggle={onToggle}
      trailing={
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" icon={<Copy className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); dispatch({ type: 'duplicateProposta', id }); }} />
            {canRemove && <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" icon={<Trash2 className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); dispatch({ type: 'removeProposta', id }); }} />}
          </div>
          <Toggle
            id={`fin-include-${id}`}
            label="No PDF"
            checked={proposta.includeInPdf}
            onChange={(value) => dispatch({ type: 'updatePropostaInclude', id, value })}
          />
        </div>
      }
    >
      <Section title="Dados">
        <FieldGrid>
          <TextField
            id={`fin-titulo-${id}`}
            label="Título da proposta"
            value={fin.titulo}
            placeholder="Ex.: Caixa Econômica - Imóvel X"
            onChange={(titulo) => patch({ titulo })}
            className="sm:col-span-2"
          />
          <TextField
            id={`fin-bank-${id}`}
            label="Nome do banco / Instituição"
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
            id={`fin-annualRatePct-${id}`}
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
            id={`fin-credit-${id}`}
            label="Crédito (valor do bem)"
            required
            value={fin.credit}
            onChange={(credit) => patch({ credit })}
          />
          <NumberField
            id={`fin-down-${id}`}
            label="Entrada"
            value={fin.down}
            error={errors.down}
            onChange={(down) => patch({ down })}
          />
          <NumberField
            id={`fin-term-${id}`}
            label="Prazo (meses)"
            kind="integer"
            required
            value={fin.term}
            error={errors.term}
            onChange={(term) => patch({ term: Math.round(term) })}
          />
          <NumberField
            id={`fin-cartorio-${id}`}
            label="Cartório"
            value={fin.cartorio}
            onChange={(cartorio) => patch({ cartorio })}
            hint={fin.cartorioInTotal ? 'Somado ao total pago.' : 'Informativo, fora do total pago.'}
          />
        </FieldGrid>
        <Toggle
          id={`fin-cartorioInTotal-${id}`}
          label="Somar cartório ao total pago"
          checked={fin.cartorioInTotal}
          onChange={(cartorioInTotal) => patch({ cartorioInTotal })}
        />
      </Section>

      <Section title="Parcelas e detalhes">
        <FieldGrid>
          <NumberField
            id={`fin-commitmentPct-${id}`}
            label="Comprometimento de renda"
            kind="percent"
            value={fin.commitmentPct}
            onChange={(commitmentPct) => patch({ commitmentPct })}
            hint="Padrão de 30%, editável."
          />
        </FieldGrid>
        <Toggle
          id={`fin-showLast-${id}`}
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