interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isPrimary = variant === 'primary'

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.8rem',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        padding: '0.65rem 1.5rem',
        border: `1px solid ${isPrimary ? 'var(--color-gold)' : 'var(--color-border-bright)'}`,
        borderRadius: '2px',
        background: isPrimary ? 'var(--color-gold)' : 'transparent',
        color: isPrimary ? '#0d0d0d' : 'var(--color-text-muted)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.5 : 1,
        transition: 'all 0.15s',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          const el = e.currentTarget
          el.style.background = isPrimary
            ? 'var(--color-gold-bright)'
            : 'var(--color-surface-raised)'
          el.style.borderColor = isPrimary
            ? 'var(--color-gold-bright)'
            : 'var(--color-gold-dim)'
        }
        props.onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.background = isPrimary ? 'var(--color-gold)' : 'transparent'
        el.style.borderColor = isPrimary
          ? 'var(--color-gold)'
          : 'var(--color-border-bright)'
        props.onMouseLeave?.(e)
      }}
    >
      {loading ? 'Please wait...' : children}
    </button>
  )
}