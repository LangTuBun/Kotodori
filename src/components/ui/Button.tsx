import { type ButtonHTMLAttributes, forwardRef } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'yellow' | 'red' | 'green' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const variants: Record<string, string> = {
  primary:   'bg-ink text-paper hover:bg-ink',
  secondary: 'bg-paper text-ink',
  yellow:    'bg-yellow text-ink',
  red:       'bg-red text-paper',
  green:     'bg-green text-paper',
  ghost:     'bg-transparent text-ink border-transparent shadow-none hover:bg-surface',
}

const sizes: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={[
          'inline-flex items-center justify-center gap-2',
          'border-3 border-ink',
          'font-mono font-bold uppercase tracking-wider',
          'shadow-[3px_3px_0px_var(--color-ink)]',
          'transition-all duration-100',
          'hover:shadow-[5px_5px_0px_var(--color-ink)] hover:-translate-x-0.5 hover:-translate-y-0.5',
          'active:shadow-none active:translate-x-0.5 active:translate-y-0.5',
          'cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className,
        ].join(' ')}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
