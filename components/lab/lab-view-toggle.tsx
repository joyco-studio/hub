import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

interface LabViewToggleProps {
  view: 'canvas' | 'list'
  onToggle: () => void
  className?: string
}

function GridIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </svg>
  )
}

function InfinityIcon() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
      className="size-6 shrink-0"
    >
      <path d="M3.5 6H6.5L9.5 10H12.5V6H9.5L6.5 10H3.5Z" />
    </svg>
  )
}

export function LabViewToggle({
  view,
  onToggle,
  className,
}: LabViewToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="View mode"
      className={cn(
        'border-border pointer-events-auto inline-flex rounded-md border',
        className
      )}
    >
      <Button
        type="button"
        role="radio"
        aria-checked={view === 'list'}
        aria-label="List view"
        onClick={view === 'canvas' ? onToggle : undefined}
        variant={view === 'list' ? 'muted' : 'accent'}
        size="icon-lg"
      >
        <GridIcon />
      </Button>
      <Button
        type="button"
        role="radio"
        aria-checked={view === 'canvas'}
        aria-label="Canvas view"
        onClick={view === 'list' ? onToggle : undefined}
        variant={view === 'list' ? 'accent' : 'muted'}
        size="icon-lg"
      >
        <InfinityIcon />
      </Button>
    </div>
  )
}
