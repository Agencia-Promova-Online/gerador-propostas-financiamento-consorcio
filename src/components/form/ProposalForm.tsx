import { useState, type Dispatch } from 'react';
import { FilePlus2, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ProposalDetailsCard from '@/components/form/ProposalDetailsCard';
import FinanciamentoCard from '@/components/form/FinanciamentoCard';
import ConsorcioCard from '@/components/form/ConsorcioCard';
import ComparisonSettingsCard from '@/components/form/ComparisonSettingsCard';
import type { ProposalAction } from '@/state/proposalReducer';
import type { ProposalResults } from '@/state/deriveResults';
import type { ProposalState, PropostaConsorcio, PropostaFinanciamento } from '@/types/proposal';

interface ProposalFormProps {
  state: ProposalState;
  results: ProposalResults;
  dispatch: Dispatch<ProposalAction>;
  showErrors: boolean;
}

export default function ProposalForm({ state, results, dispatch, showErrors }: ProposalFormProps) {
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({
    details: true,
    comparison: false,
  });
  const [confirmNew, setConfirmNew] = useState(false);

  const toggleCard = (key: string) => setOpenCards((prev) => ({ ...prev, [key]: !prev[key] }));

  const clientErrors = {
    name: showErrors && !state.client.name.trim() ? 'Informe o nome do cliente.' : undefined,
    property: showErrors && !state.client.property.trim() ? 'Informe o bem ou imóvel pretendido.' : undefined,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">Nova simulação</p>
          <p className="text-xs text-ink-400">Campos marcados com * são obrigatórios.</p>
        </div>
        <Button variant="ghost" size="sm" icon={<FilePlus2 className="h-4 w-4" aria-hidden />} onClick={() => setConfirmNew(true)}>
          Nova proposta
        </Button>
      </div>

      <ProposalDetailsCard
        state={state}
        results={results}
        dispatch={dispatch}
        open={openCards.details !== false}
        onToggle={() => toggleCard('details')}
        errors={clientErrors}
      />

      {state.propostas.map((proposta, index) => {
        const title = `Proposta ${String(index + 1).padStart(2, '0')}`;
        const resultItem = results.propostas.find((r) => r.id === proposta.id);
        if (!resultItem) return null;

        const isOpen = openCards[proposta.id] !== false; // default true
        const onToggleItem = () => toggleCard(proposta.id);
        const canRemove = state.propostas.length > 1;

        if (proposta.type === 'financiamento') {
          return (
            <FinanciamentoCard
              key={proposta.id}
              proposta={proposta as PropostaFinanciamento}
              resultItem={resultItem}
              title={title}
              dispatch={dispatch}
              open={isOpen}
              onToggle={onToggleItem}
              canRemove={canRemove}
            />
          );
        } else {
          return (
            <ConsorcioCard
              key={proposta.id}
              proposta={proposta as PropostaConsorcio}
              resultItem={resultItem}
              title={title}
              dispatch={dispatch}
              open={isOpen}
              onToggle={onToggleItem}
              canRemove={canRemove}
            />
          );
        }
      })}

      <div className="flex items-center justify-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          icon={<Plus className="h-4 w-4" />} 
          onClick={() => dispatch({ type: 'addProposta', propostaType: 'financiamento' })}
        >
          Add Financiamento
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          icon={<Plus className="h-4 w-4" />} 
          onClick={() => dispatch({ type: 'addProposta', propostaType: 'consorcio' })}
        >
          Add Consórcio
        </Button>
      </div>

      {state.propostas.length >= 2 && (
        <ComparisonSettingsCard
          comparison={state.comparison}
          propostas={state.propostas}
          dispatch={dispatch}
          open={openCards.comparison === true} // default false
          onToggle={() => toggleCard('comparison')}
        />
      )}

      <ConfirmDialog
        open={confirmNew}
        title="Começar nova proposta?"
        message="Os dados do cliente e as simulações desta proposta serão apagados. Os dados da sua empresa são mantidos."
        confirmLabel="Apagar e começar"
        onCancel={() => setConfirmNew(false)}
        onConfirm={() => {
          dispatch({ type: 'reset' });
          setConfirmNew(false);
        }}
      />
    </div>
  );
}