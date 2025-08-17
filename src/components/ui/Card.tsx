import { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, padding = 'md', children, ...props }, ref) => {
    const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200'
    
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }
    
    const hoverClasses = hover ? 'transition-all duration-200 hover:shadow-md hover:border-gray-300 cursor-pointer' : ''

    return (
      <div
        ref={ref}
        className={clsx(
          baseClasses,
          paddingClasses[padding],
          hoverClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card