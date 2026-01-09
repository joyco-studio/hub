'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { AsideButton } from './nav-aside'

/* -------------------------------------------------------------------------------------------------
 * Theme configuration
 * -------------------------------------------------------------------------------------------------*/

type ThemeConfig = {
  name: string
  label: string
}

export const themes: ThemeConfig[] = [
  { name: 'light', label: 'Light' },
  { name: 'dark', label: 'Dark' },
  { name: 'radio', label: 'Radio' },
  { name: 'terminal', label: 'Terminal' },
]

/* -------------------------------------------------------------------------------------------------
 * ThemePreview - Shows a visual representation of theme colors
 * Uses CSS variables so it works on server and shows current theme automatically
 * -------------------------------------------------------------------------------------------------*/

type ThemePreviewProps = {
  themeClass?: string
  className?: string
}

export const ThemePreview = ({ themeClass, className }: ThemePreviewProps) => (
  <div
    data-slot="theme-preview"
    className={cn(
      'bg-border grid rotate-45 grid-cols-2 gap-px p-px',
      className
    )}
  >
    {['bg-primary', 'bg-secondary', 'bg-foreground', 'bg-background'].map(
      (cls) => (
        <div key={cls} className={cn(cls, themeClass, 'size-2.5')} />
      )
    )}
  </div>
)

/* -------------------------------------------------------------------------------------------------
 * ThemeToggle - Opens/closes a menu of available themes
 * -------------------------------------------------------------------------------------------------*/

export const ThemeToggle = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Close on click outside
  React.useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1">
      {/* Theme options - shown when open */}
      {isOpen && <ThemeOptions onSelect={() => setIsOpen(false)} />}

      {/* Current theme toggle button - no hydration needed */}
      <AsideButton onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <span className="font-mono text-xs uppercase">Close</span>
        ) : (
          <ThemePreview />
        )}
        {!isOpen && <span className="sr-only">Theme</span>}
      </AsideButton>
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * ThemeOptions - Client-only theme selection buttons
 * -------------------------------------------------------------------------------------------------*/

function ThemeOptions({ onSelect }: { onSelect: () => void }) {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col gap-1">
      {themes.map((t) => (
        <AsideButton
          key={t.name}
          tooltip={t.label}
          onClick={() => {
            setTheme(t.name)
            onSelect()
          }}
          aria-label={t.label}
          className={cn({ 'bg-accent **:data-[slot=theme-preview]:bg-foreground/60': theme === t.name })}
        >
          <ThemePreview themeClass={t.name} />
          <span className="sr-only">{t.label}</span>
        </AsideButton>
      ))}
    </div>
  )
}
