import type { ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';

export type FieldStatus = 'auto' | 'manual';

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  status?: FieldStatus;
  onRestore?: () => void;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

export default function Field({
  id,
  label,
  required,
  status,
  onRestore,
  error,
  hint,
  className = '',
  children,
}: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <div className="flex min-h-6 items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-ink-200">
          {label}
          {required && (
            <span className="ml-0.5 text-gold-400" aria-label="obrigatório">
              *
            </span>
          )}
        </label>
        {status && (
          <div className="flex items-center gap-1">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                status === 'auto'
                  ? 'border border-gold-500/40 bg-gold-500/10 text-gold-300'
                  : 'border border-ink-600 bg-ink-800 text-ink-200'
              }`}
            >
              {status === 'auto' ? 'auto' : 'manual'}
            </span>
            {status === 'manual' && onRestore && (
              <button
                type="button"
                onClick={onRestore}
                title="Restaurar cálculo automático"
                aria-label={`Restaurar cálculo automático de ${label}`}
                className="flex h-6 w-6 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-ink-800 hover:text-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </div>
        )}
      </div>
      {children}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-error-300">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}
