import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-surface-primary text-white hover:opacity-90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-slate-100',
  ghost: 'hover:bg-slate-100 text-foreground',
  outline: 'border border-border-base bg-white hover:bg-slate-50 text-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-active disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md border border-border-base bg-white px-3 text-sm placeholder:text-content-placeholder focus-visible:outline-none focus-visible:border-border-active focus-visible:ring-2 focus-visible:ring-ring-active',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-xl border border-border-base bg-card text-card-foreground shadow-spatial-card', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pb-0', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-semibold leading-none tracking-tight', className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />
}

type BadgeVariant = 'success' | 'pending' | 'error' | 'neutral' | 'brand'

const badgeVariants: Record<BadgeVariant, string> = {
  success: 'bg-surface-success text-content-success border-border-success',
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  error: 'bg-surface-error text-content-error border-border-error',
  neutral: 'bg-surface-disabled text-content-secondary border-border-base',
  brand: 'bg-surface-primary/10 text-surface-primary border-surface-primary/20',
}

export function Badge({
  variant = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  )
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-content-secondary">{description}</p>}
      </div>
      {children}
    </div>
  )
}