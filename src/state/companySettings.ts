import type { CompanySettings } from '@/types/proposal';

const STORAGE_KEY = 'proposta.empresa.v1';
const BACKUP_VERSION = 1;
const LOGO_PREFIX = 'data:image/png;base64,';

export const EMPTY_COMPANY: CompanySettings = {
  logoDataUrl: null,
  razaoSocial: '',
  cnpj: '',
  telefone: '',
  email: '',
  endereco: '',
  site: '',
  instagram: '',
};

const TEXT_KEYS = ['razaoSocial', 'cnpj', 'telefone', 'email', 'endereco', 'site', 'instagram'] as const;

export function sanitizeCompany(raw: unknown): CompanySettings {
  const source = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const settings: CompanySettings = { ...EMPTY_COMPANY };

  for (const key of TEXT_KEYS) {
    const value = source[key];
    if (typeof value === 'string') settings[key] = value.slice(0, 300);
  }

  const logo = source.logoDataUrl;
  if (typeof logo === 'string' && logo.startsWith(LOGO_PREFIX)) settings.logoDataUrl = logo;

  return settings;
}

export function loadCompanySettings(): CompanySettings {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? sanitizeCompany(JSON.parse(stored)) : EMPTY_COMPANY;
  } catch {
    return EMPTY_COMPANY;
  }
}

export function saveCompanySettings(settings: CompanySettings): string | null {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return null;
  } catch {
    return 'Não foi possível salvar. O armazenamento do navegador pode estar cheio; tente um logotipo menor.';
  }
}

export function exportCompanyBackup(settings: CompanySettings): string {
  return JSON.stringify({ version: BACKUP_VERSION, empresa: settings }, null, 2);
}

export function importCompanyBackup(text: string): CompanySettings {
  const parsed: unknown = JSON.parse(text);
  if (typeof parsed !== 'object' || parsed === null || !('empresa' in parsed)) {
    throw new Error('Arquivo de configurações inválido.');
  }
  return sanitizeCompany((parsed as { empresa: unknown }).empresa);
}
