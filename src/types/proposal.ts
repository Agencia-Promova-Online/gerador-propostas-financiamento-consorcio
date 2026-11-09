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
  titulo: string;
  bank: string;
  showLast: boolean;
  overrides: FinanciamentoOverrides;
}

export interface ConsorcioForm extends ConsorcioInput {
  titulo: string;
  administradora: string;
  overrides: ConsorcioOverrides;
}

export type PropostaType = 'financiamento' | 'consorcio';

export interface BaseProposta {
  id: string;
  type: PropostaType;
  includeInPdf: boolean;
}

export interface PropostaFinanciamento extends BaseProposta {
  type: 'financiamento';
  data: FinanciamentoForm;
}

export interface PropostaConsorcio extends BaseProposta {
  type: 'consorcio';
  data: ConsorcioForm;
}

export type PropostaItem = PropostaFinanciamento | PropostaConsorcio;

export interface ComparisonConfig {
  show: boolean;
  item1Id: string | null;
  item2Id: string | null;
}

export interface ProposalState {
  client: ClientData;
  meta: ProposalMeta;
  propostas: PropostaItem[];
  comparison: ComparisonConfig;
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
