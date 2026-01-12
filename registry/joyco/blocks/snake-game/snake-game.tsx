'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import type {
  SnakeGameProps,
  SnakeGameConfig,
  CanvasDimensions,
  GameSnapshot,
  Direction,
} from './types'
import { DEFAULT_CONFIG, KEY_BINDINGS, GAME_CONSTANTS } from './config'
import { useSnakeGame } from './use-snake-game'
import { mergeConfig, resolveCssColor } from './utils'

/**
 * Render game to canvas
 */
function renderGame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  snapshot: GameSnapshot,
  config: SnakeGameConfig,
  dimensions: CanvasDimensions
): void {
  const { size, cellSize, dpr } = dimensions

  // Clear canvas
  ctx.clearRect(0, 0, size * dpr, size * dpr)

  // Reset transform and scale for DPR
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.scale(dpr, dpr)

  // Disable image smoothing for crisp pixels
  ctx.imageSmoothingEnabled = false

  // Resolve colors
  const snakeColor = resolveCssColor(config.colors.snake, canvas)
  const foodColor = resolveCssColor(config.colors.food, canvas)

  // Use integer cell size for crisp rendering
  const cell = Math.floor(cellSize)

  // Draw snake
  ctx.fillStyle = snakeColor
  snapshot.snake.segments.forEach((segment) => {
    ctx.fillRect(segment.x * cell, segment.y * cell, cell, cell)
  })

  // Draw food
  ctx.fillStyle = foodColor
  ctx.fillRect(
    snapshot.food.position.x * cell,
    snapshot.food.position.y * cell,
    cell,
    cell
  )
}

/**
 * Snake Game Component
 *
 * A minimal, themeable snake game that uses shadcn CSS variables
 * for automatic light/dark theme support.
 *
 * @example
 * ```tsx
 * <SnakeGame
 *   config={{ grid: { size: 15 } }}
 *   onGameEnd={({ score }) => console.log('Game over!', score)}
 *   className="w-full"
 * />
 * ```
 */
