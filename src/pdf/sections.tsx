import { Image, Text, View } from '@react-pdf/renderer';
import { formatBRL, formatDateBR, formatPercent } from '@/lib/format';
import type { ComparativoRow } from '@/calc/comparativo';
import type { ProposalResults } from '@/state/deriveResults';
import type { ClientData, CompanySettings, ConsorcioForm, FinanciamentoForm } from '@/types/proposal';
import type { FinanciamentoResult } from '@/calc/financiamento';
import type { ConsorcioResult } from '@/calc/consorcio';
import { styles } from '@/pdf/styles';

const DASH = '—';

export const SYSTEM_LABEL = { SAC: 'SAC (parcelas decrescentes)', PRICE: 'Price (parcelas fixas)' } as const;
export const RATE_LABEL = { nominal: 'nominal', efetiva: 'efetiva' } as const;

export const LEGAL_NOTICE =
  'Simulação sem valor contratual. Valores sujeitos a análise de crédito, alteração de taxas e condições da instituição.';

interface Item {
  label: string;
  value: string;
  highlight?: boolean;
}

export function SectionHeading({ title }: { title: string }) {
  return (
    <View style={styles.sectionTitleRow} wrap={false}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRule} />
    </View>
  );
}

function KeyValueGrid({ items }: { items: Item[] }) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={styles.gridCell} wrap={false}>
          <Text style={styles.gridLabel}>{item.label}</Text>
          <Text style={styles.gridValue}>{item.value || DASH}</Text>
        </View>
      ))}
    </View>
  );
}

export function ClientBlock({ client }: { client: ClientData }) {
  const items: Item[] = [
    { label: 'Cliente', value: client.name },
    { label: 'Contato', value: client.contact },
    { label: 'Bem pretendido', value: client.property },
    { label: 'Vendedor', value: client.seller },
  ];
  return (
    <View style={styles.block} wrap={false}>
      <SectionHeading title="Dados do cliente" />
      <View style={styles.card}>
        <KeyValueGrid items={items} />
      </View>
    </View>
  );
}

export function FinanciamentoBlock({ title, fin, result: r }: { title: string; fin: FinanciamentoForm; result: FinanciamentoResult }) {
  const items: Item[] = [
    { label: 'Instituição', value: fin.bank },
    { label: 'Amortização', value: SYSTEM_LABEL[fin.system] },
    { label: 'Taxa de juros', value: `${formatPercent(fin.annualRatePct)} ao ano (${RATE_LABEL[fin.rateMode]})` },
    { label: 'Prazo', value: `${fin.term} meses` },
    { label: 'Crédito (valor do bem)', value: formatBRL(fin.credit) },
    { label: 'Entrada', value: formatBRL(fin.down) },
    { label: 'Valor financiado', value: formatBRL(r.financiado) },
    { label: '1ª parcela', value: formatBRL(r.parcela) },
    ...(fin.showLast ? [{ label: 'Última parcela', value: formatBRL(r.ultimaParcela) }] : []),
    { label: 'Cartório', value: formatBRL(fin.cartorio) },
    { label: `Renda exigida (${formatPercent(fin.commitmentPct)} da parcela)`, value: formatBRL(r.rendaExigida) },
    { label: 'Total de juros', value: formatBRL(r.totalJuros) },
  ];

  return (
    <View style={styles.block} wrap={false}>
      <SectionHeading title={title} />
      <View style={styles.card}>
        <Text style={styles.blockHeading}>{fin.titulo || fin.bank || 'Financiamento bancário'}</Text>
        <Text style={styles.blockSubheading}>Simulação com amortização {fin.system}</Text>
        <KeyValueGrid items={items} />
        <View style={styles.highlightRow}>
          <Text style={styles.highlightLabel}>Total pago</Text>
          <Text style={styles.highlightValue}>{formatBRL(r.totalPago)}</Text>
        </View>
      </View>
    </View>
  );
}

export function ConsorcioBlock({ title, cons, result: r }: { title: string; cons: ConsorcioForm; result: ConsorcioResult }) {
  const items: Item[] = [
    { label: 'Administradora', value: cons.administradora },
    { label: 'Crédito', value: formatBRL(cons.credit) },
    {
      label: 'Prazo',
      value: cons.embutidas > 0 ? `${cons.term} meses (${r.parcelasPagas} pagas)` : `${cons.term} meses`,
    },
    { label: 'Adesão', value: formatBRL(cons.adesao) },
    { label: 'Lance', value: formatBRL(cons.lance) },
    { label: 'Parcela cheia', value: formatBRL(r.cheia ?? 0) },
    {
      label: 'Parcela reduzida',
      value: `${formatBRL(r.reduzida)} (desconto de ${formatPercent(r.desconto)})`,
    },
    { label: 'Entrada', value: formatBRL(cons.entrada) },
    { label: 'Taxas pagas', value: formatBRL(r.taxas) },
    { label: `Renda mínima (${formatPercent(cons.commitmentPct)} da parcela)`, value: formatBRL(r.rendaMinima) },
  ];

  return (
    <View style={styles.block} wrap={false}>
      <SectionHeading title={title} />
      <View style={styles.card}>
        <Text style={styles.blockHeading}>{cons.titulo || cons.administradora || 'Consórcio'}</Text>
        <Text style={styles.blockSubheading}>Simulação com parcela cheia e reduzida</Text>
        <KeyValueGrid items={items} />
        <View style={styles.highlightRow}>
          <Text style={styles.highlightLabel}>Total pago</Text>
          <Text style={styles.highlightValue}>{formatBRL(r.totalPago)}</Text>
        </View>
      </View>
    </View>
  );
}

