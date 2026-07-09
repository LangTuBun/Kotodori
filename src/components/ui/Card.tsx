interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  accent?: 'yellow' | 'red' | 'green' | 'blue' | null
}

export function Card({ children, className = '', onClick, accent }: CardProps) {
  const accentColors: Record<string, string> = {
    yellow: '#ffe600', red: '#ff2d2d', green: '#00cc66', blue: '#0057ff',
  }
  const borderColor = accent ? accentColors[accent] : '#0a0a0a'

  return (
    <div
      className={[
        'bg-paper border-3 transition-all duration-100',
        'shadow-[4px_4px_0px]',
        onClick ? 'cursor-pointer hover:shadow-[6px_6px_0px] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5' : '',
        className,
      ].join(' ')}
      style={{ borderColor, boxShadow: `4px 4px 0px ${borderColor}` }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
