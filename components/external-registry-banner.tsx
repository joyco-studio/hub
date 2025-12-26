import Link from 'next/link'
import { ArrowUpRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ExternalRegistryBannerProps {
  name: string
  url: string
  className?: string
}

export function ExternalRegistryBanner({
  name,
  url,
  className,
}: ExternalRegistryBannerProps) {
  return (
    <div
      className={cn(
        'not-prose bg-fd-muted/50 border-fd-border mb-6 flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="bg-fd-primary/10 text-fd-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <ExternalLink className="h-5 w-5" />
        </div>
        <div>
          <p className="text-fd-foreground text-sm font-medium">
            External Component
          </p>
          <p className="text-fd-muted-foreground text-sm">
            This component is provided by{' '}
            <span className="text-fd-foreground font-medium">{name}</span>. View
            the original documentation for installation instructions and full
            details.
          </p>
        </div>
      </div>
      <Button asChild className="shrink-0">
        <Link href={url} target="_blank" rel="noopener noreferrer">
          View on {name}
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}
