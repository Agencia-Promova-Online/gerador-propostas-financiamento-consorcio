import type { Dispatch } from 'react';
import { PiggyBank, Copy, Trash2 } from 'lucide-react';
import { Card, FieldGrid, Section } from '@/components/ui/Card';
import Toggle from '@/components/ui/Toggle';
import Button from '@/components/ui/Button';
import { NumberField, TextField } from '@/components/form/fields';
import type { ProposalAction } from '@/state/proposalReducer';
import type { PropostaResultItem } from '@/state/deriveResults';
import type { ConsorcioField } from '@/calc/consorcio';
import type { PropostaConsorcio } from '@/types/proposal';

interface ConsorcioCardProps {
  proposta: PropostaConsorcio;
  resultItem: PropostaResultItem;
  title: string;
  dispatch: Dispatch<ProposalAction>;
  open: boolean;
  onToggle: () => void;
  canRemove: boolean;
}

export default function ConsorcioCard({ 
  proposta, 
  resultItem, 
  title, 
  dispatch, 
  open, 
  onToggle, 
  canRemove 
}: ConsorcioCardProps) {
  const cons = proposta.data;
  const { result, errors } = resultItem as Extract<PropostaResultItem, { type: 'consorcio' }>;
  const ov = cons.overrides;
  const id = proposta.id;

  const patch = (values: Partial<typeof cons>) => dispatch({ type: 'consorcio', id, patch: values });
  const calc = (field: ConsorcioField, label: string, value: number | undefined, extra: Partial<{ hint: string }> = {}) => (
    <NumberField
      id={`cons-${id}-${field}`}
      label={label}
      value={value ?? 0}
      calculated
      overridden={ov[field] !== undefined}
      onRestore={() => dispatch({ type: 'consorcioOverride', id, field, value: undefined })}
      onChange={(next) => dispatch({ type: 'consorcioOverride', id, field, value: next })}
      hint={extra.hint}
    />
  );

  return (
    <Card
      title={title}
      subtitle={cons.titulo || cons.administradora || 'Carta de crédito'}
      icon={<PiggyBank className="h-5 w-5" aria-hidden />}
      open={open}
      onToggle={onToggle}
      trailing={
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" icon={<Copy className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); dispatch({ type: 'duplicateProposta', id }); }} />
            {canRemove && <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" icon={<Trash2 className="h-4 w-4" />} onClick={(e) => { e.stopPropagation(); dispatch({ type: 'removeProposta', id }); }} />}
          </div>
          <Toggle
            id={`cons-include-${id}`}
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
            id={`cons-titulo-${id}`}
            label="Título da proposta"
            value={cons.titulo}
            placeholder="Ex.: Consórcio Porto Seguro - Carro"
            onChange={(titulo) => patch({ titulo })}
            className="sm:col-span-2"
          />
          <TextField
            id={`cons-admin-${id}`}
            label="Administradora"
            value={cons.administradora}
            placeholder="Ex.: Porto Seguro"
            onChange={(administradora) => patch({ administradora })}
            className="sm:col-span-2"
          />
          <NumberField
            id={`cons-credit-${id}`}
            label="Crédito (carta)"
            required
            value={cons.credit}
            onChange={(credit) => patch({ credit })}
          />
          <NumberField
            id={`cons-adesao-${id}`}
            label="Taxa de adesão"
            value={cons.adesao}
            onChange={(adesao) => patch({ adesao })}
          />
          <NumberField
            id={`cons-term-${id}`}
            label="Prazo total (meses)"
            kind="integer"
            required
            value={cons.term}
            error={errors.term}
            onChange={(term) => patch({ term: Math.round(term) })}
          />
          <NumberField
            id={`cons-embutidas-${id}`}
            label="Parcelas embutidas no lance"
            kind="integer"
            value={cons.embutidas}
            error={errors.embutidas}
            onChange={(embutidas) => patch({ embutidas: Math.round(embutidas) })}
          />
          <NumberField
            id={`cons-lance-${id}`}
            label="Lance (recursos próprios)"
            value={cons.lance}
            onChange={(lance) => patch({ lance })}
          />
          <NumberField
            id={`cons-entrada-${id}`}
            label="Entrada (sinal/outros)"
            value={cons.entrada}
            onChange={(entrada) => patch({ entrada })}
          />
        </FieldGrid>
      </Section>

      <Section title="Parcelas e detalhes">
        <FieldGrid>
          <NumberField
            id={`cons-commitmentPct-${id}`}
            label="Comprometimento de renda"
            kind="percent"
            value={cons.commitmentPct}
            onChange={(commitmentPct) => patch({ commitmentPct })}
            hint="Padrão de 30%, editável."
          />
        </FieldGrid>
        <div className="space-y-4">
          <Toggle
            id={`cons-cheiaAuto-${id}`}
            label="Calcular parcela cheia automaticamente"
            description="Se ativo, a parcela cheia será baseada no lance e crédito."
            checked={cons.cheiaAuto}
            onChange={(cheiaAuto) => patch({ cheiaAuto })}
          />
          <Toggle
            id={`cons-linked-${id}`}
            label="Vincular desconto à reduzida"
            description="Se ativo, alterar o % de desconto recalcula a parcela reduzida e vice-versa."
            checked={cons.linked}
            onChange={(linked) => patch({ linked })}
          />
        </div>
      </Section>

      <Section title="Resultados">
        <FieldGrid>
          {calc('cheia', 'Parcela cheia', result.cheia, { hint: 'Base para desconto.' })}
          {calc('reduzida', 'Parcela reduzida', result.reduzida, { hint: 'Valor pago após contemplação.' })}
          {calc('desconto', 'Desconto (%)', result.desconto)}
          {calc('rendaMinima', 'Renda mínima', result.rendaMinima, { hint: 'Com base na parcela cheia.' })}
          {calc('taxas', 'Taxas pagas', result.taxas, { hint: 'Custo além do bem.' })}
          {calc('totalPago', 'Total pago', result.totalPago)}
        </FieldGrid>
      </Section>
    </Card>
  );
}