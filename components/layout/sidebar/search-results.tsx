'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import CubeIcon from '@/components/icons/3d-cube'
import TerminalWithCursorIcon from '@/components/icons/terminal-w-cursor'
import FileIcon from '@/components/icons/file'

export type SearchResult = {
  id: string
  url: string
  type: 'page' | 'heading' | 'text'
  content: string
}

type SearchResultsProps = {
  results: SearchResult[]
  query: string
}

const sectionIcons: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  components: CubeIcon,
  toolbox: TerminalWithCursorIcon,
  logs: FileIcon,
}

const sectionLabels: Record<string, string> = {
  components: 'Components',
  toolbox: 'Toolbox',
  logs: 'Logs',
}

/* -------------------------------------------------------------------------------------------------
 * HighlightedText
 * -------------------------------------------------------------------------------------------------*/

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi'
  )
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-primary text-primary-foreground px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

/* -------------------------------------------------------------------------------------------------
 * SearchResults
 * -------------------------------------------------------------------------------------------------*/

export function SearchResults({ results, query }: SearchResultsProps) {
  if (results.length === 0) return null

  // Group results by section (first part of URL path)
  const groupedBySection = results.reduce(
    (acc, result) => {
      const pageUrl = result.url.split('#')[0]
      // Extract section from URL like /components/button -> components
      const section = pageUrl.split('/')[1] || 'other'

      if (!acc[section]) {
        acc[section] = {}
      }
      if (!acc[section][pageUrl]) {
        acc[section][pageUrl] = []
      }
      acc[section][pageUrl].push(result)
      return acc
    },
    {} as Record<string, Record<string, SearchResult[]>>
  )

  return (
    <nav className="bg-accent/70 flex flex-col overflow-y-auto">
      {Object.entries(groupedBySection).map(([section, pages]) => {
        const Icon = sectionIcons[section] ?? CubeIcon
        const label = sectionLabels[section] ?? section

        return (
          <div key={section} className="flex flex-col">
            {/* Section header */}
            <div
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-left',
                'text-foreground'
              )}
            >
              <Icon className="size-3.5" />
              <span className="font-mono text-xs font-medium tracking-wide uppercase">
                {label}
              </span>
            </div>

            {/* Nested results */}
            <div className="border-border ml-4 flex flex-col border-l">
              {Object.entries(pages).map(([pageUrl, pageResults]) => {
                const pageResult = pageResults.find((r) => r.type === 'page')
                const title =
                  pageResult?.content ?? pageResults[0]?.content ?? pageUrl
                const contentPreview = pageResults
                  .filter((r) => r.type !== 'page')
                  .map((r) => r.content)
                  .join(' ')
                  .trim()

                return (
                  <Link
                    key={pageUrl}
                    href={pageUrl}
                    className={cn(
                      'flex flex-col gap-0.5 py-1.5 pr-4 pl-4 transition-colors',
                      'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <span className="font-mono text-sm tracking-wide uppercase">
                      <HighlightedText text={title} query={query} />
                    </span>
                    {contentPreview && (
                      <span className="text-muted-foreground/70 line-clamp-2 text-xs normal-case">
                        <HighlightedText text={contentPreview} query={query} />
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}
    </nav>
  )
}
