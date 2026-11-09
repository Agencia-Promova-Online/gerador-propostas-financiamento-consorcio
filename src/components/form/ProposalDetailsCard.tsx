import type { Dispatch } from 'react';
import { FileText } from 'lucide-react';
import { Card, FieldGrid, Section } from '@/components/ui/Card';
import { NumberField, TextField } from '@/components/form/fields';
import type { ProposalAction } from '@/state/proposalReducer';
import type { ProposalResults } from '@/state/deriveResults';
import type { ProposalState } from '@/types/proposal';
import { formatDateBR } from '@/lib/format';

interface ProposalDetailsCardProps {
  state: ProposalState;
  results: ProposalResults;
  dispatch: Dispatch<ProposalAction>;
  open: boolean;
  onToggle: () => void;
  errors: { name?: string; property?: string };
}

export default function ProposalDetailsCard({ state, results, dispatch, open, onToggle, errors }: ProposalDetailsCardProps) {
  const { client, meta } = state;
  const setClient = (field: keyof typeof client) => (value: string) => dispatch({ type: 'client', field, value });
  const setMeta = (patch: Partial<typeof meta>) => dispatch({ type: 'meta', patch });

  return (
    <Card
      title="Cliente e proposta"
      subtitle={client.name || 'Dados do cliente e número da proposta'}
      icon={<FileText className="h-5 w-5" aria-hidden />}
      open={open}
      onToggle={onToggle}
    >
      <Section title="Cliente">
        <FieldGrid>
          <TextField
            id="client-name"
            label="Nome do cliente"
            required
            value={client.name}
            error={errors.name}
            onChange={setClient('name')}
            placeholder="Nome completo"
          />
          <TextField
            id="client-contact"
            label="Telefone ou e-mail"
            value={client.contact}
            onChange={setClient('contact')}
            placeholder="(00) 00000-0000"
          />
          <TextField
            id="client-property"
            label="Bem ou imóvel pretendido"
            required
            value={client.property}
            error={errors.property}
            onChange={setClient('property')}
            placeholder="Ex.: Apartamento 2 quartos, Jardins"
            className="sm:col-span-2"
          />
          <TextField
            id="client-seller"
            label="Nome do vendedor"
            value={client.seller}
            onChange={setClient('seller')}
          />
        </FieldGrid>
      </Section>

      <Section title="Proposta">
        <FieldGrid>
          <TextField
            id="meta-number"
            label="Número da proposta"
            value={meta.number}
            onChange={(number) => setMeta({ number })}
            hint="Gerado automaticamente, pode ser editado."
          />
          <div className="flex min-w-0 flex-col gap-1.5">
            <label htmlFor="meta-issueDate" className="text-sm font-medium text-ink-200">
              Data de emissão
            </label>
            <input
              id="meta-issueDate"
              type="date"
              value={meta.issueDate}
              onChange={(event) => event.target.value && setMeta({ issueDate: event.target.value })}
              className="field-input [color-scheme:dark]"
            />
          </div>
          <NumberField
            id="meta-validityDays"
            label="Validade (dias)"
            kind="integer"
            value={meta.validityDays}
            onChange={(validityDays) => setMeta({ validityDays: Math.round(validityDays) })}
            hint={`Válida até ${formatDateBR(results.validUntil)}.`}
          />
        </FieldGrid>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="client-observations" className="text-sm font-medium text-ink-200">
            Observações
          </label>
          <textarea
            id="client-observations"
            rows={3}
            maxLength={600}
            value={client.observations}
            onChange={(event) => dispatch({ type: 'client', field: 'observations', value: event.target.value })}
            placeholder="Condições especiais, prazos de análise ou outras informações para o cliente"
            className="field-input resize-y"
          />
        </div>
      </Section>
    </Card>
  );
}
