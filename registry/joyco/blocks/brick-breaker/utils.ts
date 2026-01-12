import type {
  Vector2D,
  Bounds,
  CollisionResult,
  CollisionSide,
  BrickBreakerConfig,
  DeepPartial,
  Ball,
  Brick,
  Paddle,
} from './types'

// ============================================================================
// Configuration Utilities
// ============================================================================

/**
 * Deep merge configuration objects
 */
export function mergeConfig(
  base: BrickBreakerConfig,
  overrides?: DeepPartial<BrickBreakerConfig>
): BrickBreakerConfig {
  if (!overrides) return base

  return {
    colors: {
      ...base.colors,
      ...overrides.colors,
      bricks: { ...base.colors.bricks, ...overrides.colors?.bricks },
    },
    layout: { ...base.layout, ...overrides.layout },
    sizing: { ...base.sizing, ...overrides.sizing },
    physics: { ...base.physics, ...overrides.physics },
    scoring: {
      ...base.scoring,
      ...overrides.scoring,
      pointsByType: {
        ...base.scoring.pointsByType,
        ...overrides.scoring?.pointsByType,
      },
    },
    gameplay: { ...base.gameplay, ...overrides.gameplay },
    effects: { ...base.effects, ...overrides.effects },
    storage: { ...base.storage, ...overrides.storage },
  }
}

// ============================================================================
// Vector Math
// ============================================================================

/** Normalize vector to unit length */
export function normalize(v: Vector2D): Vector2D {
  const len = Math.sqrt(v.x * v.x + v.y * v.y)
  if (len === 0) return { x: 0, y: -1 }
  return { x: v.x / len, y: v.y / len }
}

/** Calculate vector magnitude */
export function magnitude(v: Vector2D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

/** Scale vector by scalar */
export function scale(v: Vector2D, s: number): Vector2D {
  return { x: v.x * s, y: v.y * s }
}

/** Add two vectors */
export function add(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x + b.x, y: a.y + b.y }
}

/** Subtract vectors (a - b) */
export function subtract(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x - b.x, y: a.y - b.y }
}

/** Dot product of two vectors */
export function dot(a: Vector2D, b: Vector2D): number {
  return a.x * b.x + a.y * b.y
}

/** Reflect velocity off a surface normal */
export function reflect(velocity: Vector2D, normal: Vector2D): Vector2D {
  const d = dot(velocity, normal)
  return {
    x: velocity.x - 2 * d * normal.x,
    y: velocity.y - 2 * d * normal.y,
  }
}

/** Clamp value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// ============================================================================
// Collision Detection - AABB vs Circle with Proper Side Detection
// ============================================================================

/**
 * Detect collision between a circle (ball) and axis-aligned rectangle (brick/paddle).
 * Returns collision info including which side was hit for proper bounce direction.
 */
export function detectCollision(
  ballPos: Vector2D,
  ballRadius: number,
  ballVel: Vector2D,
  rect: Bounds
): CollisionResult {
  // Find the closest point on the rectangle to the ball center
  const closestX = clamp(ballPos.x, rect.x, rect.x + rect.width)
  const closestY = clamp(ballPos.y, rect.y, rect.y + rect.height)

  // Calculate distance from ball center to closest point
  const dx = ballPos.x - closestX
  const dy = ballPos.y - closestY
  const distSq = dx * dx + dy * dy
  const radiusSq = ballRadius * ballRadius

  // No collision if distance > radius
  if (distSq > radiusSq) {
    return { collided: false }
  }

  const dist = Math.sqrt(distSq)
  const penetration = ballRadius - dist

  // Determine collision side based on approach direction and position
  let side: CollisionSide
  let normal: Vector2D

  if (dist < 0.001) {
    // Ball center is inside rect - use velocity to determine exit direction
    const rectCenterX = rect.x + rect.width / 2
    const rectCenterY = rect.y + rect.height / 2
    const toBallX = ballPos.x - rectCenterX
    const toBallY = ballPos.y - rectCenterY

    // Determine which edge is closest
    const halfW = rect.width / 2
    const halfH = rect.height / 2
    const overlapX = halfW - Math.abs(toBallX)
    const overlapY = halfH - Math.abs(toBallY)

    if (overlapX < overlapY) {
      // Exit through left or right
      if (toBallX > 0) {
        side = 'right'
        normal = { x: 1, y: 0 }
      } else {
        side = 'left'
        normal = { x: -1, y: 0 }
      }
    } else {
      // Exit through top or bottom
      if (toBallY > 0) {
        side = 'bottom'
        normal = { x: 0, y: 1 }
      } else {
        side = 'top'
        normal = { x: 0, y: -1 }
      }
    }
  } else {
    // Normal case - calculate normal from closest point
    normal = { x: dx / dist, y: dy / dist }

    // Determine side based on where closest point is
    const isOnLeft = closestX <= rect.x + 0.01
    const isOnRight = closestX >= rect.x + rect.width - 0.01
    const isOnTop = closestY <= rect.y + 0.01
    const isOnBottom = closestY >= rect.y + rect.height - 0.01

    if (isOnTop && !isOnLeft && !isOnRight) {
      side = 'top'
      normal = { x: 0, y: -1 }
    } else if (isOnBottom && !isOnLeft && !isOnRight) {
      side = 'bottom'
      normal = { x: 0, y: 1 }
    } else if (isOnLeft && !isOnTop && !isOnBottom) {
      side = 'left'
      normal = { x: -1, y: 0 }
    } else if (isOnRight && !isOnTop && !isOnBottom) {
      side = 'right'
      normal = { x: 1, y: 0 }
    } else {
      // Corner collision
      side = 'corner'
      // Keep the calculated normal for corners
    }
  }

  return {
    collided: true,
    side,
    normal,
    penetration,
    contactPoint: { x: closestX, y: closestY },
  }
}

