'use client'

import { Command } from 'cmdk'
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
  onSelect: (url: string) => void
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

export function SearchResults({ results, query, onSelect }: SearchResultsProps) {
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
    <Command.List className="bg-accent/70 flex max-h-none flex-col overflow-y-auto outline-none">
      {Object.entries(groupedBySection).map(([section, pages]) => {
        const Icon = sectionIcons[section] ?? CubeIcon
        const label = sectionLabels[section] ?? section

        return (
          <Command.Group
            key={section}
            heading={
              <div className="flex items-center gap-2 px-4 py-2.5 text-left text-foreground">
                <Icon className="size-3.5" />
                <span className="font-mono text-xs font-medium tracking-wide uppercase">
                  {label}
                </span>
              </div>
            }
            className="flex flex-col [&_[cmdk-group-heading]]:p-0"
          >
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
                  <Command.Item
                    key={pageUrl}
                    value={pageUrl}
                    onSelect={() => onSelect(pageUrl)}
                    className={cn(
                      'flex cursor-pointer flex-col gap-0.5 py-1.5 pr-4 pl-4 transition-colors',
                      'text-muted-foreground',
                      'data-[selected=true]:text-foreground data-[selected=true]:bg-accent'
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
                  </Command.Item>
                )
              })}
            </div>
          </Command.Group>
        )
      })}
    </Command.List>
  )
}
