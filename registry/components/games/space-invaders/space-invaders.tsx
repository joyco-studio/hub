'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { CANVAS, DEFAULT_CONFIG } from './config'
import { mergeConfig, resolveCssColor, formatScore } from './utils'
import { useSpaceInvaders } from './use-space-invaders'
import { SpaceInvadersUI } from './ui'
import type { ResolvedColors } from './render'
import type { SpaceInvadersConfig, SpaceInvadersProps } from './types'

function resolveColors(config: SpaceInvadersConfig, el: HTMLElement): ResolvedColors {
  const c = config.colors
  return {
    background: resolveCssColor(c.background, el),
    player: resolveCssColor(c.player, el),
    playerBullet: resolveCssColor(c.playerBullet, el),
    enemyBullet: resolveCssColor(c.enemyBullet, el),
    enemy: resolveCssColor(c.enemy, el),
    particle: resolveCssColor(c.particle, el),
    boss: resolveCssColor(c.boss, el),
    bossHit: resolveCssColor(c.bossHit, el),
    exhaust: [
      resolveCssColor(c.exhaust[0], el),
      resolveCssColor(c.exhaust[1], el),
      resolveCssColor(c.exhaust[2], el),
    ],
  }
}

const FALLBACK_COLORS: ResolvedColors = {
  background: '#000',
  player: '#fff',
  playerBullet: '#22c55e',
  enemyBullet: '#ef4444',
  enemy: '#9ca3af',
  particle: '#9ca3af',
  boss: '#dc2626',
  bossHit: '#fff',
  exhaust: ['#fde047', '#fb923c', '#ef4444'],
}

export function SpaceInvaders({
  config: configOverrides,
  showControls = true,
  onScoreChange,
  onStateChange,
  onGameEnd,
  className,
}: SpaceInvadersProps): React.ReactElement {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const colorsRef = React.useRef<ResolvedColors>(FALLBACK_COLORS)
  const [theme, setTheme] = React.useState('')

  const config = React.useMemo<SpaceInvadersConfig>(
    () => mergeConfig(DEFAULT_CONFIG, configOverrides),
    [configOverrides]
  )

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) colorsRef.current = resolveColors(config, canvas)
  }, [config, theme])

  React.useEffect(() => {
    const html = document.documentElement
    setTheme(html.className)
    const observer = new MutationObserver(() => setTheme(html.className))
    observer.observe(html, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const getColors = React.useCallback(() => colorsRef.current, [])

  const { hud, start, togglePause, attachCanvas } = useSpaceInvaders({
    config,
    getColors,
    onScoreChange,
    onStateChange,
    onGameEnd,
  })

  React.useEffect(() => {
    attachCanvas(canvasRef.current)
    return () => attachCanvas(null)
  }, [attachCanvas])

  const showOverlay = hud.phase !== 'playing'

  return (
    <div
      data-slot="space-invaders"
      data-state={hud.phase}
      className={cn('bg-background flex w-full flex-col items-center', className)}
    >
      <div className="bg-muted relative w-full overflow-hidden" style={{ aspectRatio: '3 / 4' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS.width}
          height={CANVAS.height}
          className="block size-full"
          style={{ imageRendering: 'pixelated' }}
          role="img"
          aria-label={`Space Invaders — ${hud.phase === 'playing' ? `score ${hud.score}` : hud.phase}`}
        />

        {hud.phase !== 'idle' && (
          <div className="text-muted-foreground pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-1.5 px-2.5 pt-2 font-mono text-[10px] whitespace-nowrap uppercase">
            <span>
              <span className="text-muted-foreground/40">[ </span>
              <span className="text-foreground">Lives</span> {'▲'.repeat(Math.max(0, hud.lives))}
              <span className="text-muted-foreground/40"> ]</span>
            </span>
            <span>
              <span className="text-muted-foreground/40">[ </span>
              <span className="text-foreground">Score</span> {formatScore(hud.score)}
              <span className="text-muted-foreground/40"> ]</span>
            </span>
            <span>
              <span className="text-muted-foreground/40">[ </span>
              <span className="text-foreground">Lvl</span> {hud.level}
              <span className="text-muted-foreground/40"> ]</span>
            </span>
            <span>
              <span className="text-muted-foreground/40">[ </span>
              <span className="text-foreground">Hi</span> {hud.highScore.toLocaleString()}
              <span className="text-muted-foreground/40"> ]</span>
            </span>
          </div>
        )}

        {showOverlay && (
          <div className="bg-background/85 absolute inset-0 flex flex-col items-center justify-center gap-3">
            {hud.phase === 'idle' &&
              (hud.highScore > 0 ? (
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.35em]">
                    High Score
                  </span>
                  <span className="text-foreground text-3xl tabular-nums tracking-[0.1em]">
                    {hud.highScore.toLocaleString()}
                  </span>
                </div>
              ) : (
                <p className="text-muted-foreground/70 text-xs uppercase tracking-[0.2em]">
                  No highscore record — play now
                </p>
              ))}
            {hud.phase === 'paused' && (
              <p className="text-muted-foreground text-xs uppercase tracking-[0.3em]">Paused</p>
            )}
            {hud.phase === 'gameOver' && (
              <>
                <p className="text-foreground text-lg uppercase tracking-[0.3em]">Game Over</p>
                <p className="text-muted-foreground text-sm">Score {hud.score.toLocaleString()}</p>
              </>
            )}
          </div>
        )}
      </div>

      {showControls && (
        <SpaceInvadersUI state={hud.phase} score={hud.score} onStart={start} onResume={togglePause} />
      )}
    </div>
  )
}
