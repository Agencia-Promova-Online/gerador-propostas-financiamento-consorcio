import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface CardProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  open: boolean;
  onToggle?: () => void;
  trailing?: ReactNode;
  children: ReactNode;
}

export function Card({ title, subtitle, icon, open, onToggle, trailing, children }: CardProps) {
  const heading = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border gold-border bg-gold-500/10 text-gold-300">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-xl font-semibold leading-tight text-white">{title}</span>
        {subtitle && <span className="block truncate text-xs text-ink-400">{subtitle}</span>}
      </span>
    </>
  );

  return (
    <section className="overflow-hidden rounded-card border border-ink-700 bg-ink-900 shadow-[0_1px_0_0_rgba(201,162,39,0.08)_inset]">
      <div className="flex items-center gap-3 border-b border-transparent p-4 sm:p-5">
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          >
            {heading}
            <ChevronDown
              aria-hidden
              className={`ml-auto h-5 w-5 shrink-0 text-ink-400 transition-transform duration-200 group-hover:text-gold-300 ${
                open ? 'rotate-180' : ''
              }`}
            />
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3">{heading}</div>
        )}
        {trailing && <div className="shrink-0">{trailing}</div>}
      </div>
      {open && <div className="animate-fade-in space-y-6 px-4 pb-5 sm:px-5 sm:pb-6">{children}</div>}
    </section>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">{title}</h3>
        <span className="h-px flex-1 bg-gradient-to-r from-gold-500/40 to-transparent" />
      </div>
      {children}
    </div>
  );
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}
