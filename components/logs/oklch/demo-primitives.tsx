'use client'

import type { CSSProperties, ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'

import { CopyButton } from '@/components/copy-button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface DemoSliderStyle extends CSSProperties {
  '--slider-track'?: string
}

export function ColorDemoFrame({ children }: { children: ReactNode }) {
  return (
    <Card
      data-slot="oklch-demo"
      className="not-prose my-8 gap-0 overflow-hidden py-0"
    >
      {children}
    </Card>
  )
}

export function DemoSlider({
  id,
  label,
  value,
  min,
  max,
  step,
  onValueChange,
  valueLabel,
  track,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  onValueChange: (value: number) => void
  valueLabel: string
  track: string
}) {
  const style: DemoSliderStyle = { '--slider-track': track }

  return (
    <div data-slot="demo-slider" className="grid gap-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span id={`${id}-label`} className="text-muted-foreground">
          {label}
        </span>
        <output
          htmlFor={id}
          className="text-foreground font-mono text-xs tabular-nums"
        >
          {valueLabel}
        </output>
      </div>
      <Slider
        id={id}
        aria-labelledby={`${id}-label`}
        aria-valuetext={valueLabel}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([nextValue]) => onValueChange(nextValue)}
        style={style}
        className={cn(
          '[&_[data-slot=slider-track]]:h-2.5',
          '[&_[data-slot=slider-track]]:[background:var(--slider-track)]',
          '[&_[data-slot=slider-range]]:bg-transparent',
          '[&_[data-slot=slider-thumb]]:h-5 [&_[data-slot=slider-thumb]]:w-2',
          '[&_[data-slot=slider-thumb]]:border-foreground/20'
        )}
      />
    </div>
  )
}

export function ColorValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="group/code hover:bg-accent/50 flex min-w-0 items-center gap-3 px-3 py-1.5 motion-safe:transition-colors">
      <span className="text-muted-foreground w-12 shrink-0 font-mono text-xs">
        {label}
      </span>
      <code
        title={value}
        className="text-foreground min-w-0 flex-1 truncate bg-transparent p-0 font-mono text-xs"
      >
        {value}
      </code>
      <CopyButton
        value={value}
        absolute={false}
        size="icon-sm"
        className="relative size-8 shrink-0"
        aria-label={`Copy ${label} value`}
      >
        {(hasCopied) => (
          <span className="relative grid size-4 place-items-center">
            <Check
              aria-hidden="true"
              strokeWidth={2}
              className={cn(
                'text-mint-green absolute size-4',
                'motion-safe:transition-[opacity,filter,scale] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.2,0,0,1)]',
                hasCopied
                  ? 'blur-0 scale-100 opacity-100'
                  : 'scale-[0.25] opacity-0 blur-[4px]'
              )}
            />
            <Copy
              aria-hidden="true"
              strokeWidth={1.5}
              className={cn(
                'absolute size-4',
                'motion-safe:transition-[opacity,filter,scale] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.2,0,0,1)]',
                hasCopied
                  ? 'scale-[0.25] opacity-0 blur-[4px]'
                  : 'blur-0 scale-100 opacity-100'
              )}
            />
          </span>
        )}
      </CopyButton>
    </div>
  )
}
