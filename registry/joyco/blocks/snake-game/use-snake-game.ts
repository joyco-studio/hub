'use client'

import * as React from 'react'
import type {
  GameState,
  GameSnapshot,
  GameEndResult,
  SnakeGameConfig,
  Direction,
  Position,
  HighscoreEntry,
} from './types'
import {
  createInitialSnake,
  generateFood,
  storage,
} from './utils'

interface UseSnakeGameOptions {
  config: SnakeGameConfig
  onGameEnd?: (result: GameEndResult) => void
  onScoreChange?: (score: number) => void
  onStateChange?: (state: GameState) => void
}

interface UseSnakeGameReturn {
  gameState: GameState
  snapshot: GameSnapshot
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  resetGame: () => void
  setDirection: (direction: Direction) => void
}

/**
 * Custom hook for snake game logic.
 * Mirrors the proven working implementation from the sidebar snake game.
 */
export function useSnakeGame(options: UseSnakeGameOptions): UseSnakeGameReturn {
  const { config, onGameEnd, onScoreChange, onStateChange } = options
  const gridSize = config.grid.size

  // Use separate isPlaying/gameOver booleans like original
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [gameOver, setGameOver] = React.useState(false)
  const [snake, setSnake] = React.useState<Position[]>(() =>
    createInitialSnake(gridSize)
  )
  const [food, setFood] = React.useState<Position>(() =>
    generateFood(createInitialSnake(gridSize), gridSize)
  )
  const [direction, setDirectionState] = React.useState<Direction>('RIGHT')
  const [score, setScore] = React.useState(0)
  const [highscores, setHighscores] = React.useState<HighscoreEntry[]>([])

  const directionRef = React.useRef<Direction>(direction)
  const lastMovedDirectionRef = React.useRef<Direction>(direction)

  // Compute game state from booleans
  const gameState: GameState = gameOver
    ? 'gameOver'
    : isPlaying
      ? 'playing'
      : 'idle'

  // Load high scores on mount
  React.useEffect(() => {
    const loaded = storage.getHighscores(config.storage.storageKey)
    setHighscores(loaded)
  }, [config.storage.storageKey])

  // Sync direction ref
  React.useEffect(() => {
    directionRef.current = direction
  }, [direction])

  // Notify state changes
  React.useEffect(() => {
    onStateChange?.(gameState)
  }, [gameState, onStateChange])

  // Notify score changes
  React.useEffect(() => {
    onScoreChange?.(score)
  }, [score, onScoreChange])

  // Handle game over and save highscore
  React.useEffect(() => {
    if (gameOver && score > 0) {
      const updated = storage.addHighscore(
        config.storage.storageKey,
        score,
        config.storage.maxHighscores
      )
      setHighscores(updated)

      onGameEnd?.({
        score,
        highscores: updated,
        snakeLength: snake.length,
      })
    }
  }, [
    gameOver,
    score,
    snake.length,
    config.storage.storageKey,
    config.storage.maxHighscores,
    onGameEnd,
  ])

  // Reset game state - exactly like original
  const resetGame = React.useCallback(() => {
    const initialSnake = createInitialSnake(gridSize)
    setSnake(initialSnake)
    setFood(generateFood(initialSnake, gridSize))
    setDirectionState('RIGHT')
    directionRef.current = 'RIGHT'
    lastMovedDirectionRef.current = 'RIGHT'
    setGameOver(false)
    setScore(0)
    setIsPlaying(true)
  }, [gridSize])

  const startGame = resetGame

  const pauseGame = React.useCallback(() => {
    if (isPlaying && !gameOver) {
      setIsPlaying(false)
    }
  }, [isPlaying, gameOver])

  const resumeGame = React.useCallback(() => {
    if (!isPlaying && !gameOver) {
      setIsPlaying(true)
    }
  }, [isPlaying, gameOver])

  // Set direction (with 180° turn prevention)
  const setDirection = React.useCallback((newDirection: Direction) => {
    const lastMoved = lastMovedDirectionRef.current

    // Prevent 180° turns
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    }

    if (opposites[newDirection] !== lastMoved) {
      setDirectionState(newDirection)
    }
  }, [])

  // Game loop - exactly like original
  React.useEffect(() => {
    if (!isPlaying || gameOver) return

    const moveSnake = () => {
      setSnake((prev) => {
        const head = { ...prev[0] }
        const dir = directionRef.current

        // Update last moved direction BEFORE moving
        lastMovedDirectionRef.current = dir

        // Move head
        if (dir === 'UP') head.y -= 1
        if (dir === 'DOWN') head.y += 1
        if (dir === 'LEFT') head.x -= 1
        if (dir === 'RIGHT') head.x += 1

        // Check wall collision
        if (
          head.x < 0 ||
          head.x >= gridSize ||
          head.y < 0 ||
          head.y >= gridSize
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
          setScore((s) => s + config.scoring.pointsPerFood)
          setFood(generateFood(newSnake, gridSize))
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }

    const interval = setInterval(moveSnake, config.physics.initialSpeed)
    return () => clearInterval(interval)
  }, [isPlaying, gameOver, food, gridSize, config.physics.initialSpeed, config.scoring.pointsPerFood])

  // Create snapshot
  const snapshot: GameSnapshot = {
    state: gameState,
    snake: {
      segments: snake,
      direction,
      nextDirection: direction,
    },
    food: {
      position: food,
    },
    score,
    highscores,
  }

  return {
    gameState,
    snapshot,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    setDirection,
  }
}
