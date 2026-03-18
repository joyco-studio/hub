import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

interface LabViewToggleProps {
  view: 'canvas' | 'list'
  onToggle: () => void
  className?: string
}

export function LabViewToggle({
  view,
  onToggle,
  className,
}: LabViewToggleProps) {
  return (
    <Button
      type="button"
      aria-label={
        view === 'canvas' ? 'Switch to list view' : 'Switch to canvas view'
      }
      onClick={onToggle}
      className={cn('pointer-events-auto', className)}
      size="icon-lg"
      variant={view === 'canvas' ? 'default' : 'accent'}
    >
      {view === 'canvas' ? (
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
          <line x1="2" y1="4" x2="14" y2="4" />
          <line x1="2" y1="8" x2="14" y2="8" />
          <line x1="2" y1="12" x2="14" y2="12" />
        </svg>
      ) : (
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
      )}
    </Button>
  )
}
