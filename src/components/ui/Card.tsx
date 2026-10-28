interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  accent?: 'yellow' | 'red' | 'green' | 'blue' | null
  /** glass hover: lifts, deepens, presses in (.glass-lift) */
  lift?: boolean
}

const ACCENT_COLORS: Record<string, string> = {
  yellow: 'var(--color-yellow)',
  red: 'var(--color-red)',
  green: 'var(--color-green)',
  blue: 'var(--color-blue)',
}

export function Card({ children, className = '', onClick, accent, lift = false }: CardProps) {
  // Glass surface everywhere; the hover lift only when the card is actually
  // clickable. Accent cards keep a soft glow in their color.
  const tint = accent ? ACCENT_COLORS[accent] : null
  return (
    <div
      className={[
        'glass-card',
        lift || onClick ? 'glass-lift' : '',
        className,
      ].join(' ')}
      style={tint ? {
        borderColor: `color-mix(in srgb, ${tint} 30%, transparent)`,
        boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.6), 0 6px 20px color-mix(in srgb, ${tint} 16%, transparent)`,
      } : undefined}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
