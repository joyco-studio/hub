'use client'

import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

const THEMES = ['light', 'dark', 'radio', 'terminal'] as const

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="bg-card sticky top-0 z-20 flex items-center gap-2 border-b px-6 py-3">
      <span className="text-muted-foreground mr-2 font-mono text-xs uppercase">
        Theme
      </span>
      {THEMES.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setTheme(t)}
          className={cn(
            'border-border rounded-md border px-3 py-1 font-mono text-xs uppercase transition-colors',
            theme === t
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent'
          )}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
