'use client'

import * as React from 'react'
import { ScrambleButton } from '@/registry/joyco/blocks/scramble-button'
import { Switch } from '@/components/ui/switch'

function ScrambleButtonDemo() {
  const [scrambled, setScrambled] = React.useState(false)

  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-8 overflow-hidden p-8 font-mono">
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <ScrambleButton
          text="GET STARTED"
          scramble={scrambled}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 cursor-pointer rounded-md px-5 py-2 text-sm font-medium tracking-wider uppercase transition-colors"
        />
        <ScrambleButton
          text="LEARN MORE"
          scramble={scrambled}
          scrambleChars="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 cursor-pointer rounded-md px-5 py-2 text-sm font-medium tracking-wider uppercase transition-colors"
        />
        <ScrambleButton
          text="SUBSCRIBE"
          scramble={scrambled}
          scrambleChars="01"
          className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-10 cursor-pointer rounded-md border px-5 py-2 text-sm font-medium tracking-wider uppercase transition-colors"
        />
      </div>

      {/* Mobile fallback: switch to trigger scramble */}
      <label className="flex cursor-pointer items-center gap-3 sm:hidden">
        <Switch checked={scrambled} onCheckedChange={setScrambled} />
        <span className="text-muted-foreground text-xs tracking-wider uppercase">
          Toggle scramble
        </span>
      </label>
    </div>
  )
}

export default ScrambleButtonDemo
