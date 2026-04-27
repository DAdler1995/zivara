interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export default function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-display text-[0.75rem] tracking-widest uppercase text-(--color-gold-dim)">
        {label}
      </label>
      <input
        {...props}
        className={`bg-(--color-surface) border rounded-xs text-(--color-text) px-3 py-[0.6rem] text-base font-body outline-none transition-colors duration-150 w-full focus:border-(--color-gold) ${
          error ? 'border-(--color-red-bright)' : 'border-(--color-border-bright)'
        } ${className ?? ''}`}
      />
      {error && (
        <span className="text-(--color-red-bright) text-[0.85rem]">{error}</span>
      )}
    </div>
  )
}
