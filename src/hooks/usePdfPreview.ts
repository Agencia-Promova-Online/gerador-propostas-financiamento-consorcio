import { useEffect, useState } from 'react';
import { renderProposalPdf, type PdfData } from '@/pdf/generatePdf';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

interface PdfPreviewState {
  url: string | null;
  loading: boolean;
  error: boolean;
}

export function usePdfPreview(data: PdfData): PdfPreviewState {
  const debounced = useDebouncedValue(data, 450);
  const [preview, setPreview] = useState<PdfPreviewState>({ url: null, loading: true, error: false });

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    setPreview((prev) => ({ ...prev, loading: true }));

    renderProposalPdf(debounced)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPreview({ url: objectUrl, loading: false, error: false });
      })
      .catch(() => {
        if (!cancelled) setPreview({ url: null, loading: false, error: true });
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [debounced]);

  return preview;
}
