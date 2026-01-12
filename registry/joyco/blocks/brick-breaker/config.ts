import type { BrickBreakerConfig, BrickBreakerColors } from './types'

/** Theme-aware default colors using CSS variables */
export const DEFAULT_COLORS: BrickBreakerColors = {
  background: 'var(--background)',
  paddle: 'var(--foreground)',
  ball: 'var(--foreground)',
  ballTrail: 'var(--muted-foreground)',
  text: 'var(--foreground)',
  textMuted: 'var(--muted-foreground)',
  bricks: {
    normal: 'var(--foreground)',
    strong: 'var(--foreground)',
    metal: 'var(--foreground)',
    indestructible: 'var(--muted-foreground)',
  },
}

/** Complete default configuration */
export const DEFAULT_CONFIG: BrickBreakerConfig = {
  colors: DEFAULT_COLORS,
  layout: {
    cols: 8,
    rows: 5,
    brickGap: 4,
    topPadding: 0.14,
    sidePadding: 0.04,
    brickBorderRadius: 2,
    paddleBorderRadius: 'auto', // 'auto' = height/2 for pill shape
    ballStyle: 'round',
  },
  sizing: {
    paddleWidth: 0.18,
    paddleHeight: 0.025,
    ballRadius: 0.012,
    paddleOffset: 0.08,
  },
  physics: {
    baseSpeed: 5,
    speedPerLevel: 0.3,
    maxSpeed: 12,
    paddleSpeed: 10,
    maxBounceAngle: Math.PI / 3, // 60 degrees
    minYVelocity: 2,
  },
  scoring: {
    pointsByType: {
      normal: 10,
      strong: 25,
      metal: 50,
      indestructible: 0,
    },
    comboMultiplier: 0.25,
    comboTimeout: 2000,
    maxCombo: 10,
    levelBonus: 500,
  },
  gameplay: {
    startingLives: 3,
    maxLives: 5,
  },
  effects: {
    showTrail: true,
    trailLength: 6,
    trailOpacity: 0.4,
    destroyAnimationDuration: 100, // Quick fade out (100ms)
    screenShake: false,
  },
  storage: {
    persistHighScore: true,
    persistProgress: false,
    storageKey: 'brick-breaker',
  },
}

/** Game constants */
export const GAME_CONSTANTS = {
  TARGET_FPS: 60,
  FRAME_TIME: 1000 / 60,
  ASPECT_RATIO: 4 / 3,
  FONT_FAMILY: 'system-ui, -apple-system, sans-serif',
  /** Grace period after losing a life (ms) */
  RESPAWN_DELAY: 1000,
  /** Time before ball auto-launches (ms) */
  AUTO_LAUNCH_DELAY: 3000,
} as const

/** Keyboard bindings */
export const KEY_BINDINGS = {
  LEFT: ['ArrowLeft', 'KeyA'] as readonly string[],
  RIGHT: ['ArrowRight', 'KeyD'] as readonly string[],
  START: ['Space'] as readonly string[],
  PAUSE: ['Escape', 'KeyP'] as readonly string[],
  RESTART: ['KeyR'] as readonly string[],
} as const

/** Brick visual properties by type */
export const BRICK_VISUALS = {
  normal: {
    opacity: 1,
    pattern: null,
  },
  strong: {
    opacity: 0.85,
    pattern: 'diagonal',
  },
  metal: {
    opacity: 0.7,
    pattern: 'cross',
  },
  indestructible: {
    opacity: 0.4,
    pattern: 'solid',
  },
} as const
