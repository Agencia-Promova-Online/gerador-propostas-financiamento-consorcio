import { useState } from 'react';
import { formatPercentPlain, formatPlain, parseDecimalText, parseIntegerText } from '@/lib/format';

export type NumericKind = 'money' | 'percent' | 'integer';

interface NumericInputProps {
  id: string;
  kind: NumericKind;
  value: number;
  onChange: (value: number) => void;
  invalid?: boolean;
  placeholder?: string;
}

function toDisplay(kind: NumericKind, value: number): string {
  if (kind === 'money') return formatPlain(value);
  if (kind === 'percent') return formatPercentPlain(value);
  return String(value);
}

function parse(kind: NumericKind, text: string): number | null {
  return kind === 'integer' ? parseIntegerText(text) : parseDecimalText(text);
}

export default function NumericInput({ id, kind, value, onChange, invalid, placeholder }: NumericInputProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? toDisplay(kind, value);

  const handleChange = (text: string) => {
    setDraft(text);
    const parsed = parse(kind, text);
    if (parsed !== null) onChange(parsed);
    else if (text.trim() === '') onChange(0);
  };

  const padding = kind === 'money' ? 'pl-10' : kind === 'percent' ? 'pr-9' : '';

  return (
    <div className="relative">
      {kind === 'money' && (
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-medium text-ink-400">
          R$
        </span>
      )}
      <input
        id={id}
        type="text"
        inputMode={kind === 'integer' ? 'numeric' : 'decimal'}
        autoComplete="off"
        value={shown}
        placeholder={placeholder}
        aria-invalid={invalid}
        onFocus={() => setDraft(toDisplay(kind, value))}
        onBlur={() => setDraft(null)}
        onChange={(event) => handleChange(event.target.value)}
        className={`field-input tabular-nums ${padding}`}
      />
      {kind === 'percent' && (
        <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm font-medium text-ink-400">
          %
        </span>
      )}
    </div>
  );
}
