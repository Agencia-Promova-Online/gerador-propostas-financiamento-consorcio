import Field from '@/components/ui/Field';
import NumericInput, { type NumericKind } from '@/components/ui/NumericInput';

interface NumberFieldProps {
  id: string;
  label: string;
  kind?: NumericKind;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
  error?: string;
  hint?: string;
  overridden?: boolean;
  calculated?: boolean;
  onRestore?: () => void;
  className?: string;
}

export function NumberField({
  id,
  label,
  kind = 'money',
  value,
  onChange,
  required,
  error,
  hint,
  overridden,
  calculated,
  onRestore,
  className,
}: NumberFieldProps) {
  const status = calculated ? (overridden ? 'manual' : 'auto') : undefined;
  return (
    <Field
      id={id}
      label={label}
      required={required}
      status={status}
      onRestore={onRestore}
      error={error}
      hint={hint}
      className={className}
    >
      <NumericInput
        id={id}
        kind={kind}
        value={value}
        onChange={onChange}
        invalid={Boolean(error)}
        placeholder={kind === 'money' ? '0,00' : undefined}
      />
    </Field>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  type?: string;
  maxLength?: number;
  className?: string;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  hint,
  type = 'text',
  maxLength = 120,
  className,
}: TextFieldProps) {
  return (
    <Field id={id} label={label} required={required} error={error} hint={hint} className={className}>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className="field-input"
      />
    </Field>
  );
}
