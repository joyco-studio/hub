'use client'

import * as React from 'react'
import { ArrowUpRight } from 'lucide-react'
import FlaskIcon from '@/components/icons/flask'
import { cn } from '@/lib/utils'
import type { RepoContributor } from '@/lib/lab'

type ExperimentTOCProps = {
  title: string
  description: string
  href: string
  tags?: string[]
  repo?: string
  authors?: RepoContributor[]
}

function ContributorAvatar(author: RepoContributor) {
  let avatarSrc
  try {
    const u = new URL(author.avatar_url)
    u.searchParams.set('s', '40')
    avatarSrc = u.toString()
  } catch {
    avatarSrc = author.avatar_url
  }

  return (
    <a
      key={author.login}
      href={author.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:bg-accent focus-visible:ring-ring -mx-1.5 flex items-center gap-2 rounded-sm px-1.5 py-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <img
        src={avatarSrc}
        alt=""
        width={20}
        height={20}
        className="rounded-full"
        loading="lazy"
      />
      <span className="text-foreground text-xs font-medium">
        {author.login}
      </span>
    </a>
  )
}

export function ExperimentTOC({
  title,
  description,
  href,
  tags,
  repo,
  authors,
}: ExperimentTOCProps) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <div
      className={cn(
        'fixed top-0 right-0 z-(--z-toc-popover) flex h-screen items-center max-md:top-(--mobile-header-height) max-md:h-[calc(100dvh-var(--mobile-header-height))]',
        'transition-transform duration-300 ease-in-out',
        !open && 'translate-x-[268px]'
      )}
    >
      <div className="flex">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={
            open ? 'Close experiment details' : 'Open experiment details'
          }
          aria-expanded={open}
          className={cn(
            'bg-muted hover:bg-accent text-muted-foreground flex h-28 w-7 shrink-0 cursor-pointer items-center justify-center self-center border-y border-l transition-colors',
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'
          )}
        >
          <span className="-rotate-90 font-mono text-[10px] font-medium tracking-widest whitespace-nowrap uppercase select-none">
            Details
          </span>
        </button>

        <div className="flex w-[268px] flex-col gap-1">
          <div className="bg-muted flex flex-col gap-4 px-6 py-4">
            <div className="flex items-center gap-1.5">
              <FlaskIcon
                className="text-muted-foreground size-4"
                aria-hidden="true"
              />
              <span className="text-muted-foreground font-mono text-xs font-medium tracking-wide uppercase">
                Experiment
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {description}
              </p>
            </div>
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-accent text-muted-foreground px-2 py-0.5 font-mono text-xs tracking-wide uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {authors && authors.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground font-mono text-[10px] font-medium tracking-wide uppercase">
                  Authors
                </span>
                <div className="flex flex-col gap-1.5">
                  {authors.map(ContributorAvatar)}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-foreground/80 focus-visible:ring-ring inline-flex items-center gap-1.5 font-mono text-xs font-medium tracking-wide uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                Open externally
                <ArrowUpRight className="size-3" aria-hidden="true" />
              </a>
              {repo && (
                <a
                  href={repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-foreground/80 focus-visible:ring-ring inline-flex items-center gap-1.5 font-mono text-xs font-medium tracking-wide uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  View source
                  <ArrowUpRight className="size-3" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
