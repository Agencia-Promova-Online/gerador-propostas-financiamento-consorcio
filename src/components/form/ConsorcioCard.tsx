import type { Dispatch } from 'react';
import { PiggyBank } from 'lucide-react';
import { Card, FieldGrid, Section } from '@/components/ui/Card';
import Toggle from '@/components/ui/Toggle';
import { NumberField, TextField } from '@/components/form/fields';
import type { ProposalAction } from '@/state/proposalReducer';
import type { ProposalResults } from '@/state/deriveResults';
import type { ProposalState } from '@/types/proposal';
import type { ConsorcioField } from '@/calc/consorcio';

interface ConsorcioCardProps {
  state: ProposalState;
  results: ProposalResults;
  dispatch: Dispatch<ProposalAction>;
  open: boolean;
  onToggle: () => void;
}

export default function ConsorcioCard({ state, results, dispatch, open, onToggle }: ConsorcioCardProps) {
  const cons = state.consorcio;
  const { result, errors } = results.consorcio;
  const ov = cons.overrides;

  const patch = (values: Partial<typeof cons>) => dispatch({ type: 'consorcio', patch: values });
  const override = (field: ConsorcioField, value: number | undefined) =>
    dispatch({ type: 'consorcioOverride', field, value });

  return (
    <Card
      title="Consórcio"
      subtitle={cons.administradora || 'Carta de crédito'}
      icon={<PiggyBank className="h-5 w-5" aria-hidden />}
      open={open}
      onToggle={onToggle}
      trailing={
        <Toggle
          id="cons-include"
          label="No PDF"
          checked={state.includeConsorcio}
          disabled={state.includeConsorcio && !state.includeFinanciamento}
          onChange={(value) => dispatch({ type: 'include', block: 'consorcio', value })}
        />
      }
    >
      <Section title="Dados">
        <FieldGrid>
          <TextField
            id="cons-administradora"
            label="Nome da administradora"
            value={cons.administradora}
            placeholder="Ex.: Administradora Exemplo"
            onChange={(administradora) => patch({ administradora })}
            className="sm:col-span-2"
          />
          <NumberField id="cons-credit" label="Crédito" required value={cons.credit} onChange={(credit) => patch({ credit })} />
          <NumberField id="cons-adesao" label="Adesão" value={cons.adesao} onChange={(adesao) => patch({ adesao })} />
          <NumberField
            id="cons-lance"
            label="Lance (opcional)"
            value={cons.lance}
            onChange={(lance) => patch({ lance })}
          />
          <NumberField id="cons-entrada" label="Entrada" value={cons.entrada} onChange={(entrada) => patch({ entrada })} />
          <NumberField
            id="cons-term"
            label="Prazo original (meses)"
            kind="integer"
            required
            value={cons.term}
            error={errors.term}
            onChange={(term) => patch({ term: Math.round(term) })}
          />
          <NumberField
            id="cons-embutidas"
            label="Embutir parcelas"
            kind="integer"
            value={cons.embutidas}
            error={errors.embutidas}
            onChange={(embutidas) => patch({ embutidas: Math.round(embutidas) })}
            hint="Parcelas abatidas com o crédito."
          />
          <NumberField
            id="cons-commitmentPct"
            label="Comprometimento de renda"
            kind="percent"
            value={cons.commitmentPct}
            onChange={(commitmentPct) => patch({ commitmentPct })}
            hint="Padrão de 30%, editável."
          />
        </FieldGrid>
      </Section>

      <Section title="Parcelas e detalhes">
        <div className="space-y-4 rounded-xl border border-ink-700 bg-ink-950/60 p-4">
          <Toggle
            id="cons-linked"
            label="Calc. Auto"
            description="Desconto e parcela reduzida se atualizam entre si."
            checked={cons.linked}
            onChange={(linked) => patch({ linked })}
          />
          <Toggle
            id="cons-cheiaAuto"
            label="Parc. Cheia"
            description="Estima a parcela cheia pelo crédito dividido pelo prazo."
            checked={cons.cheiaAuto}
            onChange={(cheiaAuto) => patch({ cheiaAuto })}
          />
        </div>
        <FieldGrid>
          <NumberField
            id="cons-cheia"
            label="Parcela cheia"
            required
            value={result.cheia ?? 0}
            error={errors.cheia}
            calculated={cons.cheiaAuto || ov.cheia !== undefined}
            overridden={ov.cheia !== undefined}
            onRestore={() => override('cheia', undefined)}
            onChange={(value) => override('cheia', value)}
          />
          <NumberField
            id="cons-desconto"
            label="Desconto"
            kind="percent"
            value={result.desconto}
            calculated
            overridden={ov.desconto !== undefined}
            onRestore={() => override('desconto', undefined)}
            onChange={(value) => override('desconto', value)}
          />
          <NumberField
            id="cons-reduzida"
            label="Parcela reduzida"
            value={result.reduzida}
            calculated
            overridden={ov.reduzida !== undefined}
            onRestore={() => override('reduzida', undefined)}
            onChange={(value) => override('reduzida', value)}
          />
        </FieldGrid>
      </Section>

      <Section title="Resultados">
        <FieldGrid>
          <NumberField
            id="cons-taxas"
            label="Valor pago em taxas"
            value={result.taxas}
            calculated
            overridden={ov.taxas !== undefined}
            onRestore={() => override('taxas', undefined)}
            onChange={(value) => override('taxas', value)}
          />
          <NumberField
            id="cons-totalPago"
            label="Valor pago total"
            value={result.totalPago}
            calculated
            overridden={ov.totalPago !== undefined}
            onRestore={() => override('totalPago', undefined)}
            onChange={(value) => override('totalPago', value)}
            hint={result.parcelasPagas !== cons.term ? `${result.parcelasPagas} parcelas pagas pelo cliente.` : undefined}
          />
          <NumberField
            id="cons-rendaMinima"
            label="Renda mínima exigida"
            value={result.rendaMinima}
            calculated
            overridden={ov.rendaMinima !== undefined}
            onRestore={() => override('rendaMinima', undefined)}
            onChange={(value) => override('rendaMinima', value)}
          />
        </FieldGrid>
      </Section>
    </Card>
  );
}
