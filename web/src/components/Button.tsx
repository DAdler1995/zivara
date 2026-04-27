interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  loading = false,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isPrimary = variant === 'primary'
  const isDisabled = disabled || loading

  const hoverClasses = isDisabled
    ? ''
    : isPrimary
      ? 'hover:bg-(--color-gold-bright) hover:border-(--color-gold-bright)'
      : 'hover:bg-(--color-surface-raised) hover:border-(--color-gold-dim)'

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        'font-display text-[0.8rem] tracking-[0.12em] uppercase',
        'py-[0.65rem] px-6 w-full border rounded-xs',
        'transition-all duration-150',
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        isPrimary
          ? 'border-(--color-gold) bg-(--color-gold) text-(--color-bg)'
          : 'border-(--color-border-bright) bg-transparent text-(--color-text-muted)',
        hoverClasses,
        className ?? '',
      ].join(' ')}
    >
      {loading ? 'Please wait...' : children}
    </button>
  )
}
