interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  accent?: 'yellow' | 'red' | 'green' | 'blue' | null
  /** float-up hover with a deepening soft shadow (.card-lift) */
  lift?: boolean
}

const ACCENT_COLORS: Record<string, string> = {
  yellow: 'var(--color-yellow)',
  red: 'var(--color-red)',
  green: 'var(--color-green)',
  blue: 'var(--color-blue)',
}

export function Card({ children, className = '', onClick, accent, lift = false }: CardProps) {
  // Accent cards get a hairline in their color plus a soft glow tinted by
  // it, so the card reads as "colored" without any heavy edge.
  const tint = accent ? ACCENT_COLORS[accent] : null
  const borderColor = tint ? `color-mix(in srgb, ${tint} 35%, transparent)` : 'var(--tori-hairline)'
  const shadow = tint
    ? `0 1px 2px rgb(0 0 0 / 0.04), 0 6px 20px color-mix(in srgb, ${tint} 14%, transparent)`
    : 'var(--shadow-brutal)'
  const shadowHover = tint
    ? `0 2px 4px rgb(0 0 0 / 0.05), 0 14px 36px color-mix(in srgb, ${tint} 22%, transparent)`
    : 'var(--shadow-brutal-hover)'

  return (
    <div
      className={[
        'bg-card border-3 transition-[border-color,background-color,box-shadow,transform] duration-300 ease-[var(--ease-out)]',
        lift ? 'card-lift' : 'card-shadow',
        onClick ? 'card-shadow-hover cursor-pointer active:scale-[0.98] active:duration-100' : '',
        className,
      ].join(' ')}
      style={{
        borderColor,
        '--card-shadow': shadow,
        '--card-shadow-hover': shadowHover,
        // .card-lift owns its own shadow states; keep the inline one it always had.
        ...(lift ? { boxShadow: shadow } : {}),
      } as React.CSSProperties}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