/**
 * Resolve ball collision - move ball out of collision and reflect velocity.
 * Returns the new ball state.
 */
export function resolveBallBrickCollision(
  ball: Ball,
  brick: Brick,
  collision: CollisionResult,
  config: BrickBreakerConfig
): Ball {
  if (!collision.collided || !collision.normal || collision.penetration === undefined) {
    return ball
  }

  // Move ball out of collision
  const newPos = {
    x: ball.position.x + collision.normal.x * (collision.penetration + 0.5),
    y: ball.position.y + collision.normal.y * (collision.penetration + 0.5),
  }

  // Reflect velocity
  let newVel = reflect(ball.velocity, collision.normal)

  // Ensure minimum Y velocity to prevent horizontal loops
  if (Math.abs(newVel.y) < config.physics.minYVelocity) {
    newVel.y = newVel.y >= 0 ? config.physics.minYVelocity : -config.physics.minYVelocity
    // Renormalize to maintain speed
    const speed = ball.speed
    newVel = scale(normalize(newVel), speed)
  }

  return {
    ...ball,
    position: newPos,
    velocity: newVel,
  }
}

/**
 * Handle ball-paddle collision with angle adjustment based on hit position.
 */
export function resolveBallPaddleCollision(
  ball: Ball,
  paddle: Paddle,
  collision: CollisionResult,
  config: BrickBreakerConfig
): Ball {
  if (!collision.collided || !collision.normal || collision.penetration === undefined) {
    return ball
  }

  // Only bounce if ball is moving downward
  if (ball.velocity.y <= 0) {
    return ball
  }

  // Calculate hit position relative to paddle center (-1 to 1)
  const paddleCenterX = paddle.bounds.x + paddle.bounds.width / 2
  const hitPos = (ball.position.x - paddleCenterX) / (paddle.bounds.width / 2)
  const clampedHitPos = clamp(hitPos, -1, 1)

  // Calculate bounce angle based on hit position
  // Center = straight up, edges = angled
  const bounceAngle = clampedHitPos * config.physics.maxBounceAngle

  // Create new velocity from angle
  const speed = ball.speed
  const newVel: Vector2D = {
    x: Math.sin(bounceAngle) * speed,
    y: -Math.cos(bounceAngle) * speed,
  }

  // Move ball above paddle
  const newY = paddle.bounds.y - ball.radius - 1

  return {
    ...ball,
    position: { x: ball.position.x, y: newY },
    velocity: newVel,
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/** Generate unique ID */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

/** Resolve CSS variable to actual color value */
export function resolveCssColor(color: string, element: HTMLElement): string {
  if (!color.includes('var(')) return color

  const computed = getComputedStyle(element)
  const varMatch = color.match(/var\((--[^)]+)\)/)

  if (varMatch) {
    const varName = varMatch[1]
    const resolved = computed.getPropertyValue(varName).trim()
    return resolved || color
  }

  return color
}

/** Format score with thousands separator */
export function formatScore(score: number): string {
  return score.toLocaleString()
}

/** Storage utilities */
export const storage = {
  get(key: string, defaultValue: number = 0): number {
    if (typeof window === 'undefined') return defaultValue
    try {
      const value = localStorage.getItem(key)
      return value ? parseInt(value, 10) : defaultValue
    } catch {
      return defaultValue
    }
  },

  set(key: string, value: number): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, value.toString())
    } catch {
      // Silently fail
    }
  },

  getJSON<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : defaultValue
    } catch {
      return defaultValue
    }
  },

  setJSON<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Silently fail
    }
  },
}

/** Degrees to radians */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/** Create velocity vector from angle and speed */
export function velocityFromAngle(angle: number, speed: number): Vector2D {
  return {
    x: Math.cos(angle) * speed,
    y: Math.sin(angle) * speed,
  }
}

/**
 * Check if ball is moving toward a rectangle (for early collision skip)
 */
export function isBallMovingToward(ball: Ball, rect: Bounds): boolean {
  const rectCenterX = rect.x + rect.width / 2
  const rectCenterY = rect.y + rect.height / 2

  const toRect = {
    x: rectCenterX - ball.position.x,
    y: rectCenterY - ball.position.y,
  }

  return dot(ball.velocity, toRect) > 0
}
