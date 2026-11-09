import { useEffect, useState } from 'react';
import { loadCompanySettings, saveCompanySettings } from '@/state/companySettings';
import type { CompanySettings } from '@/types/proposal';

export function useCompanySettings() {
  const [settings, setSettings] = useState<CompanySettings>(loadCompanySettings);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    setStorageError(saveCompanySettings(settings));
  }, [settings]);

  return { settings, setSettings, storageError };
}
