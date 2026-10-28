import { type ButtonHTMLAttributes, forwardRef } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'yellow' | 'red' | 'green' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const variants: Record<string, string> = {
  primary:   'bg-accent text-accent-fg border-transparent hover:brightness-110',
  secondary: 'bg-card text-ink border-[var(--tori-hairline)] shadow-[var(--shadow-brutal)] hover:bg-surface',
  yellow:    'bg-yellow text-black/85 border-transparent hover:brightness-110',
  red:       'bg-red text-white border-transparent hover:brightness-110',
  green:     'bg-green text-white border-transparent hover:brightness-110',
  ghost:     'bg-transparent text-accent border-transparent hover:bg-accent/10',
}

const sizes: Record<string, string> = {
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-[15px]',
  lg: 'px-7 py-3.5 text-[17px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={[
          'inline-flex items-center justify-center gap-2',
          'border rounded-full',
          'font-semibold tracking-[-0.01em]',
          // Press lands on pointer-down (scale + dim) and eases back out.
          'transition-[color,background-color,border-color,box-shadow,transform,opacity,filter] duration-200 ease-[var(--ease-out)]',
          'active:scale-[0.97] active:opacity-85 active:duration-75',
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
