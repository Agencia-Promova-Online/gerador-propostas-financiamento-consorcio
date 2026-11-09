import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { Building2, Download, ImagePlus, Trash2, Upload } from 'lucide-react';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Card, FieldGrid, Section } from '@/components/ui/Card';
import { TextField } from '@/components/form/fields';
import { LOGO_ACCEPT, processLogoFile } from '@/lib/logo';
import { saveBlob } from '@/lib/download';
import { exportCompanyBackup, importCompanyBackup } from '@/state/companySettings';
import type { CompanySettings } from '@/types/proposal';

interface CompanyViewProps {
  settings: CompanySettings;
  setSettings: Dispatch<SetStateAction<CompanySettings>>;
  storageError: string | null;
}

export default function CompanyView({ settings, setSettings, storageError }: CompanyViewProps) {
  const logoInput = useRef<HTMLInputElement>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoWarning, setLogoWarning] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [backupMessage, setBackupMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const update = (field: keyof CompanySettings) => (value: string) =>
    setSettings((prev) => ({ ...prev, [field]: value }));

  const handleLogo = async (file: File | undefined) => {
    if (!file) return;
    setProcessing(true);
    setLogoError(null);
    setLogoWarning(null);
    try {
      const { dataUrl, lowResolution } = await processLogoFile(file);
      setSettings((prev) => ({ ...prev, logoDataUrl: dataUrl }));
      if (lowResolution) setLogoWarning('Imagem pequena: o logotipo pode ficar pouco nítido no PDF.');
    } catch (error) {
      setLogoError(error instanceof Error ? error.message : 'Não foi possível usar este arquivo.');
    } finally {
      setProcessing(false);
      if (logoInput.current) logoInput.current.value = '';
    }
  };

  const exportBackup = () => {
    const blob = new Blob([exportCompanyBackup(settings)], { type: 'application/json' });
    saveBlob(blob, 'configuracoes-empresa.json');
  };

  const importBackup = async (file: File | undefined) => {
    if (!file) return;
    try {
      const imported = importCompanyBackup(await file.text());
      setSettings(imported);
      setBackupMessage({ type: 'ok', text: 'Configurações importadas com sucesso.' });
    } catch {
      setBackupMessage({ type: 'error', text: 'Arquivo inválido. Use um arquivo exportado por este sistema.' });
    } finally {
      if (importInput.current) importInput.current.value = '';
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">Configurações</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-white">Dados da empresa</h1>
        <p className="mt-2 text-sm text-ink-400">
          Configure uma vez. Estes dados ficam salvos neste navegador e aparecem no cabeçalho e rodapé do PDF.
        </p>
      </div>

      {storageError && (
        <p role="alert" className="rounded-xl border border-error-500/40 bg-error-900/30 px-4 py-3 text-sm text-error-300">
          {storageError}
        </p>
      )}

      <Card
        title="Logotipo"
        subtitle="PNG, JPG ou SVG de até 2 MB"
        icon={<ImagePlus className="h-5 w-5" aria-hidden />}
        open
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-32 w-full items-center justify-center rounded-2xl border border-dashed border-gold-500/40 bg-white p-4 sm:w-56 shrink-0">
            {settings.logoDataUrl ? (
              <img src={settings.logoDataUrl} alt="Pré-visualização do logotipo" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-center text-xs text-ink-600">Nenhum logotipo. O nome da empresa será usado no PDF.</span>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <input
              ref={logoInput}
              id="logo-input"
              type="file"
              accept={LOGO_ACCEPT}
              className="sr-only"
              onChange={(event) => handleLogo(event.target.files?.[0])}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                disabled={processing}
                onClick={() => logoInput.current?.click()}
                icon={<Upload className="h-4 w-4" aria-hidden />}
              >
                {processing ? 'Processando…' : settings.logoDataUrl ? 'Trocar logotipo' : 'Enviar logotipo'}
              </Button>
              {settings.logoDataUrl && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirmRemove(true)}
                  icon={<Trash2 className="h-4 w-4" aria-hidden />}
                >
                  Remover
                </Button>
              )}
            </div>
            {logoError && <p role="alert" className="text-xs text-error-300">{logoError}</p>}
            {logoWarning && <p className="text-xs text-warning-300">{logoWarning}</p>}
          </div>
        </div>
      </Card>

      <Card
        title="Dados da empresa"
        subtitle={settings.razaoSocial || 'Razão social, CNPJ e contatos'}
        icon={<Building2 className="h-5 w-5" aria-hidden />}
        open
      >
        <Section title="Identificação">
          <FieldGrid>
            <TextField id="co-razao" label="Razão social ou nome fantasia" value={settings.razaoSocial} onChange={update('razaoSocial')} className="sm:col-span-2" />
            <TextField id="co-cnpj" label="CNPJ" value={settings.cnpj} onChange={update('cnpj')} placeholder="00.000.000/0000-00" />
            <TextField id="co-telefone" label="Telefone ou WhatsApp" value={settings.telefone} onChange={update('telefone')} />
            <TextField id="co-email" label="E-mail" type="email" value={settings.email} onChange={update('email')} />
            <TextField id="co-site" label="Site" value={settings.site} onChange={update('site')} />
            <TextField id="co-instagram" label="Instagram (opcional)" value={settings.instagram} onChange={update('instagram')} />
            <TextField id="co-endereco" label="Endereço" value={settings.endereco} onChange={update('endereco')} className="sm:col-span-2" />
          </FieldGrid>
        </Section>
      </Card>

      <Card
        title="Backup das configurações"
        subtitle="Leve os dados para outro navegador ou aparelho"
        icon={<Download className="h-5 w-5" aria-hidden />}
        open
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={exportBackup} icon={<Download className="h-4 w-4" aria-hidden />}>
            Exportar JSON
          </Button>
          <input
            ref={importInput}
            id="backup-input"
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => importBackup(event.target.files?.[0])}
          />
          <Button variant="secondary" size="sm" onClick={() => importInput.current?.click()} icon={<Upload className="h-4 w-4" aria-hidden />}>
            Importar JSON
          </Button>
        </div>
        {backupMessage && (
          <p role="status" className={`text-xs ${backupMessage.type === 'ok' ? 'text-success-300' : 'text-error-300'}`}>
            {backupMessage.text}
          </p>
        )}
      </Card>

      <ConfirmDialog
        open={confirmRemove}
        title="Remover logotipo?"
        message="O logotipo será removido das próximas propostas. Você pode enviar outro a qualquer momento."
        confirmLabel="Remover logotipo"
        onCancel={() => setConfirmRemove(false)}
        onConfirm={() => {
          setSettings((prev) => ({ ...prev, logoDataUrl: null }));
          setConfirmRemove(false);
        }}
      />
    </div>
  );
}
