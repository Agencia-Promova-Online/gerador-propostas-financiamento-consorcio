import type { ConsorcioField } from '@/calc/consorcio';
import type { FinanciamentoField } from '@/calc/financiamento';
import type { ClientData, ConsorcioForm, FinanciamentoForm, ProposalMeta, ProposalState } from '@/types/proposal';
import { todayISO } from '@/lib/format';

export const DEFAULT_COMMITMENT_PCT = 30;
export const DEFAULT_VALIDITY_DAYS = 7;

export type OverrideBlock = 'financiamento' | 'consorcio';

export type ProposalAction =
  | { type: 'client'; field: keyof ClientData; value: string }
  | { type: 'meta'; patch: Partial<ProposalMeta> }
  | { type: 'include'; block: OverrideBlock; value: boolean }
  | { type: 'financiamento'; patch: Partial<FinanciamentoForm> }
  | { type: 'consorcio'; patch: Partial<ConsorcioForm> }
  | { type: 'financiamentoOverride'; field: FinanciamentoField; value: number | undefined }
  | { type: 'consorcioOverride'; field: ConsorcioField; value: number | undefined }
  | { type: 'reset' };

export function generateProposalNumber(isoDate: string): string {
  const sequence = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${isoDate.slice(0, 4)}-${isoDate.slice(5, 7)}${isoDate.slice(8, 10)}-${sequence}`;
}

export function createInitialProposal(): ProposalState {
  const issueDate = todayISO();
  return {
    client: { name: '', contact: '', property: '', seller: '', observations: '' },
    meta: {
      number: generateProposalNumber(issueDate),
      issueDate,
      validityDays: DEFAULT_VALIDITY_DAYS,
    },
    includeFinanciamento: true,
    includeConsorcio: true,
    financiamento: {
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
    },
    consorcio: {
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
    },
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

    case 'include':
      return action.block === 'financiamento'
        ? { ...state, includeFinanciamento: action.value }
        : { ...state, includeConsorcio: action.value };

    case 'financiamento':
      return { ...state, financiamento: { ...state.financiamento, ...action.patch } };

    case 'consorcio': {
      const next = { ...state.consorcio, ...action.patch };
      if (action.patch.linked && !state.consorcio.linked) {
        next.overrides = withoutKey(next.overrides, 'reduzida');
      }
      return { ...state, consorcio: next };
    }

    case 'financiamentoOverride': {
      const overrides = { ...state.financiamento.overrides };
      if (action.value === undefined) delete overrides[action.field];
      else overrides[action.field] = action.value;
      return { ...state, financiamento: { ...state.financiamento, overrides } };
    }

    case 'consorcioOverride':
      return { ...state, consorcio: applyConsorcioOverride(state.consorcio, action.field, action.value) };

    case 'reset':
      return createInitialProposal();
  }
}
