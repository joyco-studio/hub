'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import * as React from 'react'

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type Position = { x: number; y: number }
type HighscoreEntry = { score: number; date: string }

const GRID_SIZE = 20
const INITIAL_SNAKE_LENGTH = 3
const INITIAL_SPEED = 150
const STORAGE_KEY = 'snake-highscores'
const MAX_HIGHSCORES = 4

function getInitialSnake(): Position[] {
  const y = Math.floor(GRID_SIZE / 2)
  const headX = Math.floor(GRID_SIZE / 2)

  return Array.from({ length: INITIAL_SNAKE_LENGTH }, (_, i) => ({
    x: headX - i,
    y,
  }))
}

function generateFood(currentSnake: Position[]) {
  let newFood: Position
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
  } while (currentSnake.some((s) => s.x === newFood.x && s.y === newFood.y))
  return newFood
}

export function SnakeGame() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [canvasSize, setCanvasSize] = React.useState(180)
  const [snake, setSnake] = React.useState<Position[]>(() => getInitialSnake())
  const [food, setFood] = React.useState<Position>(() =>
    generateFood(getInitialSnake())
  )
  const [direction, setDirection] = React.useState<Direction>('RIGHT')
  const [gameOver, setGameOver] = React.useState(false)
  const [score, setScore] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [theme, setTheme] = React.useState('')
  const [highscores, setHighscores] = React.useState<HighscoreEntry[]>([])

  const directionRef = React.useRef(direction)
  const lastMovedDirectionRef = React.useRef(direction)

  // Load highscores from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setHighscores(JSON.parse(stored))
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Save highscore when game ends
  React.useEffect(() => {
    if (gameOver && score > 0) {
      const newEntry: HighscoreEntry = {
        score,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      }

      setHighscores((prev) => {
        const updated = [...prev, newEntry]
          .sort((a, b) => b.score - a.score)
          .slice(0, MAX_HIGHSCORES)

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch {
          // Ignore localStorage errors
        }

        return updated
      })
    }
  }, [gameOver, score])

  // Update ref when direction changes
  React.useEffect(() => {
    directionRef.current = direction
  }, [direction])

  // Listen for theme changes on <html> element
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

  const cellSize = canvasSize / GRID_SIZE

  // Responsive sizing - ensure canvas is multiple of GRID_SIZE for clean pixels
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect
      // Round down to nearest multiple of GRID_SIZE to avoid sub-pixel artifacts
      const size = Math.floor(width / GRID_SIZE) * GRID_SIZE
      setCanvasSize(size || GRID_SIZE * 15) // fallback to 180
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const resetGame = React.useCallback(() => {
    const initialSnake = getInitialSnake()
    setSnake(initialSnake)
    setFood(generateFood(initialSnake))
    setDirection('RIGHT')
    lastMovedDirectionRef.current = 'RIGHT'
    setGameOver(false)
    setScore(0)
    setIsPlaying(true)
  }, [])

  // Handle keyboard input - check against last MOVED direction to prevent rapid reversal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return

      const key = e.key
      // Check against the last direction the snake actually moved, not the queued direction
      const lastMoved = lastMovedDirectionRef.current

      if ((key === 'ArrowUp' || key === 'w') && lastMoved !== 'DOWN') {
        setDirection('UP')
        e.preventDefault()
      } else if ((key === 'ArrowDown' || key === 's') && lastMoved !== 'UP') {
        setDirection('DOWN')
        e.preventDefault()
      } else if (
        (key === 'ArrowLeft' || key === 'a') &&
        lastMoved !== 'RIGHT'
      ) {
        setDirection('LEFT')
        e.preventDefault()
      } else if (
        (key === 'ArrowRight' || key === 'd') &&
        lastMoved !== 'LEFT'
      ) {
        setDirection('RIGHT')
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying])

  // Handle touch/swipe input for mobile
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isPlaying || !touchStartRef.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y

      // Minimum swipe distance threshold
      const minSwipe = 30

      // Check against the last direction the snake actually moved
      const lastMoved = lastMovedDirectionRef.current

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > minSwipe && lastMoved !== 'LEFT') {
          setDirection('RIGHT')
        } else if (deltaX < -minSwipe && lastMoved !== 'RIGHT') {
          setDirection('LEFT')
        }
      } else {
        // Vertical swipe
        if (deltaY > minSwipe && lastMoved !== 'UP') {
          setDirection('DOWN')
        } else if (deltaY < -minSwipe && lastMoved !== 'DOWN') {
          setDirection('UP')
        }
      }

      touchStartRef.current = null
    }

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isPlaying])

  // Game loop
  React.useEffect(() => {
    if (!isPlaying || gameOver) return

    const moveSnake = () => {
      setSnake((prev) => {
        const head = { ...prev[0] }
        const dir = directionRef.current

        // Update the last moved direction BEFORE moving
        lastMovedDirectionRef.current = dir

        if (dir === 'UP') head.y -= 1
        if (dir === 'DOWN') head.y += 1
        if (dir === 'LEFT') head.x -= 1
        if (dir === 'RIGHT') head.x += 1

        // Check wall collision
        if (
          head.x < 0 ||
          head.x >= GRID_SIZE ||
          head.y < 0 ||
          head.y >= GRID_SIZE
        ) {
          setGameOver(true)
          setIsPlaying(false)
          return prev
        }

        // Check self collision
        if (prev.some((s) => s.x === head.x && s.y === head.y)) {
          setGameOver(true)
          setIsPlaying(false)
          return prev
        }

        const newSnake = [head, ...prev]

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          setScore((s) => s + 1)
          setFood(generateFood(newSnake))
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }

    const interval = setInterval(moveSnake, INITIAL_SPEED)
    return () => clearInterval(interval)
  }, [isPlaying, gameOver, food])

  // Draw game with HiDPI support
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Handle device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvasSize * dpr
    canvas.height = canvasSize * dpr

    // Disable image smoothing for crisp pixel edges
    ctx.imageSmoothingEnabled = false

    ctx.scale(dpr, dpr)

    // Get computed styles for colors (CSS vars are already complete color values like oklch())
    const computedStyle = getComputedStyle(canvas)
    const primaryColor = computedStyle.getPropertyValue('--primary').trim()
    const foregroundColor = computedStyle
      .getPropertyValue('--foreground')
      .trim()

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize)

    // Use integer cell size
    const cell = Math.floor(cellSize)

    // Draw snake (foreground color - solid squares)
    ctx.fillStyle = foregroundColor
    snake.forEach((segment) => {
      ctx.fillRect(segment.x * cell, segment.y * cell, cell, cell)
    })

    // Draw food (primary color - solid square)
    ctx.fillStyle = primaryColor
    ctx.fillRect(food.x * cell, food.y * cell, cell, cell)
  }, [snake, food, canvasSize, cellSize, theme])

  return (
    <div className="bg-background flex w-full flex-col items-center">
      <div ref={containerRef} className="bg-muted aspect-square w-full">
        <canvas
          ref={canvasRef}
          style={{ width: canvasSize, height: canvasSize }}
          className="bg-muted size-full"
        />
      </div>
      <div className="text-muted-foreground border-background flex w-full items-center justify-center border-t-4 font-mono text-xs">
        {gameOver ? (
          <div className="flex w-full items-center gap-1 pl-2">
            <span className="flex-1 uppercase">
              <span className="font-bold">F*ck!</span> Score:{' '}
              <span className="text-foreground font-bold">{score}</span>{' '}
            </span>
            <Button size="sm" onClick={resetGame} className="uppercase">
              Play again
            </Button>
          </div>
        ) : isPlaying ? (
          <div className="flex w-full items-center gap-1">
            <div className="flex flex-1 px-3 whitespace-pre">
              Score:
              <span className="text-foreground font-bold">
                {` `}
                {score}
              </span>
            </div>
            <span className="flex h-8 w-full shrink items-center pl-2">
              <div className="ml-auto flex gap-1">
                {/* Desktop: WASD, Mobile: Arrows */}
                {[
                  { desktop: 'W', mobile: '↑' },
                  { desktop: 'A', mobile: '←' },
                  { desktop: 'S', mobile: '↓' },
                  { desktop: 'D', mobile: '→' },
                ].map(({ desktop, mobile }) => (
                  <Badge variant="key" key={desktop}>
                    <span className="max-md:hidden">{desktop}</span>
                    <span className="md:hidden">{mobile}</span>
                  </Badge>
                ))}
              </div>
            </span>
          </div>
        ) : (
          <Button size="sm" onClick={resetGame} className="w-full uppercase">
            Play Snake
          </Button>
        )}
      </div>
      {highscores.length > 0 && (
        <div className="border-background bg-accent/10 flex w-full flex-col border-t-4 px-3 py-2">
          <span className="text-muted-foreground/60 mb-1 text-[10px] uppercase">
            Highscores
          </span>
          {highscores.map((entry, i) => (
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
    </div>
  )
}
