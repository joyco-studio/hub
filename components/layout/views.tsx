import { EyeIcon } from 'lucide-react'

export function PageViews({ views }: { views: number }) {
  return (
    <div className="bg-muted flex flex-col gap-y-3 px-6 py-4">
      <div className="text-foreground flex items-center gap-2">
        <EyeIcon className="size-3" />
        <span className="font-mono text-xs font-medium tracking-wide uppercase">
          Views
        </span>
      </div>
      <div className="text-foreground font-mono text-lg font-semibold tabular-nums">
        {views}
      </div>
    </div>
  )
}
