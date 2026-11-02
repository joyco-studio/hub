'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import FlaskIcon from '@/components/icons/flask'
import { cn } from '@/lib/utils'
import {
  LAB_TAG_PARAM,
  buildLabTagSearch,
  parseLabTagParam,
} from '@/lib/lab-tags'

export function useActiveLabTags() {
  const searchParams = useSearchParams()
  return parseLabTagParam(searchParams.getAll(LAB_TAG_PARAM))
}

function useLabTagHref() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  return (nextTags: string[]) =>
    `${pathname}${buildLabTagSearch(new URLSearchParams(searchParams), nextTags)}`
}

export function LabTagFilter({ className }: { className?: string }) {
  const activeTags = useActiveLabTags()
  const buildHref = useLabTagHref()

  if (activeTags.length === 0) return null

  return (
    <div
      aria-live="polite"
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      <span className="text-muted-foreground font-mono text-xs tracking-wide uppercase">
        Filtered by
      </span>
      {activeTags.map((tag) => (
        <span
          key={tag}
          className="bg-accent text-foreground inline-flex min-w-0 items-center gap-1 py-0.5 pr-0.5 pl-2 font-mono text-xs tracking-wide uppercase"
        >
          <span className="max-w-[24ch] truncate">{tag}</span>
          <Link
            href={buildHref(activeTags.filter((activeTag) => activeTag !== tag))}
            scroll={false}
            aria-label={`Remove ${tag} filter`}
            className="hover:bg-foreground/10 focus-visible:ring-ring inline-flex size-5 items-center justify-center rounded-sm outline-none focus-visible:ring-2"
          >
            <X aria-hidden="true" className="size-3" />
          </Link>
        </span>
      ))}
    </div>
  )
}

export function LabTagFilterEmpty() {
  const activeTags = useActiveLabTags()
  const buildHref = useLabTagHref()

  return (
    <div
      data-slot="layout-main"
      className="text-muted-foreground flex h-full min-h-[60dvh] flex-col items-center justify-center gap-3 px-content-sides text-center [grid-area:main]"
    >
      <FlaskIcon aria-hidden="true" className="size-8" />
      <p className="font-mono text-sm tracking-wide break-words uppercase">
        No experiments tagged {activeTags.join(', ')}
      </p>
      <Link
        href={buildHref([])}
        className="text-foreground hover:text-foreground/70 focus-visible:ring-ring rounded-sm text-sm underline underline-offset-4 outline-none focus-visible:ring-2"
      >
        Show all experiments
      </Link>
    </div>
  )
}
