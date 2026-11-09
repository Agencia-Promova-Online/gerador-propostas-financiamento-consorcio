import type { ConsorcioInput } from '@/calc/consorcio';
import type { FinanciamentoInput, FinanciamentoOverrides } from '@/calc/financiamento';
import type { ConsorcioOverrides } from '@/calc/consorcio';

export interface ClientData {
  name: string;
  contact: string;
  property: string;
  seller: string;
  observations: string;
}

export interface ProposalMeta {
  number: string;
  issueDate: string;
  validityDays: number;
}

export interface FinanciamentoForm extends FinanciamentoInput {
  bank: string;
  showLast: boolean;
  overrides: FinanciamentoOverrides;
}

export interface ConsorcioForm extends ConsorcioInput {
  administradora: string;
  overrides: ConsorcioOverrides;
}

export interface ProposalState {
  client: ClientData;
  meta: ProposalMeta;
  includeFinanciamento: boolean;
  includeConsorcio: boolean;
  financiamento: FinanciamentoForm;
  consorcio: ConsorcioForm;
}

export interface CompanySettings {
  logoDataUrl: string | null;
  razaoSocial: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  site: string;
  instagram: string;
}
