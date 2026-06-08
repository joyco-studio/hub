'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import type { GameState } from './types'

interface SpaceInvadersUIProps {
  state: GameState
  score: number
  onStart: () => void
  onResume: () => void
}

const MOVE_KEYS: ReadonlyArray<{ desktop: string; mobile: string }> = [
  { desktop: 'W', mobile: '↑' },
  { desktop: 'A', mobile: '←' },
  { desktop: 'S', mobile: '↓' },
  { desktop: 'D', mobile: '→' },
]

export function SpaceInvadersUI({ state, score, onStart, onResume }: SpaceInvadersUIProps): React.ReactElement {
  return (
    <div
      data-slot="space-invaders-controls"
      className="text-muted-foreground border-background flex w-full items-center justify-center border-t-4 font-mono text-xs"
    >
      {state === 'gameOver' ? (
        <div className="flex w-full items-center gap-1 pl-2">
          <span className="flex-1 uppercase">
            Score: <span className="text-foreground font-bold">{score}</span>
          </span>
          <Button onClick={onStart} size="sm" className="h-8 rounded-none text-xs font-medium uppercase">
            Play again
          </Button>
        </div>
      ) : state === 'paused' ? (
        <Button onClick={onResume} size="sm" className="h-8 w-full rounded-none text-xs font-medium uppercase">
          Resume
        </Button>
      ) : state === 'playing' ? (
        <div className="flex h-8 w-full items-center gap-1 px-2">
          <span className="ml-auto flex items-center gap-0.5">
            {MOVE_KEYS.map(({ desktop, mobile }) => (
              <Kbd key={desktop} className="rounded-none text-[10px]">
                <span className="max-md:hidden">{desktop}</span>
                <span className="max-md:inline md:hidden">{mobile}</span>
              </Kbd>
            ))}
            <Kbd className="ml-1 rounded-none text-[10px]">Space</Kbd>
            <Kbd className="rounded-none text-[10px]">Esc</Kbd>
          </span>
        </div>
      ) : (
        <Button onClick={onStart} size="sm" className="h-8 w-full rounded-none text-xs font-medium uppercase">
          Start Game
        </Button>
      )}
    </div>
  )
}
