import { useEffect, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'md' | 'xl' | 'full';
  footer?: ReactNode;
}

const sizeClasses = {
  md: 'max-w-md',
  xl: 'max-w-5xl',
  full: 'max-w-6xl',
};

export default function Modal({ open, onClose, title, children, size = 'md', footer }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`animate-fade-in relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-card border border-ink-700 bg-ink-900 shadow-2xl sm:rounded-card ${sizeClasses[size]} ${
          size === 'full' ? 'h-[92dvh]' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-ink-700 px-5 py-4">
          <h2 id={titleId} className="font-display text-lg font-semibold text-white">
            {title}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar" className="!h-9 !w-9 !px-0">
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-t border-ink-700 bg-ink-900 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
