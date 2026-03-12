import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ExperimentCardImage } from './experiment-card-image'
import { Badge } from '../ui/badge'

interface ExperimentCardProps extends React.ComponentProps<'a'> {
  slug: string
  title: string
  description?: string
  tags?: string[]
}

export function ExperimentCard({
  slug,
  title,
  description,
  tags,
  className,
  ...props
}: ExperimentCardProps) {
  return (
    <Link
      href={`/lab/${slug}`}
      className={cn(
        'group relative flex flex-col gap-1 overflow-hidden rounded-lg transition-[colors,scale]',
        className
      )}
      {...props}
    >
      <div className="relative h-[200px] w-full overflow-hidden">
        <Badge
          variant="key"
          className="absolute top-3 left-3 z-10 border-none shadow-none"
        >
          Lab
        </Badge>

        <ExperimentCardImage
          slug={slug}
          className="h-full w-full rounded-none border-0"
        />
      </div>

      <div className="bg-card group-hover:bg-accent/50 flex flex-1 flex-col gap-1 px-4 py-3 transition-colors">
        <div className="flex items-start justify-between">
          <span className="font-mono text-card-foreground text-sm font-medium tracking-wide uppercase">
            {title}
          </span>
          <svg
            aria-hidden="true"
            className="h-[1.25em] shrink-0 -rotate-45 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>

        {description && (
          <span className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
            {description}
          </span>
        )}

        {tags && tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
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
      </div>
    </Link>
  )
}
