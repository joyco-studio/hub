'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import mermaid from 'mermaid'

function getMermaidTheme(theme: string | undefined) {
  switch (theme) {
    case 'dark':
    case 'terminal':
      return 'dark'
    default:
      return 'default'
  }
}

export function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const el = ref.current
    if (!el) return

    const mermaidTheme = getMermaidTheme(resolvedTheme)
    const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`

    mermaid.initialize({
      startOnLoad: false,
      theme: mermaidTheme,
      securityLevel: 'loose',
    })

    mermaid
      .render(id, chart)
      .then(({ svg }) => {
        el.innerHTML = svg
      })
      .catch((err) => {
        console.error('[Mermaid] Failed to render chart:', err)
        console.error('[Mermaid] Chart source:', chart)
      })
  }, [chart, resolvedTheme, mounted])

  if (!mounted) {
    return <div className="my-6 flex justify-center" />
  }

  return (
    <div
      ref={ref}
      className="my-6 flex justify-center [&_svg]:max-w-full"
    />
  )
}
