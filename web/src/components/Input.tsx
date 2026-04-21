interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          color: 'var(--color-gold-dim)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </label>
      <input
        {...props}
        style={{
          background: 'var(--color-surface)',
          border: `1px solid ${error ? 'var(--color-red-bright)' : 'var(--color-border-bright)'}`,
          borderRadius: '2px',
          color: 'var(--color-text)',
          padding: '0.6rem 0.75rem',
          fontSize: '1rem',
          fontFamily: 'var(--font-body)',
          outline: 'none',
          transition: 'border-color 0.15s',
          width: '100%',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--color-gold)'
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error
            ? 'var(--color-red-bright)'
            : 'var(--color-border-bright)'
          props.onBlur?.(e)
        }}
      />
      {error && (
        <span style={{ color: 'var(--color-red-bright)', fontSize: '0.85rem' }}>
          {error}
        </span>
      )}
    </div>
  )
}