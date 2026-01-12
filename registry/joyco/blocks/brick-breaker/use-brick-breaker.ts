'use client'

import * as React from 'react'
import type {
  GameState,
  GameSnapshot,
  GameEndResult,
  BrickBreakerConfig,
  Brick,
  Ball,
  Paddle,
  Level,
  CanvasDimensions,
  BrickType,
} from './types'
import { DEFAULT_CONFIG, GAME_CONSTANTS } from './config'
import { DEFAULT_LEVELS, getBrickHealth } from './levels'
import {
  detectCollision,
  resolveBallBrickCollision,
  resolveBallPaddleCollision,
  generateId,
  clamp,
  normalize,
  scale,
  magnitude,
  storage,
} from './utils'

interface UseBrickBreakerOptions {
  config: BrickBreakerConfig
  levels: Level[]
  startLevel: number
  canvasDimensions: CanvasDimensions
  onGameEnd?: (result: GameEndResult) => void
  onScoreChange?: (score: number, combo: number) => void
  onStateChange?: (state: GameState) => void
  onLevelChange?: (level: number) => void
}

interface UseBrickBreakerReturn {
  snapshot: GameSnapshot
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  resetGame: () => void
  nextLevel: () => void
  movePaddle: (direction: 'left' | 'right' | 'none') => void
  setPaddlePosition: (x: number) => void
  launchBall: () => void
}

/**
 * Create bricks from level definition
 */
function createBricksFromLevel(
  level: Level,
  config: BrickBreakerConfig,
  dimensions: CanvasDimensions
): Brick[] {
  const { brickGap, topPadding, sidePadding } = config.layout
  const { width, height } = dimensions

  const rows = level.bricks.length
  const cols = level.bricks[0]?.length || config.layout.cols

  const playAreaX = width * sidePadding
  const playAreaY = height * topPadding
  const playAreaWidth = width * (1 - 2 * sidePadding)
  const playAreaHeight = height * 0.35

  const brickWidth = (playAreaWidth - (cols - 1) * brickGap) / cols
  const brickHeight = (playAreaHeight - (rows - 1) * brickGap) / rows

  const bricks: Brick[] = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const def = level.bricks[row]?.[col]
      if (!def) continue

      const health = getBrickHealth(def.type)
      const points = def.points ?? config.scoring.pointsByType[def.type]

      bricks.push({
        id: generateId(),
        row,
        col,
        bounds: {
          x: playAreaX + col * (brickWidth + brickGap),
          y: playAreaY + row * (brickHeight + brickGap),
          width: brickWidth,
          height: brickHeight,
        },
        type: def.type,
        health,
        maxHealth: health,
        destroyed: false,
        points,
      })
    }
  }

  return bricks
}

/**
 * Create paddle
 */
function createPaddle(
  config: BrickBreakerConfig,
  dimensions: CanvasDimensions
): Paddle {
  const { paddleWidth, paddleHeight, paddleOffset } = config.sizing
  const { width, height } = dimensions

  const w = width * paddleWidth
  const h = height * paddleHeight

  return {
    bounds: {
      x: (width - w) / 2,
      y: height * (1 - paddleOffset) - h,
      width: w,
      height: h,
    },
    targetX: null,
    speed: config.physics.paddleSpeed,
  }
}

/**
 * Create ball attached to paddle
 */
function createBall(
  config: BrickBreakerConfig,
  dimensions: CanvasDimensions,
  paddle: Paddle,
  levelIndex: number
): Ball {
  const { ballRadius } = config.sizing
  const { width } = dimensions
  const { baseSpeed, speedPerLevel, maxSpeed } = config.physics

  const radius = width * ballRadius
  const speed = Math.min(baseSpeed + levelIndex * speedPerLevel, maxSpeed)

  return {
    position: {
      x: paddle.bounds.x + paddle.bounds.width / 2,
      y: paddle.bounds.y - radius - 2,
    },
    velocity: { x: 0, y: 0 },
    radius,
    speed,
    trail: [],
    isLaunched: false,
  }
}

/**
 * Launch ball from paddle with random angle
 */
function launchBallFromPaddle(ball: Ball): Ball {
  // Random angle between -45 and -135 degrees (upward arc)
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 2)

  return {
    ...ball,
    velocity: {
      x: Math.cos(angle) * ball.speed,
      y: Math.sin(angle) * ball.speed,
    },
    isLaunched: true,
  }
}

/**
 * Main game hook with proper refs-based physics engine
 */
