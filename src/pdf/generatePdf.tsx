import { pdf } from '@react-pdf/renderer';
import { registerPdfFonts } from '@/pdf/fonts';
import ProposalDocument from '@/pdf/ProposalDocument';
import type { ProposalResults } from '@/state/deriveResults';
import type { CompanySettings, ProposalState } from '@/types/proposal';

export interface PdfData {
  state: ProposalState;
  results: ProposalResults;
  company: CompanySettings;
}

export async function renderProposalPdf(data: PdfData): Promise<Blob> {
  registerPdfFonts();
  return pdf(<ProposalDocument state={data.state} results={data.results} company={data.company} />).toBlob();
}

export function proposalFileName({ state }: PdfData): string {
  const safeName = state.client.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  return `Proposta_${safeName || 'Cliente'}_${state.meta.issueDate}.pdf`;
}
