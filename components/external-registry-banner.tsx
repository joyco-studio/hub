import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ExternalRegistryBannerProps {
  name: string
  registryUrl: string
  componentUrl: string
  className?: string
  icon?: React.ReactNode
}

export function ExternalRegistryBanner({
  name,
  registryUrl,
  componentUrl,
  className,
  icon,
}: ExternalRegistryBannerProps) {
  return (
    <div
      className={cn(
        'not-prose bg-muted/50 border-border mb-6 flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          {icon || <ExternalLink className="h-5 w-5" />}
        </div>
        <div>
          <p className="text-foreground text-sm font-medium">
            External Component
          </p>
          <p className="text-muted-foreground text-pretty text-sm">
            This component is provided by{' '}
            <a
              className="text-foreground underline font-medium"
              href={registryUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {name}
            </a>
            . View the{' '}
            <a
              className="text-foreground underline"
              href={componentUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              original documentation
            </a>{' '}
            for full details.
          </p>
        </div>
      </div>
    </div>
  )
}
