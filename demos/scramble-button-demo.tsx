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
          variant="default"
        />
        <ScrambleButton
          text="LEARN MORE"
          scramble={scrambled}
          chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
          variant="secondary"
        />
        <ScrambleButton
          text="SUBSCRIBE"
          scramble={scrambled}
          chars="01"
          variant="outline"
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
