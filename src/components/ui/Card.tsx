interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  accent?: 'yellow' | 'red' | 'green' | 'blue' | null
  /** float-up hover + soft-shadow-to-hard-accent-border transition (Tori's .card-lift) */
  lift?: boolean
}

const ACCENT_COLORS: Record<string, string> = {
  yellow: 'var(--color-yellow)',
  red: 'var(--color-red)',
  green: 'var(--color-green)',
  blue: 'var(--color-blue)',
}

export function Card({ children, className = '', onClick, accent, lift = false }: CardProps) {
  const borderColor = accent ? ACCENT_COLORS[accent] : 'var(--color-structural)'
  // Accent cards get a tinted shadow (40% of the accent color) instead of
  // the default ink-tinted --shadow-brutal, so the card reads as "colored"
  // without the shadow going full-opacity accent.
  const shadow = accent
    ? `4px 4px 0px color-mix(in srgb, ${borderColor} 40%, transparent)`
    : 'var(--shadow-brutal)'
  const shadowHover = accent
    ? `6px 6px 0px color-mix(in srgb, ${borderColor} 40%, transparent)`
    : 'var(--shadow-brutal-hover)'

  return (
    <div
      className={[
        'bg-card border-3 transition-all duration-100',
        accent ? 'tilt-card hover:rotate-0' : '',
        lift ? 'card-lift' : '',
        onClick ? 'cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5' : '',
        className,
      ].join(' ')}
      style={{ borderColor, boxShadow: shadow }}
      onMouseEnter={onClick ? (e) => { e.currentTarget.style.boxShadow = shadowHover } : undefined}
      onMouseLeave={onClick ? (e) => { e.currentTarget.style.boxShadow = shadow } : undefined}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