export function useBrickBreaker(
  options: UseBrickBreakerOptions
): UseBrickBreakerReturn {
  const {
    config,
    levels,
    startLevel,
    canvasDimensions,
    onGameEnd,
    onScoreChange,
    onStateChange,
    onLevelChange,
  } = options

  // React state for rendering (updated each frame)
  const [, forceRender] = React.useReducer((x) => x + 1, 0)

  // Game state stored in refs for mutation during game loop
  const gameStateRef = React.useRef<GameState>('idle')
  const levelIndexRef = React.useRef(startLevel - 1)
  const scoreRef = React.useRef(0)
  const highScoreRef = React.useRef(0)
  const livesRef = React.useRef(config.gameplay.startingLives)
  const comboRef = React.useRef(0)
  const lastHitTimeRef = React.useRef(0)

  const bricksRef = React.useRef<Brick[]>([])
  const paddleRef = React.useRef<Paddle>(createPaddle(config, canvasDimensions))
  const ballRef = React.useRef<Ball>(
    createBall(config, canvasDimensions, paddleRef.current, levelIndexRef.current)
  )

  const animationFrameRef = React.useRef<number>(0)
  const lastFrameTimeRef = React.useRef<number>(0)
  const paddleDirectionRef = React.useRef<'left' | 'right' | 'none'>('none')
  const totalBricksRef = React.useRef(0)
  const destroyedBricksRef = React.useRef(0)

  // Load high score
  React.useEffect(() => {
    if (config.storage.persistHighScore) {
      highScoreRef.current = storage.get(`${config.storage.storageKey}-highscore`, 0)
    }
  }, [config.storage])

  // Initialize level
  const initLevel = React.useCallback(
    (levelIndex: number) => {
      const level = levels[levelIndex] || levels[0]
      if (!level) return

      const newBricks = createBricksFromLevel(level, config, canvasDimensions)
      const newPaddle = createPaddle(config, canvasDimensions)
      const newBall = createBall(config, canvasDimensions, newPaddle, levelIndex)

      // Apply level speed multiplier
      if (level.speedMultiplier) {
        newBall.speed *= level.speedMultiplier
      }

      bricksRef.current = newBricks
      paddleRef.current = newPaddle
      ballRef.current = newBall
      comboRef.current = 0

      totalBricksRef.current = newBricks.filter(
        (b) => b.type !== 'indestructible'
      ).length
      destroyedBricksRef.current = 0

      forceRender()
    },
    [config, canvasDimensions, levels]
  )

  // Initialize on mount
  React.useEffect(() => {
    initLevel(levelIndexRef.current)
  }, [initLevel])

  // Reinitialize on dimension change
  React.useEffect(() => {
    if (gameStateRef.current === 'idle') {
      initLevel(levelIndexRef.current)
    }
  }, [canvasDimensions, initLevel])

  // Game loop
  const gameLoop = React.useCallback(
    (timestamp: number) => {
      if (gameStateRef.current !== 'playing') return

      const deltaTime = timestamp - lastFrameTimeRef.current
      lastFrameTimeRef.current = timestamp

      // Cap delta time to prevent physics issues
      const dt = Math.min(deltaTime, 50) / GAME_CONSTANTS.FRAME_TIME

      const paddle = paddleRef.current
      const ball = ballRef.current
      const bricks = bricksRef.current

      // ========== UPDATE PADDLE ==========
      let newPaddleX = paddle.bounds.x

      // Keyboard control
      if (paddleDirectionRef.current === 'left') {
        newPaddleX -= paddle.speed * dt
      } else if (paddleDirectionRef.current === 'right') {
        newPaddleX += paddle.speed * dt
      }

      // Mouse/touch control (smooth follow)
      if (paddle.targetX !== null) {
        const targetX = paddle.targetX - paddle.bounds.width / 2
        const diff = targetX - newPaddleX
        newPaddleX += diff * 0.2 * dt
      }

      // Clamp to bounds
      newPaddleX = clamp(newPaddleX, 0, canvasDimensions.width - paddle.bounds.width)
      paddle.bounds.x = newPaddleX

      // ========== UPDATE BALL ==========
      if (!ball.isLaunched) {
        // Ball follows paddle
        ball.position.x = paddle.bounds.x + paddle.bounds.width / 2
        ball.position.y = paddle.bounds.y - ball.radius - 2
      } else {
        // Update trail
        if (config.effects.showTrail) {
          ball.trail.push({ ...ball.position })
          if (ball.trail.length > config.effects.trailLength) {
            ball.trail.shift()
          }
        }

        // Move ball
        let newX = ball.position.x + ball.velocity.x * dt
        let newY = ball.position.y + ball.velocity.y * dt
        let newVelX = ball.velocity.x
        let newVelY = ball.velocity.y

        // Wall collisions
        if (newX - ball.radius < 0) {
          newX = ball.radius
          newVelX = Math.abs(newVelX)
        } else if (newX + ball.radius > canvasDimensions.width) {
          newX = canvasDimensions.width - ball.radius
          newVelX = -Math.abs(newVelX)
        }

        if (newY - ball.radius < 0) {
          newY = ball.radius
          newVelY = Math.abs(newVelY)
        }

        ball.position.x = newX
        ball.position.y = newY
        ball.velocity.x = newVelX
        ball.velocity.y = newVelY

        // Check if ball fell below screen
        if (newY - ball.radius > canvasDimensions.height) {
          livesRef.current--

          if (livesRef.current <= 0) {
            // Game over
            gameStateRef.current = 'lost'
            onStateChange?.('lost')
            onGameEnd?.({
              won: false,
              score: scoreRef.current,
              highScore: Math.max(scoreRef.current, highScoreRef.current),
              level: levelIndexRef.current + 1,
              totalLevels: levels.length,
              bricksDestroyed: destroyedBricksRef.current,
              totalBricks: totalBricksRef.current,
            })
          } else {
            // Reset ball
            const newBall = createBall(
              config,
              canvasDimensions,
              paddle,
              levelIndexRef.current
            )
            if (levels[levelIndexRef.current]?.speedMultiplier) {
              newBall.speed *= levels[levelIndexRef.current].speedMultiplier!
            }
            ballRef.current = newBall
            comboRef.current = 0
          }

          forceRender()
          animationFrameRef.current = requestAnimationFrame(gameLoop)
          return
        }

        // ========== PADDLE COLLISION ==========
        const paddleCollision = detectCollision(
          ball.position,
          ball.radius,
          ball.velocity,
          paddle.bounds
        )

        if (paddleCollision.collided && ball.velocity.y > 0) {
          const resolved = resolveBallPaddleCollision(
            ball,
            paddle,
            paddleCollision,
            config
          )
          ball.position = resolved.position
          ball.velocity = resolved.velocity
          comboRef.current = 0 // Reset combo on paddle hit
        }

        // ========== BRICK COLLISIONS ==========
        let hitBrick = false

        for (const brick of bricks) {
          if (brick.destroyed || hitBrick) continue

          const collision = detectCollision(
            ball.position,
            ball.radius,
            ball.velocity,
            brick.bounds
          )

          if (collision.collided) {
            hitBrick = true

            // Resolve collision
            const resolved = resolveBallBrickCollision(ball, brick, collision, config)
            ball.position = resolved.position
            ball.velocity = resolved.velocity

            // Damage brick
            if (brick.type !== 'indestructible') {
              brick.health--

              if (brick.health <= 0) {
                brick.destroyed = true
                brick.destroyedAt = Date.now()
                destroyedBricksRef.current++

                // Update combo
                const now = Date.now()
                if (now - lastHitTimeRef.current < config.scoring.comboTimeout) {
                  comboRef.current = Math.min(
                    comboRef.current + 1,
                    config.scoring.maxCombo
                  )
                } else {
                  comboRef.current = 1
                }
                lastHitTimeRef.current = now

                // Calculate score with combo
                const multiplier = 1 + comboRef.current * config.scoring.comboMultiplier
                const points = Math.floor(brick.points * multiplier)
                scoreRef.current += points

                // Update high score
                if (scoreRef.current > highScoreRef.current) {
                  highScoreRef.current = scoreRef.current
                  if (config.storage.persistHighScore) {
                    storage.set(
                      `${config.storage.storageKey}-highscore`,
                      highScoreRef.current
                    )
                  }
                }

                onScoreChange?.(scoreRef.current, comboRef.current)
              }
            }

            break // Only handle one collision per frame
          }
        }

        // ========== CHECK WIN CONDITION ==========
        const remainingBricks = bricks.filter(
          (b) => !b.destroyed && b.type !== 'indestructible'
        )

        if (remainingBricks.length === 0) {
          // Level complete!
          scoreRef.current += config.scoring.levelBonus
          onScoreChange?.(scoreRef.current, comboRef.current)

          if (levelIndexRef.current >= levels.length - 1) {
            // Game won!
            gameStateRef.current = 'won'
            onStateChange?.('won')
            onGameEnd?.({
              won: true,
              score: scoreRef.current,
              highScore: Math.max(scoreRef.current, highScoreRef.current),
              level: levelIndexRef.current + 1,
              totalLevels: levels.length,
              bricksDestroyed: destroyedBricksRef.current,
              totalBricks: totalBricksRef.current,
            })
          } else {
            // Next level
            gameStateRef.current = 'levelComplete'
            onStateChange?.('levelComplete')
          }

          forceRender()
          return
        }
      }

      forceRender()
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    },
    [config, canvasDimensions, levels, onGameEnd, onScoreChange, onStateChange]
  )

  // Start/stop loop based on state
  React.useEffect(() => {
    if (gameStateRef.current === 'playing') {
      lastFrameTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    return () => {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [gameLoop])

  // ========== PUBLIC ACTIONS ==========

  const startGame = React.useCallback(() => {
    if (gameStateRef.current === 'idle' || gameStateRef.current === 'lost') {
      levelIndexRef.current = startLevel - 1
      scoreRef.current = 0
      livesRef.current = config.gameplay.startingLives
      destroyedBricksRef.current = 0
      initLevel(levelIndexRef.current)
    }

    if (!ballRef.current.isLaunched) {
      ballRef.current = launchBallFromPaddle(ballRef.current)
    }

    gameStateRef.current = 'playing'
    onStateChange?.('playing')
    lastFrameTimeRef.current = performance.now()
    animationFrameRef.current = requestAnimationFrame(gameLoop)
    forceRender()
  }, [config.gameplay.startingLives, startLevel, initLevel, onStateChange, gameLoop])

  const pauseGame = React.useCallback(() => {
    if (gameStateRef.current === 'playing') {
      gameStateRef.current = 'paused'
      onStateChange?.('paused')
      cancelAnimationFrame(animationFrameRef.current)
      forceRender()
    }
  }, [onStateChange])

  const resumeGame = React.useCallback(() => {
    if (gameStateRef.current === 'paused') {
      gameStateRef.current = 'playing'
      onStateChange?.('playing')
      lastFrameTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(gameLoop)
      forceRender()
    }
  }, [onStateChange, gameLoop])

  const resetGame = React.useCallback(() => {
    cancelAnimationFrame(animationFrameRef.current)
    levelIndexRef.current = startLevel - 1
    scoreRef.current = 0
    livesRef.current = config.gameplay.startingLives
    destroyedBricksRef.current = 0
    gameStateRef.current = 'idle'
    initLevel(levelIndexRef.current)
    onStateChange?.('idle')
    forceRender()
  }, [config.gameplay.startingLives, startLevel, initLevel, onStateChange])

  const nextLevel = React.useCallback(() => {
    if (
      gameStateRef.current === 'levelComplete' &&
      levelIndexRef.current < levels.length - 1
    ) {
      levelIndexRef.current++
      initLevel(levelIndexRef.current)
      onLevelChange?.(levelIndexRef.current + 1)

      // Auto-launch after brief pause
      gameStateRef.current = 'playing'
      onStateChange?.('playing')
      lastFrameTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(gameLoop)
      forceRender()
    }
  }, [levels.length, initLevel, onLevelChange, onStateChange, gameLoop])

  const movePaddle = React.useCallback((direction: 'left' | 'right' | 'none') => {
    paddleDirectionRef.current = direction
    paddleRef.current.targetX = null
  }, [])

  const setPaddlePosition = React.useCallback((x: number) => {
    paddleRef.current.targetX = x
    paddleDirectionRef.current = 'none'
  }, [])

  const launchBallAction = React.useCallback(() => {
    if (!ballRef.current.isLaunched && gameStateRef.current === 'playing') {
      ballRef.current = launchBallFromPaddle(ballRef.current)
      forceRender()
    }
  }, [])

  // Create snapshot for rendering
  const currentLevel = levels[levelIndexRef.current] || levels[0]
  const snapshot: GameSnapshot = {
    state: gameStateRef.current,
    level: levelIndexRef.current + 1,
    levelName: currentLevel?.name || `Level ${levelIndexRef.current + 1}`,
    score: scoreRef.current,
    highScore: highScoreRef.current,
    lives: livesRef.current,
    bricks: bricksRef.current,
    paddle: paddleRef.current,
    ball: ballRef.current,
    combo: comboRef.current,
    totalLevels: levels.length,
  }

  return {
    snapshot,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    nextLevel,
    movePaddle,
    setPaddlePosition,
    launchBall: launchBallAction,
  }
}
