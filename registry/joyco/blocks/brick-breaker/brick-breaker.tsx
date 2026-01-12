'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type {
  BrickBreakerProps,
  BrickBreakerConfig,
  CanvasDimensions,
  GameSnapshot,
  Brick,
  BrickType,
} from './types'
import {
  DEFAULT_CONFIG,
  GAME_CONSTANTS,
  KEY_BINDINGS,
  BRICK_VISUALS,
} from './config'
import { DEFAULT_LEVELS } from './levels'
import { useBrickBreaker } from './use-brick-breaker'
import { mergeConfig, resolveCssColor } from './utils'
import { BrickBreakerUIProvider, BrickBreakerDefaultUI } from './ui'

/**
 * Draw rounded rectangle
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
  ctx.fill()
}

/**
 * Draw brick with type-specific patterns
 */
function drawBrick(
  ctx: CanvasRenderingContext2D,
  brick: Brick,
  baseColor: string,
  borderRadius: number
): void {
  const { x, y, width, height } = brick.bounds
  const visual = BRICK_VISUALS[brick.type]

  ctx.globalAlpha = visual.opacity

  // Health-based opacity for damaged bricks
  if (brick.maxHealth > 1 && brick.health < brick.maxHealth) {
    const healthRatio = brick.health / brick.maxHealth
    ctx.globalAlpha *= 0.5 + healthRatio * 0.5
  }

  ctx.fillStyle = baseColor
  drawRoundedRect(ctx, x, y, width, height, borderRadius)

  // Draw pattern overlay for special bricks
  if (visual.pattern && brick.type !== 'normal') {
    ctx.globalAlpha = 0.15

    if (visual.pattern === 'diagonal') {
      // Strong brick: diagonal lines
      ctx.strokeStyle = baseColor
      ctx.lineWidth = 1
      const step = 6
      for (let i = -height; i < width + height; i += step) {
        ctx.beginPath()
        ctx.moveTo(x + i, y)
        ctx.lineTo(x + i + height, y + height)
        ctx.stroke()
      }
    } else if (visual.pattern === 'cross') {
      // Metal brick: cross pattern
      ctx.strokeStyle = baseColor
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x + width * 0.2, y + height * 0.5)
      ctx.lineTo(x + width * 0.8, y + height * 0.5)
      ctx.moveTo(x + width * 0.5, y + height * 0.2)
      ctx.lineTo(x + width * 0.5, y + height * 0.8)
      ctx.stroke()
    }
  }

  ctx.globalAlpha = 1
}

/**
 * Render game to canvas
 */
function renderGame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  snapshot: GameSnapshot,
  config: BrickBreakerConfig,
  dimensions: CanvasDimensions
): void {
  const { width, height, dpr } = dimensions

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, width, height)

  // Resolve colors
  const bgColor = resolveCssColor(config.colors.background, canvas)
  const paddleColor = resolveCssColor(config.colors.paddle, canvas)
  const ballColor = resolveCssColor(config.colors.ball, canvas)
  const trailColor = resolveCssColor(config.colors.ballTrail, canvas)
  const textColor = resolveCssColor(config.colors.text, canvas)
  const textMutedColor = resolveCssColor(config.colors.textMuted, canvas)

  const brickColors: Record<BrickType, string> = {
    normal: resolveCssColor(config.colors.bricks.normal, canvas),
    strong: resolveCssColor(config.colors.bricks.strong, canvas),
    metal: resolveCssColor(config.colors.bricks.metal, canvas),
    indestructible: resolveCssColor(
      config.colors.bricks.indestructible,
      canvas
    ),
  }

  // Background
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, width, height)

  // Draw bricks
  const now = Date.now()
  for (const brick of snapshot.bricks) {
    if (brick.destroyed) {
      // Fade out animation
      if (brick.destroyedAt) {
        const elapsed = now - brick.destroyedAt
        const progress = elapsed / config.effects.destroyAnimationDuration
        if (progress < 1) {
          ctx.globalAlpha = 1 - progress
          drawBrick(
            ctx,
            brick,
            brickColors[brick.type],
            config.layout.brickBorderRadius
          )
          ctx.globalAlpha = 1
        }
      }
      continue
    }

    drawBrick(
      ctx,
      brick,
      brickColors[brick.type],
      config.layout.brickBorderRadius
    )
  }

  // Helper to draw ball based on style
  const drawBall = (
    x: number,
    y: number,
    radius: number,
    color: string,
    alpha = 1
  ) => {
    ctx.globalAlpha = alpha
    ctx.fillStyle = color

    if (config.layout.ballStyle === 'custom' && config.layout.renderBall) {
      config.layout.renderBall(ctx, x, y, radius, color)
    } else if (config.layout.ballStyle === 'square') {
      const size = radius * 2
      ctx.fillRect(x - radius, y - radius, size, size)
    } else {
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.globalAlpha = 1
  }

  // Draw ball trail
  if (config.effects.showTrail && snapshot.ball.trail.length > 0) {
    for (let i = 0; i < snapshot.ball.trail.length; i++) {
      const pos = snapshot.ball.trail[i]
      const progress = (i + 1) / snapshot.ball.trail.length
      const opacity = progress * config.effects.trailOpacity
      const trailRadius = snapshot.ball.radius * (0.3 + 0.7 * progress)

      drawBall(pos.x, pos.y, trailRadius, trailColor, opacity)
    }
  }

  // Draw ball
  drawBall(
    snapshot.ball.position.x,
    snapshot.ball.position.y,
    snapshot.ball.radius,
    ballColor
  )

  // Draw paddle
  ctx.fillStyle = paddleColor
  const paddleRadius =
    config.layout.paddleBorderRadius === 'auto'
      ? snapshot.paddle.bounds.height / 2
      : config.layout.paddleBorderRadius
  drawRoundedRect(
    ctx,
    snapshot.paddle.bounds.x,
    snapshot.paddle.bounds.y,
    snapshot.paddle.bounds.width,
    snapshot.paddle.bounds.height,
    paddleRadius
  )

  // Note: HUD and overlays are now rendered as React components via children
}

