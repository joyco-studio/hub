'use client'

import { type ReactNode } from 'react'
import { Text } from 'lucide-react'
import { TOCScrollArea } from '@/components/toc'
import { TOCItems } from '@/components/toc/clerk'
import { useLayout } from '@/hooks/use-layout'
import { cn } from '@/lib/utils'

export interface ClerkTOCProps {
  /**
   * Custom content before the TOC title
   */
  header?: ReactNode
  /**
   * Custom content after the TOC items
   */
  footer?: ReactNode
  /**
   * Additional className for the root container
   */
  className?: string
}

export function TOC({ header, footer, className }: ClerkTOCProps) {
  const { layout } = useLayout()

  return (
    <div
      id="nd-toc"
      className={cn(
        'sticky top-0 flex h-screen gap-1 [grid-area:toc] max-xl:hidden',
        className
      )}
    >
      <div className="flex h-full w-(--fd-toc-width) flex-col gap-1">
        <div className="bg-muted p-3 font-mono uppercase">
          {header}
          <h3
            id="toc-title"
            className="text-fd-muted-foreground inline-flex items-center gap-1.5 text-xs"
          >
            <Text className="size-4" />
            <span>On this page</span>
          </h3>
          <TOCScrollArea>
            <TOCItems className="[&_a]:text-xs" />
          </TOCScrollArea>
        </div>
        {footer}
        <div className="bg-muted flex-1" />
      </div>
      {/* Filler panel - only visible at 2xl+ when in fixed layout */}
      <div
        className={cn(
          'bg-muted min-w-aside-width hidden flex-1',
          layout === 'fixed' && '2xl:block'
        )}
      />
    </div>
  )
}