function formatComparativoValue(row: ComparativoRow, value: number): string {
  return row.key === 'prazo' ? `${value} meses` : formatBRL(value);
}

export function ComparisonBlock({ results }: { results: ProposalResults }) {
  const comparison = results.comparison;
  if (!comparison) return null;
  const { rows, economia, label1, label2 } = comparison;

  const economiaText = economia
    ? `Escolhendo ${economia.best === 'financiamento' ? label1 : label2}, a economia estimada em custo além do bem é de `
    : null;

  return (
    <View style={styles.block} wrap={false}>
      <SectionHeading title="Comparativo" />
      <View>
        <View style={styles.tableHead}>
          <Text style={[styles.tableHeadText, { flex: 1.6 }]}>Item</Text>
          <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>{label1}</Text>
          <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>{label2}</Text>
        </View>
        {rows.map((row, index) => {
          const last = index === rows.length - 1;
          return (
            <View key={row.key} style={last ? styles.tableRowLast : styles.tableRow} wrap={false}>
              <Text style={styles.colLabel}>{row.label}</Text>
              <Text style={row.best === 'financiamento' ? styles.colValueBest : styles.colValue}>
                {formatComparativoValue(row, row.financiamento)}
              </Text>
              <Text style={row.best === 'consorcio' ? styles.colValueBest : styles.colValue}>
                {formatComparativoValue(row, row.consorcio)}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.legend}>Destaque dourado: melhor cenário em cada linha.</Text>
      <View style={styles.economia} wrap={false}>
        <Text style={styles.economiaLabel}>Economia estimada</Text>
        {economia && economiaText ? (
          <Text style={styles.economiaText}>
            {economiaText}
            <Text style={styles.economiaStrong}>
              {formatBRL(economia.valor)} ({formatPercent(economia.percent)})
            </Text>
            .
          </Text>
        ) : (
          <Text style={styles.economiaText}>As duas opções têm custo equivalente nesta simulação.</Text>
        )}
      </View>
    </View>
  );
}

export function NoticeBlock({ observations }: { observations: string }) {
  return (
    <View style={styles.block} wrap={false}>
      <SectionHeading title="Observações" />
      {observations.trim() ? <Text style={styles.observations}>{observations.trim()}</Text> : null}
      <View style={styles.notice}>
        <Text style={styles.noticeText}>{LEGAL_NOTICE}</Text>
      </View>
    </View>
  );
}

export function Header({ company, number, issueDate, validUntil }: {
  company: CompanySettings;
  number: string;
  issueDate: string;
  validUntil: string;
}) {
  return (
    <View style={styles.band}>
      {company.logoDataUrl ? (
        <View style={styles.logoChip}>
          <Image src={company.logoDataUrl} style={styles.logo} />
        </View>
      ) : (
        <Text style={styles.companyNameHeader}>{company.razaoSocial || 'Sua empresa'}</Text>
      )}
      <View style={styles.headerRight}>
        <Text style={styles.headerTitle}>Proposta comercial</Text>
        <Text style={styles.headerMeta}>
          Nº <Text style={styles.headerMetaStrong}>{number}</Text>
        </Text>
        <Text style={styles.headerMeta}>
          Emissão: <Text style={styles.headerMetaStrong}>{formatDateBR(issueDate)}</Text>
        </Text>
        <Text style={styles.headerMeta}>
          Validade: <Text style={styles.headerMetaStrong}>{formatDateBR(validUntil)}</Text>
        </Text>
      </View>
    </View>
  );
}

export function Footer({ company }: { company: CompanySettings }) {
  const contacts = [
    company.cnpj && `CNPJ ${company.cnpj}`,
    company.telefone,
    company.email,
  ].filter(Boolean);
  const web = [company.endereco, company.site, company.instagram && `@${company.instagram.replace(/^@/, '')}`].filter(Boolean);

  return (
    <View style={styles.footer} fixed>
      <View style={{ flex: 1, paddingRight: 16 }}>
        <Text style={styles.footerName}>{company.razaoSocial || 'Sua empresa'}</Text>
        {contacts.length > 0 && <Text style={styles.footerLine}>{contacts.join('  ·  ')}</Text>}
        {web.length > 0 && <Text style={styles.footerLine}>{web.join('  ·  ')}</Text>}
      </View>
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
      />
    </View>
  );
}
