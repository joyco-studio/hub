import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const clusterVariants = cva('flex gap-gap', {
  variants: {
    direction: {
      row: 'flex-row',
      col: 'flex-col',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    wrap: {
      true: 'flex-wrap',
      false: '',
    },
    inline: {
      true: 'inline-flex',
      false: '',
    },
  },
  defaultVariants: {
    direction: 'row',
    align: 'center',
    wrap: false,
    inline: false,
  },
})

type ClusterProps = React.ComponentProps<'div'> & {
  asChild?: boolean
} & VariantProps<typeof clusterVariants>

function Cluster({
  className,
  direction,
  align,
  wrap,
  inline,
  asChild = false,
  ...props
}: ClusterProps) {
  const Comp = asChild ? Slot : 'div'

  return (
    <Comp
      data-slot="cluster"
      className={cn(clusterVariants({ direction, align, wrap, inline }), className)}
      {...props}
    />
  )
}

function Filler({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="cluster-filler"
      role="presentation"
      aria-hidden="true"
      className={cn('min-w-0 flex-1 self-stretch', className)}
      {...props}
    />
  )
}

export { Cluster, Filler, clusterVariants }
export type { ClusterProps }
