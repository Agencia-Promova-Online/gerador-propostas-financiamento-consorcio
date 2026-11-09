interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export default function Toggle({ id, checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <label htmlFor={id} className="block cursor-pointer text-sm font-medium text-ink-200">
          {label}
        </label>
        {description && <p className="text-xs text-ink-400">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:opacity-40 ${
          checked ? 'gold-gradient border-transparent' : 'border-ink-600 bg-ink-800'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-5 bg-ink-950' : 'translate-x-0.5 bg-ink-400'
          }`}
        />
      </button>
    </div>
  );
}
