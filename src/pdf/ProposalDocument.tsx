import { Document, Page, View } from '@react-pdf/renderer';
import type { ProposalResults } from '@/state/deriveResults';
import type { CompanySettings, ProposalState } from '@/types/proposal';
import { styles } from '@/pdf/styles';
import {
  ClientBlock,
  ComparisonBlock,
  ConsorcioBlock,
  FinanciamentoBlock,
  Footer,
  Header,
  NoticeBlock,
} from '@/pdf/sections';

interface ProposalDocumentProps {
  state: ProposalState;
  results: ProposalResults;
  company: CompanySettings;
}

export default function ProposalDocument({ state, results, company }: ProposalDocumentProps) {
  const { meta, client } = state;
  return (
    <Document
      title={`Proposta ${meta.number} - ${client.name || 'Cliente'}`}
      author={company.razaoSocial || 'Proposta comercial'}
      subject="Proposta comercial de financiamento e consórcio"
      creator="Gerador de Propostas"
    >
      <Page size="A4" style={styles.page}>
        <Header
          company={company}
          number={meta.number}
          issueDate={meta.issueDate}
          validUntil={results.validUntil}
        />
        <View style={styles.body}>
          <ClientBlock client={client} />
          {state.includeFinanciamento && <FinanciamentoBlock state={state} results={results} />}
          {state.includeConsorcio && <ConsorcioBlock state={state} results={results} />}
          <ComparisonBlock results={results} />
          <NoticeBlock observations={client.observations} />
        </View>
        <Footer company={company} />
      </Page>
    </Document>
  );
}
