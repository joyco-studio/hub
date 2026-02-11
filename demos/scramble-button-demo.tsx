'use client'

import * as React from 'react'
import { ScrambleButton } from '@/registry/joyco/blocks/scramble-button'
import { Switch } from '@/components/ui/switch'

function ScrambleButtonDemo() {
  const [scrambled, setScrambled] = React.useState(false)

  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-wrap items-center gap-3">
        <ScrambleButton
          text="Get Started"
          scramble={scrambled}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-4 py-2 text-sm font-medium"
        />
        <ScrambleButton
          text="Learn More"
          scramble={scrambled}
          scrambleDuration={0.8}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-4 py-2 text-sm font-medium"
        />
        <ScrambleButton
          text="Subscribe"
          scramble={scrambled}
          scrambleChars="01"
          scrambleDuration={1}
          className="bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md border px-4 py-2 text-sm font-medium shadow-xs"
        />
      </div>

      {/* Mobile fallback: switch to trigger scramble */}
      <label className="flex items-center gap-3 sm:hidden">
        <Switch checked={scrambled} onCheckedChange={setScrambled} />
        <span className="text-muted-foreground text-sm">Toggle scramble</span>
      </label>
    </div>
  )
}

export default ScrambleButtonDemo
