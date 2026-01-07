'use client'

import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const separatorVariants = cva('bg-border shrink-0 [--thickness:1px]', {
  variants: {
    orientation: {
      horizontal: 'h-(--thickness) w-full',
      vertical: 'h-full w-(--thickness)',
    },
    brackets: {
      true: 'relative before:absolute before:bg-border after:absolute after:bg-border',
      false: '',
    },
    align: {
      top: '',
      center: '',
      bottom: '',
    },
  },
  compoundVariants: [
    // Horizontal + brackets + alignment
    {
      orientation: 'horizontal',
      brackets: true,
      align: 'center',
      className:
        'before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-3 before:w-(--thickness) after:right-0 after:top-1/2 after:-translate-y-1/2 after:h-3 after:w-(--thickness)',
    },
    {
      orientation: 'horizontal',
      brackets: true,
      align: 'top',
      className:
        'before:left-0 before:top-(--thickness) before:h-3 before:w-(--thickness) after:right-0 after:top-(--thickness) after:h-3 after:w-(--thickness)',
    },
    {
      orientation: 'horizontal',
      brackets: true,
      align: 'bottom',
      className:
        'before:left-0 before:bottom-(--thickness) before:h-3 before:w-(--thickness) after:right-0 after:bottom-(--thickness) after:h-3 after:w-(--thickness)',
    },
    // Vertical + brackets + alignment
    {
      orientation: 'vertical',
      brackets: true,
      align: 'center',
      className:
        'before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-3 before:h-(--thickness) after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-3 after:h-(--thickness)',
    },
    {
      orientation: 'vertical',
      brackets: true,
      align: 'top',
      className:
        'before:top-0 before:left-(--thickness) before:w-3 before:h-(--thickness) after:bottom-0 after:left-(--thickness) after:w-3 after:h-(--thickness)',
    },
    {
      orientation: 'vertical',
      brackets: true,
      align: 'bottom',
      className:
        'before:top-0 before:right-(--thickness) before:w-3 before:h-(--thickness) after:bottom-0 after:right-(--thickness) after:w-3 after:h-(--thickness)',
    },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    brackets: false,
    align: 'center',
  },
})

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  brackets = false,
  align = 'center',
  thickness = 2,
  style,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root> &
  VariantProps<typeof separatorVariants> & {
    thickness?: number
  }) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        separatorVariants({ orientation, brackets, align }),
        className
      )}
      style={
        { '--thickness': `${thickness}px`, ...style } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Separator, separatorVariants }