export function SnakeGame({
  config: configOverrides,
  onGameEnd,
  onScoreChange,
  onStateChange,
  className,
  showControls = true,
  showHighscores = true,
}: SnakeGameProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = React.useState<CanvasDimensions>({
    size: 180,
    cellSize: 9,
    dpr: 1,
  })
  const [theme, setTheme] = React.useState('')

  // Merge config with defaults
  const config = React.useMemo<SnakeGameConfig>(
    () => mergeConfig(DEFAULT_CONFIG, configOverrides),
    [configOverrides]
  )

  // Use game hook
  const {
    gameState,
    snapshot,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    setDirection,
  } = useSnakeGame({
    config,
    onGameEnd,
    onScoreChange,
    onStateChange,
  })

  // Handle responsive sizing
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateSize = () => {
      const rect = container.getBoundingClientRect()
      // Round down to nearest multiple of grid size for clean pixels
      const size =
        Math.floor(rect.width / config.grid.size) * config.grid.size ||
        config.grid.size * 9
      const cellSize = size / config.grid.size
      const dpr = window.devicePixelRatio || 1

      setDimensions({ size, cellSize, dpr })
    }

    updateSize()

    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [config.grid.size])

  // Listen for theme changes
  React.useEffect(() => {
    const html = document.documentElement
    setTheme(html.className)

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          setTheme(html.className)
        }
      }
    })

    observer.observe(html, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Render game
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size for DPR
    canvas.width = dimensions.size * dimensions.dpr
    canvas.height = dimensions.size * dimensions.dpr

    renderGame(ctx, canvas, snapshot, config, dimensions)
  }, [snapshot, config, dimensions, theme])

  // Keyboard controls
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key
      const code = e.code

      if (gameState === 'playing') {
        let newDirection: Direction | null = null

        if (KEY_BINDINGS.UP.includes(key) || KEY_BINDINGS.UP.includes(code)) {
          newDirection = 'UP'
        } else if (
          KEY_BINDINGS.DOWN.includes(key) ||
          KEY_BINDINGS.DOWN.includes(code)
        ) {
          newDirection = 'DOWN'
        } else if (
          KEY_BINDINGS.LEFT.includes(key) ||
          KEY_BINDINGS.LEFT.includes(code)
        ) {
          newDirection = 'LEFT'
        } else if (
          KEY_BINDINGS.RIGHT.includes(key) ||
          KEY_BINDINGS.RIGHT.includes(code)
        ) {
          newDirection = 'RIGHT'
        }

        if (newDirection) {
          setDirection(newDirection)
          e.preventDefault()
        }

        if (
          KEY_BINDINGS.PAUSE.includes(key) ||
          KEY_BINDINGS.PAUSE.includes(code)
        ) {
          pauseGame()
          e.preventDefault()
        }
      } else if (gameState === 'paused') {
        if (
          KEY_BINDINGS.PAUSE.includes(key) ||
          KEY_BINDINGS.PAUSE.includes(code) ||
          KEY_BINDINGS.START.includes(key) ||
          KEY_BINDINGS.START.includes(code)
        ) {
          resumeGame()
          e.preventDefault()
        }
      } else if (gameState === 'idle' || gameState === 'gameOver') {
        if (
          KEY_BINDINGS.START.includes(key) ||
          KEY_BINDINGS.START.includes(code)
        ) {
          startGame()
          e.preventDefault()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, setDirection, startGame, pauseGame, resumeGame])

  // Touch/swipe controls
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let touchStart: { x: number; y: number } | null = null

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStart = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart || gameState !== 'playing') return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStart.x
      const deltaY = touch.clientY - touchStart.y

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > GAME_CONSTANTS.MIN_SWIPE_DISTANCE) {
          setDirection('RIGHT')
        } else if (deltaX < -GAME_CONSTANTS.MIN_SWIPE_DISTANCE) {
          setDirection('LEFT')
        }
      } else {
        // Vertical swipe
        if (deltaY > GAME_CONSTANTS.MIN_SWIPE_DISTANCE) {
          setDirection('DOWN')
        } else if (deltaY < -GAME_CONSTANTS.MIN_SWIPE_DISTANCE) {
          setDirection('UP')
        }
      }

      touchStart = null
    }

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [gameState, setDirection])

  const handlePlayClick = () => {
    if (gameState === 'idle' || gameState === 'gameOver') {
      startGame()
    }
  }

  return (
    <div
      data-slot="snake-game"
      data-state={gameState}
      className={cn('bg-background flex w-full flex-col items-center', className)}
    >
      {/* Game Canvas */}
      <div
        ref={containerRef}
        data-slot="snake-game-canvas"
        className="bg-muted aspect-square w-full"
      >
        <canvas
          ref={canvasRef}
          style={{ width: dimensions.size, height: dimensions.size }}
          className="bg-muted size-full"
          role="img"
          aria-label={`Snake game - ${gameState === 'playing' ? `Score: ${snapshot.score}` : gameState}`}
        />
      </div>

      {/* Controls Bar */}
      {showControls && (
        <div
          data-slot="snake-game-controls"
          className="text-muted-foreground border-background flex w-full items-center justify-center border-t-4 font-mono text-xs"
        >
          {gameState === 'gameOver' ? (
            <div className="flex w-full items-center gap-1 pl-2">
              <span className="flex-1 uppercase">
                <span className="font-bold">F*ck!</span> Score:{' '}
                <span className="text-foreground font-bold">
                  {snapshot.score}
                </span>
              </span>
              <Button
                onClick={handlePlayClick}
                size="sm"
                className="h-8 rounded-none text-xs font-medium uppercase"
              >
                Play again
              </Button>
            </div>
          ) : gameState === 'playing' ? (
            <div className="flex w-full items-center gap-1">
              <div className="flex flex-1 px-3 whitespace-pre">
                Score:
                <span className="text-foreground font-bold">
                  {' '}
                  {snapshot.score}
                </span>
              </div>
              <span className="flex h-8 w-full shrink items-center pl-2">
                <div className="ml-auto flex gap-0.5">
                  {[
                    { desktop: 'W', mobile: '↑' },
                    { desktop: 'A', mobile: '←' },
                    { desktop: 'S', mobile: '↓' },
                    { desktop: 'D', mobile: '→' },
                  ].map(({ desktop, mobile }) => (
                    <Kbd key={desktop} className="rounded-none text-[10px]">
                      <span className="max-md:hidden">{desktop}</span>
                      <span className="md:hidden">{mobile}</span>
                    </Kbd>
                  ))}
                </div>
              </span>
            </div>
          ) : gameState === 'paused' ? (
            <Button
              onClick={resumeGame}
              size="sm"
              className="h-8 w-full rounded-none text-xs font-medium uppercase"
            >
              Resume
            </Button>
          ) : (
            <Button
              onClick={handlePlayClick}
              size="sm"
              className="h-8 w-full rounded-none text-xs font-medium uppercase"
            >
              Play Snake
            </Button>
          )}
        </div>
      )}

      {/* High Scores */}
      {showHighscores && snapshot.highscores.length > 0 && (
        <div
          data-slot="snake-game-highscores"
          className="border-background bg-accent/10 flex w-full flex-col border-t-4 px-3 py-2"
        >
          <span className="text-muted-foreground/60 mb-1 text-[10px] uppercase">
            Highscores
          </span>
          {snapshot.highscores.map((entry, i) => (
            <div
              key={`${entry.score}-${entry.date}-${i}`}
              className="text-muted-foreground flex items-center justify-between text-xs"
            >
              <span>
                <span className="text-foreground font-bold">{entry.score}</span>{' '}
                pts
              </span>
              <span className="text-muted-foreground/60">{entry.date}</span>
            </div>
          ))}
        </div>
      )}

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {gameState === 'gameOver' &&
          `Game over. Final score: ${snapshot.score}`}
      </div>
    </div>
  )
}

