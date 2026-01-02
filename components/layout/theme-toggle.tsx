'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Button } from '../ui/button'

export const ThemePreview = () => (
  <div className="flex flex-col items-center">
    <div className="bg-primary size-3 rounded-full" />
    <div className="flex">
      <div className="bg-foreground size-3 rounded-full" />
      <div className="bg-background size-3 rounded-full" />
    </div>
  </div>
)

export const ThemeToggle = () => {
  const [mounted, setMounted] = React.useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <Button
        variant="muted"
        size="icon"
        className="bg-muted size-aside-width"
        disabled
      />
    )
  }

  return (
    <Button
      variant="muted"
      size="icon"
      className="bg-muted size-aside-width hover:brightness-95"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      <ThemePreview />
      <span className="sr-only">
        {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
      </span>
    </Button>
  )
}
