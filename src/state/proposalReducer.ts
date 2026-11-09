import type { ConsorcioField, ConsorcioInput } from '@/calc/consorcio';
import type { FinanciamentoField, FinanciamentoInput } from '@/calc/financiamento';
import type { 
  ClientData, 
  ComparisonConfig, 
  ConsorcioForm, 
  FinanciamentoForm, 
  ProposalMeta, 
  ProposalState, 
  PropostaItem, 
  PropostaType 
} from '@/types/proposal';
import { todayISO } from '@/lib/format';

export const DEFAULT_COMMITMENT_PCT = 30;
export const DEFAULT_VALIDITY_DAYS = 7;

export type ProposalAction =
  | { type: 'client'; field: keyof ClientData; value: string }
  | { type: 'meta'; patch: Partial<ProposalMeta> }
  | { type: 'addProposta'; propostaType: PropostaType }
  | { type: 'duplicateProposta'; id: string }
  | { type: 'removeProposta'; id: string }
  | { type: 'updatePropostaInclude'; id: string; value: boolean }
  | { type: 'financiamento'; id: string; patch: Partial<FinanciamentoForm> }
  | { type: 'consorcio'; id: string; patch: Partial<ConsorcioForm> }
  | { type: 'financiamentoOverride'; id: string; field: FinanciamentoField; value: number | undefined }
  | { type: 'consorcioOverride'; id: string; field: ConsorcioField; value: number | undefined }
  | { type: 'updateComparison'; patch: Partial<ComparisonConfig> }
  | { type: 'reset' };

export function generateProposalNumber(isoDate: string): string {
  const sequence = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${isoDate.slice(0, 4)}-${isoDate.slice(5, 7)}${isoDate.slice(8, 10)}-${sequence}`;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function defaultFinanciamento(): FinanciamentoForm {
  return {
    titulo: '',
    bank: '',
    system: 'SAC',
    rateMode: 'nominal',
    credit: 0,
    down: 0,
    annualRatePct: 0,
    term: 360,
    cartorio: 0,
    cartorioInTotal: false,
    commitmentPct: DEFAULT_COMMITMENT_PCT,
    showLast: false,
    overrides: {},
  };
}

function defaultConsorcio(): ConsorcioForm {
  return {
    titulo: '',
    administradora: '',
    credit: 0,
    adesao: 0,
    lance: 0,
    entrada: 0,
    term: 220,
    embutidas: 0,
    cheiaAuto: false,
    linked: true,
    commitmentPct: DEFAULT_COMMITMENT_PCT,
    overrides: {},
  };
}

export function createInitialProposal(): ProposalState {
  const issueDate = todayISO();
  const idFin = generateId();
  const idCons = generateId();
  return {
    client: { name: '', contact: '', property: '', seller: '', observations: '' },
    meta: {
      number: generateProposalNumber(issueDate),
      issueDate,
      validityDays: DEFAULT_VALIDITY_DAYS,
    },
    propostas: [
      { id: idFin, type: 'financiamento', includeInPdf: true, data: defaultFinanciamento() },
      { id: idCons, type: 'consorcio', includeInPdf: true, data: defaultConsorcio() },
    ],
    comparison: {
      show: true,
      item1Id: idFin,
      item2Id: idCons,
    }
  };
}

function withoutKey<T extends object>(source: T, key: keyof T): T {
  const copy = { ...source };
  delete copy[key];
  return copy;
}

function applyConsorcioOverride(
  form: ConsorcioForm,
  field: ConsorcioField,
  value: number | undefined,
): ConsorcioForm {
  const { overrides } = form;

  if (value === undefined) {
    if (field === 'desconto' || field === 'reduzida') {
      return { ...form, overrides: withoutKey(withoutKey(overrides, 'desconto'), 'reduzida') };
    }
    return { ...form, overrides: withoutKey(overrides, field) };
  }

  if (!form.linked || (field !== 'desconto' && field !== 'reduzida')) {
    if (field === 'cheia' && form.linked && overrides.reduzida !== undefined) {
      return { ...form, overrides: { ...withoutKey(overrides, 'desconto'), cheia: value } };
    }
    return { ...form, overrides: { ...overrides, [field]: value } };
  }

  const other = field === 'desconto' ? 'reduzida' : 'desconto';
  return { ...form, overrides: { ...withoutKey(overrides, other), [field]: value } };
}

export function proposalReducer(state: ProposalState, action: ProposalAction): ProposalState {
  switch (action.type) {
    case 'client':
      return { ...state, client: { ...state.client, [action.field]: action.value } };

    case 'meta':
      return { ...state, meta: { ...state.meta, ...action.patch } };

    case 'addProposta': {
      const newProposta: PropostaItem = action.propostaType === 'financiamento'
        ? { id: generateId(), type: 'financiamento', includeInPdf: true, data: defaultFinanciamento() }
        : { id: generateId(), type: 'consorcio', includeInPdf: true, data: defaultConsorcio() };
      return { ...state, propostas: [...state.propostas, newProposta] };
    }

    case 'duplicateProposta': {
      const idx = state.propostas.findIndex(p => p.id === action.id);
      if (idx === -1) return state;
      const original = state.propostas[idx];
      const duplicated: PropostaItem = JSON.parse(JSON.stringify(original));
      duplicated.id = generateId();
      const newPropostas = [...state.propostas];
      newPropostas.splice(idx + 1, 0, duplicated);
      return { ...state, propostas: newPropostas };
    }

    case 'removeProposta': {
      const newPropostas = state.propostas.filter(p => p.id !== action.id);
      return { ...state, propostas: newPropostas };
    }

    case 'updatePropostaInclude': {
      return {
        ...state,
        propostas: state.propostas.map(p => p.id === action.id ? { ...p, includeInPdf: action.value } : p)
      };
    }

    case 'financiamento': {
      return {
        ...state,
        propostas: state.propostas.map(p => {
          if (p.id === action.id && p.type === 'financiamento') {
            return { ...p, data: { ...p.data, ...action.patch } };
          }
          return p;
        })
      };
    }

    case 'consorcio': {
      return {
        ...state,
        propostas: state.propostas.map(p => {
          if (p.id === action.id && p.type === 'consorcio') {
            const next = { ...p.data, ...action.patch };
            if (action.patch.linked && !p.data.linked) {
              next.overrides = withoutKey(next.overrides, 'reduzida');
            }
            return { ...p, data: next };
          }
          return p;
        })
      };
    }

    case 'financiamentoOverride': {
      return {
        ...state,
        propostas: state.propostas.map(p => {
          if (p.id === action.id && p.type === 'financiamento') {
            const overrides = { ...p.data.overrides };
            if (action.value === undefined) delete overrides[action.field];
            else overrides[action.field] = action.value;
            return { ...p, data: { ...p.data, overrides } };
          }
          return p;
        })
      };
    }

    case 'consorcioOverride': {
      return {
        ...state,
        propostas: state.propostas.map(p => {
          if (p.id === action.id && p.type === 'consorcio') {
            return { ...p, data: applyConsorcioOverride(p.data, action.field, action.value) };
          }
          return p;
        })
      };
    }

    case 'updateComparison': {
      return { ...state, comparison: { ...state.comparison, ...action.patch } };
    }

    case 'reset':
      return createInitialProposal();
  }
}
