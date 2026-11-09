import { useMemo, useReducer, useState } from 'react';
import { Eye } from 'lucide-react';
import faviconUrl from '@/assets/favicon.png';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import SegmentedControl from '@/components/ui/SegmentedControl';
import ProposalForm from '@/components/form/ProposalForm';
import CompanyView from '@/components/company/CompanyView';
import PdfPreview from '@/components/preview/PdfPreview';
import ResultsSummary from '@/components/preview/ResultsSummary';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { createInitialProposal, proposalReducer } from '@/state/proposalReducer';
import { deriveResults } from '@/state/deriveResults';

type View = 'proposta' | 'empresa';

export default function App() {
  const [view, setView] = useState<View>('proposta');
  const [state, dispatch] = useReducer(proposalReducer, undefined, createInitialProposal);
  const { settings, setSettings, storageError } = useCompanySettings();
  const [showErrors, setShowErrors] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  const results = useMemo(() => deriveResults(state), [state]);
  const pdfData = useMemo(() => ({ state, results, company: settings }), [state, results, settings]);

  const missingRequired = !state.client.name.trim() || !state.client.property.trim();
  const blocked = results.hasErrors || missingRequired;

  const handleBlocked = () => {
    setShowErrors(true);
    setMobilePreviewOpen(false);
  };

  return (
    <div className="min-h-dvh bg-ink-950">
      <header className="sticky top-0 z-30 border-b border-ink-700/80 bg-ink-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <img 
              src={faviconUrl} 
              alt="Logo" 
              className="h-9 w-9 rounded-xl object-contain" 
            />
            <div className="leading-tight">
              <p className="font-display text-lg font-semibold text-white">Propostas</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-gold-400">Financiamento × Consórcio</p>
            </div>
          </div>
          <div className="w-full sm:w-56">
            <SegmentedControl<View>
              label="Seções"
              options={[
                { value: 'proposta', label: 'Proposta' },
                { value: 'empresa', label: 'Empresa' },
              ]}
              value={view}
              onChange={setView}
            />
          </div>
        </div>
      </header>

      {view === 'empresa' ? (
        <main className="px-4 py-8 sm:px-6">
          <CompanyView settings={settings} setSettings={setSettings} storageError={storageError} />
        </main>
      ) : (
        <main className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 px-4 py-6 pb-28 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:pb-6">
          <section className="min-w-0">
            <ProposalForm state={state} results={results} dispatch={dispatch} showErrors={showErrors} />
          </section>

          <aside className="hidden min-w-0 lg:sticky lg:top-24 lg:block lg:self-start">
            <div className="space-y-4">
              <ResultsSummary state={state} results={results} />
              <div className="h-[calc(100dvh-16rem)] min-h-[520px] overflow-hidden rounded-card border border-ink-700 bg-ink-900">
                <PdfPreview data={pdfData} blocked={blocked} onBlocked={handleBlocked} />
              </div>
            </div>
          </aside>
        </main>
      )}

      {view === 'proposta' && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-700 bg-ink-950/95 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur-md lg:hidden">
          <Button variant="primary" size="lg" className="w-full" onClick={() => setMobilePreviewOpen(true)} icon={<Eye className="h-4 w-4" aria-hidden />}>
            Visualizar e baixar PDF
          </Button>
        </div>
      )}

      <Modal open={mobilePreviewOpen} onClose={() => setMobilePreviewOpen(false)} title="Pré-visualização" size="full">
        <div className="h-[calc(92dvh-4.5rem)]">
          <PdfPreview data={pdfData} blocked={blocked} onBlocked={handleBlocked} />
        </div>
      </Modal>
    </div>
  );
}