/**
 * Brick Breaker Game Component
 */
/** Input mode - once locked, other input types are ignored for movement */
type InputMode = 'none' | 'keyboard' | 'pointer'

export function BrickBreaker({
  config: configOverrides,
  levels: customLevels,
  startLevel = 1,
  onGameEnd,
  onScoreChange,
  onStateChange,
  onLevelChange,
  className,
  autoFocus = true,
  showFocusRing = true,
  children,
}: BrickBreakerProps & { children?: React.ReactNode }) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = React.useState<CanvasDimensions>({
    width: 400,
    height: 300,
    dpr: 1,
  })
  const [theme, setTheme] = React.useState('')

  // Input mode locking - prevents keyboard/mouse conflicts
  const inputModeRef = React.useRef<InputMode>('none')

  const config = React.useMemo<BrickBreakerConfig>(
    () => mergeConfig(DEFAULT_CONFIG, configOverrides),
    [configOverrides]
  )

  const levels = customLevels || DEFAULT_LEVELS

  const {
    snapshot,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    nextLevel,
    movePaddle,
    setPaddlePosition,
    launchBall,
  } = useBrickBreaker({
    config,
    levels,
    startLevel,
    canvasDimensions: dimensions,
    onGameEnd,
    onScoreChange,
    onStateChange,
    onLevelChange,
  })

  // Reset input mode when game is not playing
  React.useEffect(() => {
    if (snapshot.state !== 'playing') {
      inputModeRef.current = 'none'
    }
  }, [snapshot.state])

  // Responsive sizing - follows container width, maintains aspect ratio
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateSize = () => {
      const rect = container.getBoundingClientRect()
      const containerWidth = Math.max(rect.width, 1)
      const containerHeight = Math.max(rect.height, 1)
      const dpr = window.devicePixelRatio || 1

      // Calculate dimensions that fit within container while maintaining aspect ratio
      const heightFromWidth = containerWidth / GAME_CONSTANTS.ASPECT_RATIO
      const widthFromHeight = containerHeight * GAME_CONSTANTS.ASPECT_RATIO

      let width: number
      let height: number

      if (heightFromWidth <= containerHeight) {
        // Width is the constraint - use full width
        width = containerWidth
        height = heightFromWidth
      } else {
        // Height is the constraint - use full height
        width = widthFromHeight
        height = containerHeight
      }

      setDimensions({ width, height, dpr })
    }

    updateSize()
    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [])

  // Theme changes
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

  // Render
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = dimensions.width * dimensions.dpr
    canvas.height = dimensions.height * dimensions.dpr

    renderGame(ctx, canvas, snapshot, config, dimensions)
  }, [snapshot, config, dimensions, theme])

  // Keyboard controls
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code

      // Movement keys - switch to keyboard mode (allows taking over from pointer)
      if (
        KEY_BINDINGS.LEFT.includes(code) ||
        KEY_BINDINGS.RIGHT.includes(code)
      ) {
        // Switch to keyboard mode - keyboard can always take over
        inputModeRef.current = 'keyboard'
        e.preventDefault()

        if (KEY_BINDINGS.LEFT.includes(code)) {
          movePaddle('left')
        } else {
          movePaddle('right')
        }
        return
      }

      // Action keys (always allowed regardless of input mode)
      if (KEY_BINDINGS.START.includes(code)) {
        e.preventDefault()
        if (snapshot.state === 'idle') {
          startGame()
        } else if (snapshot.state === 'paused') {
          resumeGame()
        } else if (snapshot.state === 'playing') {
          if (!snapshot.ball.isLaunched) {
            launchBall()
          } else {
            pauseGame()
          }
        } else if (snapshot.state === 'levelComplete') {
          nextLevel()
        }
      }

      if (KEY_BINDINGS.PAUSE.includes(code)) {
        e.preventDefault()
        if (snapshot.state === 'playing') {
          pauseGame()
        } else if (snapshot.state === 'paused') {
          resumeGame()
        }
      }

      if (KEY_BINDINGS.RESTART.includes(code)) {
        if (snapshot.state === 'won' || snapshot.state === 'lost') {
          resetGame()
          setTimeout(startGame, 100)
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code
      if (
        KEY_BINDINGS.LEFT.includes(code) ||
        KEY_BINDINGS.RIGHT.includes(code)
      ) {
        // Only respond if in keyboard mode
        if (inputModeRef.current === 'keyboard') {
          movePaddle('none')
          // Reset so pointer can take over
          inputModeRef.current = 'none'
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [
    snapshot.state,
    snapshot.ball.isLaunched,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    nextLevel,
    movePaddle,
    launchBall,
  ])

  // Mouse controls
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseMove = (e: MouseEvent) => {
      if (snapshot.state !== 'playing') return

      // Mouse can take over from null or pointer mode, but not keyboard
      if (inputModeRef.current === 'keyboard') return

      inputModeRef.current = 'pointer'

      const rect = canvas.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * dimensions.width
      setPaddlePosition(x)
    }

    const handleClick = () => {
      // Click actions are always allowed (start, launch, resume, etc.)
      if (snapshot.state === 'idle') {
        startGame()
      } else if (snapshot.state === 'paused') {
        resumeGame()
      } else if (snapshot.state === 'playing' && !snapshot.ball.isLaunched) {
        launchBall()
      } else if (snapshot.state === 'levelComplete') {
        nextLevel()
      } else if (snapshot.state === 'won' || snapshot.state === 'lost') {
        resetGame()
        setTimeout(startGame, 100)
      }
    }

    const handleMouseLeave = () => {
      // Reset pointer mode when mouse leaves canvas
      if (inputModeRef.current === 'pointer') {
        inputModeRef.current = 'none'
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('click', handleClick)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('click', handleClick)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [
    snapshot.state,
    snapshot.ball.isLaunched,
    dimensions,
    startGame,
    resumeGame,
    resetGame,
    nextLevel,
    setPaddlePosition,
    launchBall,
  ])

  // Touch controls
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()

      // Touch always takes over input mode
      inputModeRef.current = 'pointer'

      // Position paddle immediately on touch
      if (snapshot.state === 'playing' && e.touches[0]) {
        const touch = e.touches[0]
        const rect = canvas.getBoundingClientRect()
        const x = ((touch.clientX - rect.left) / rect.width) * dimensions.width
        setPaddlePosition(x)
      }

      // Touch actions (start, launch, etc.)
      if (snapshot.state === 'idle') {
        startGame()
      } else if (snapshot.state === 'paused') {
        resumeGame()
      } else if (snapshot.state === 'playing' && !snapshot.ball.isLaunched) {
        launchBall()
      } else if (snapshot.state === 'levelComplete') {
        nextLevel()
      } else if (snapshot.state === 'won' || snapshot.state === 'lost') {
        resetGame()
        setTimeout(startGame, 100)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (snapshot.state !== 'playing') return
      if (!e.touches[0]) return

      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      const x = ((touch.clientX - rect.left) / rect.width) * dimensions.width
      setPaddlePosition(x)
    }

    const handleTouchEnd = () => {
      // Reset input mode when touch ends so keyboard can take over
      if (inputModeRef.current === 'pointer') {
        inputModeRef.current = 'none'
      }
    }

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd)
    canvas.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      canvas.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [
    snapshot.state,
    snapshot.ball.isLaunched,
    dimensions,
    startGame,
    resumeGame,
    resetGame,
    nextLevel,
    setPaddlePosition,
    launchBall,
  ])

  // Auto-focus
  React.useEffect(() => {
    if (autoFocus) {
      canvasRef.current?.focus()
    }
  }, [autoFocus])

  // Context value for UI components
  const uiContextValue = React.useMemo(
    () => ({
      snapshot,
      startGame,
      pauseGame,
      resumeGame,
      resetGame,
      nextLevel,
    }),
    [snapshot, startGame, pauseGame, resumeGame, resetGame, nextLevel]
  )

  return (
    <BrickBreakerUIProvider value={uiContextValue}>
      <div
        ref={containerRef}
        data-slot="brick-breaker"
        data-state={snapshot.state}
        className={cn('relative flex items-center justify-center', className)}
      >
        <canvas
          ref={canvasRef}
          data-slot="brick-breaker-canvas"
          className={cn(
            'block outline-none',
            showFocusRing &&
              'focus-visible:ring-ring/50 focus-visible:ring-[3px]'
          )}
          style={{
            width: dimensions.width,
            height: dimensions.height,
            imageRendering: 'crisp-edges',
          }}
          tabIndex={0}
          role="img"
          aria-label={`Brick Breaker - Level ${snapshot.level}, Score: ${snapshot.score}, Lives: ${snapshot.lives}`}
        />

        {/* UI Components - customizable via children or uses default */}
        {children ?? <BrickBreakerDefaultUI />}

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {snapshot.state === 'won' &&
            `You won! Final score: ${snapshot.score}`}
          {snapshot.state === 'lost' && `Game over. Score: ${snapshot.score}`}
          {snapshot.state === 'levelComplete' &&
            `Level ${snapshot.level} complete! Score: ${snapshot.score}`}
        </div>
      </div>
    </BrickBreakerUIProvider>
  )
}
