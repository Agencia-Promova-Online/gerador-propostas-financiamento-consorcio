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
  const { meta, client, propostas } = state;
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
          
          {propostas.map((proposta, index) => {
            if (!proposta.includeInPdf) return null;
            const title = `Proposta ${String(index + 1).padStart(2, '0')}`;
            const resultItem = results.propostas.find(r => r.id === proposta.id);
            if (!resultItem) return null;

            if (proposta.type === 'financiamento') {
              return (
                <FinanciamentoBlock 
                  key={proposta.id} 
                  title={title}
                  fin={proposta.data} 
                  result={resultItem.result as any} 
                />
              );
            } else {
              return (
                <ConsorcioBlock 
                  key={proposta.id} 
                  title={title}
                  cons={proposta.data} 
                  result={resultItem.result as any} 
                />
              );
            }
          })}

          <ComparisonBlock results={results} />
          <NoticeBlock observations={client.observations} />
        </View>
        <Footer company={company} />
      </Page>
    </Document>
  );
}