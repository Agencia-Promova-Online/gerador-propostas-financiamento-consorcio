import { useRef, useState } from 'react';
import { AlertTriangle, Download, Loader2, Printer } from 'lucide-react';
import Button from '@/components/ui/Button';
import { proposalFileName, renderProposalPdf, type PdfData } from '@/pdf/generatePdf';
import { usePdfPreview } from '@/hooks/usePdfPreview';
import { saveBlob } from '@/lib/download';

interface PdfPreviewProps {
  data: PdfData;
  blocked: boolean;
  onBlocked: () => void;
}

export default function PdfPreview({ data, blocked, onBlocked }: PdfPreviewProps) {
  const preview = usePdfPreview(data);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const download = async () => {
    if (blocked) {
      onBlocked();
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      const blob = await renderProposalPdf(data);
      saveBlob(blob, proposalFileName(data));
    } catch {
      setActionError('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  const print = () => {
    if (blocked) {
      onBlocked();
      return;
    }
    const frameWindow = iframeRef.current?.contentWindow;
    if (!frameWindow) return;
    frameWindow.focus();
    frameWindow.print();
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-700 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">Pré-visualização do PDF</p>
          <p className="text-xs text-ink-400" aria-live="polite">
            {preview.loading ? 'Atualizando…' : preview.error ? 'Erro na pré-visualização' : 'Atualizada automaticamente'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={print}
            disabled={!preview.url}
            icon={<Printer className="h-4 w-4" aria-hidden />}
          >
            Imprimir
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={download}
            disabled={busy}
            icon={busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
          >
            {busy ? 'Gerando…' : 'Baixar PDF'}
          </Button>
        </div>
      </div>

      {blocked && (
        <button
          type="button"
          onClick={onBlocked}
          className="flex items-center gap-2 border-b border-warning-500/30 bg-warning-900/30 px-4 py-2.5 text-left text-xs text-warning-300 sm:px-5"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          Preencha os campos obrigatórios e corrija os destacados para baixar o PDF.
        </button>
      )}
      {actionError && (
        <p role="alert" className="border-b border-error-500/30 bg-error-900/30 px-4 py-2.5 text-xs text-error-300 sm:px-5">
          {actionError}
        </p>
      )}

      <div className="relative min-h-0 flex-1 bg-ink-800">
        {preview.url && (
          <iframe
            ref={iframeRef}
            key={preview.url}
            src={preview.url}
            title="Pré-visualização da proposta em PDF"
            className="h-full w-full border-0"
          />
        )}
        {preview.loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-950/50 backdrop-blur-[1px]">
            <Loader2 className="h-6 w-6 animate-spin text-gold-400" aria-label="Carregando" />
          </div>
        )}
        {preview.error && !preview.loading && (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-error-300">
            Não foi possível montar a pré-visualização. Verifique os dados e tente novamente.
          </div>
        )}
      </div>
    </div>
  );
}
