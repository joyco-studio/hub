import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center border font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden font-mono uppercase tracking-wide',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        muted:
          'border-transparent bg-muted text-muted-foreground [a&]:hover:bg-muted/80',
        accent:
          'border-transparent bg-accent text-accent-foreground [a&]:hover:bg-accent/80',
        card: 'border-transparent bg-card text-card-foreground [a&]:hover:bg-card/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        key: 'bg-accent text-accent-foreground border-2 border-b-4',
      },
      size: {
        default: 'px-2.5 py-1 text-xs',
        sm: 'px-1.5 py-0.5 text-[10px]',
      },
      slicedCorners: {
        true: '[clip-path:polygon(6px_0%,100%_0%,100%_calc(100%-6px),calc(100%-6px)_100%,0%_100%,0%_6px)]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      slicedCorners: true,
    },
  }
)

type BadgeProps = React.ComponentProps<'span'> & {
  asChild?: boolean
} & VariantProps<typeof badgeVariants>

function Badge({
  className,
  variant,
  size,
  slicedCorners,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, slicedCorners }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
export type { BadgeProps }
