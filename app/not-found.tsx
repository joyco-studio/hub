'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  BrickBreaker,
  BrickBreakerCanvas,
  BrickBreakerHUD,
  BrickBreakerScore,
  BrickBreakerHighScore,
  BrickBreakerLives,
  BrickBreakerOverlay,
  BrickBreakerTitle,
  BrickBreakerMessage,
  type Level,
  type BrickDefinition,
} from '@/registry/joyco/blocks/brick-breaker'
import { Button } from '@/components/ui/button'

// Shorthand for level design
const N: BrickDefinition = { type: 'normal' }
const _: null = null

// "404" pattern - 11 columns x 5 rows (compact, clear)
const LEVEL_404: Level = {
  id: 1,
  name: '404',
  speedMultiplier: 0.8,
  bricks: [
    // 4   0   4
    [N, _, N, _, N, N, N, _, N, _, N],
    [N, _, N, _, N, _, N, _, N, _, N],
    [N, N, N, _, N, _, N, _, N, N, N],
    [_, _, N, _, N, _, N, _, _, _, N],
    [_, _, N, _, N, N, N, _, _, _, N],
  ],
}

export default function NotFound() {
  return (
    <div
      className="bg-muted absolute inset-0 z-50 flex flex-col overflow-hidden"
      style={
        {
          '--pattern-fg': 'color-mix(in oklab, var(--border) 50%, transparent)',
          backgroundImage:
            'repeating-linear-gradient(315deg,var(--pattern-fg) 0,var(--pattern-fg) 1px,transparent 0,transparent 50%)',
          backgroundSize: '10px 10px',
        } as React.CSSProperties
      }
    >
      {/* Game fills remaining space */}
      <BrickBreaker
        className="min-h-0 flex-1"
        levels={[LEVEL_404]}
        showFocusRing={false}
        config={{
          colors: {
            background: 'var(--muted)',
            paddle: 'var(--foreground)',
            ball: 'var(--primary)',
            ballTrail: 'var(--primary)',
            text: 'var(--foreground)',
            textMuted: 'var(--muted-foreground)',
            bricks: {
              normal: 'var(--foreground)',
              strong: 'var(--foreground)',
              metal: 'var(--foreground)',
              indestructible: 'var(--muted-foreground)',
            },
          },
          layout: {
            brickGap: 2,
            brickBorderRadius: 0,
            paddleBorderRadius: 0,
            ballStyle: 'round',
            topPadding: 0.08,
          },
          effects: {
            showTrail: false,
          },
          gameplay: {
            startingLives: 5,
          },
        }}
      >
        {/* HUD first - shrink-0 keeps it above canvas */}
        <BrickBreakerHUD className="p-2 font-mono text-[10px] sm:p-4 sm:text-xs">
          <div className="flex items-center gap-2 sm:gap-3">
            <BrickBreakerScore
              showCombo={false}
              className="text-muted-foreground"
            />
            <BrickBreakerLives className="*:bg-foreground/60 *:size-1 sm:*:size-1.5" />
          </div>
          <BrickBreakerHighScore label="HI" className="text-muted-foreground" />
        </BrickBreakerHUD>

        {/* Canvas slot - takes remaining space */}
        <BrickBreakerCanvas />

        {/* Overlay renders inside canvas area */}
        <BrickBreakerOverlay className="bg-muted/50">
          <BrickBreakerTitle className="text-foreground font-mono text-lg font-bold tracking-widest uppercase" />
          <BrickBreakerMessage className="text-muted-foreground font-mono text-xs" />
        </BrickBreakerOverlay>
      </BrickBreaker>

      {/* Full-width CTA at bottom */}
      <div className="relative shrink-0">
        <Button asChild className="w-full" size="lg">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  )
}
