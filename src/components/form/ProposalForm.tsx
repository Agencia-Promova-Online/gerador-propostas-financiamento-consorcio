import { useState, type Dispatch } from 'react';
import { FilePlus2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ProposalDetailsCard from '@/components/form/ProposalDetailsCard';
import FinanciamentoCard from '@/components/form/FinanciamentoCard';
import ConsorcioCard from '@/components/form/ConsorcioCard';
import type { ProposalAction } from '@/state/proposalReducer';
import type { ProposalResults } from '@/state/deriveResults';
import type { ProposalState } from '@/types/proposal';

interface ProposalFormProps {
  state: ProposalState;
  results: ProposalResults;
  dispatch: Dispatch<ProposalAction>;
  showErrors: boolean;
}

type CardKey = 'details' | 'financiamento' | 'consorcio';

export default function ProposalForm({ state, results, dispatch, showErrors }: ProposalFormProps) {
  const [openCards, setOpenCards] = useState<Record<CardKey, boolean>>({
    details: true,
    financiamento: true,
    consorcio: true,
  });
  const [confirmNew, setConfirmNew] = useState(false);

  const toggleCard = (key: CardKey) => setOpenCards((prev) => ({ ...prev, [key]: !prev[key] }));

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
        open={openCards.details}
        onToggle={() => toggleCard('details')}
        errors={clientErrors}
      />
      <FinanciamentoCard
        state={state}
        results={results}
        dispatch={dispatch}
        open={openCards.financiamento}
        onToggle={() => toggleCard('financiamento')}
      />
      <ConsorcioCard
        state={state}
        results={results}
        dispatch={dispatch}
        open={openCards.consorcio}
        onToggle={() => toggleCard('consorcio')}
      />

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
