'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export function ImageCols({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'not-prose grid gap-4 md:grid-cols-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
