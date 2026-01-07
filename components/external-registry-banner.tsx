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
        'not-prose bg-card my-6 mb-6 flex flex-col gap-4 p-4 pl-2.5 first:mt-0 last:mb-0 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="bg-foreground/10 text-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          {icon || <ExternalLink className="h-5 w-5" />}
        </div>
        <div>
          <p className="text-foreground text-sm font-medium">
            External Component
          </p>
          <p className="text-muted-foreground text-sm text-pretty">
            This component is provided by{' '}
            <a
              className="text-foreground font-medium underline"
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
