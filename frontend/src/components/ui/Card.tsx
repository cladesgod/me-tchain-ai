import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-gray-900/50 backdrop-blur-sm border border-gray-800',
      bordered: 'bg-gray-900/50 backdrop-blur-sm border border-gray-800',
      elevated: 'bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-all duration-300',
    }

    return (
      <div
        ref={ref}
        className={cn('rounded-xl p-6', variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export { Card }
