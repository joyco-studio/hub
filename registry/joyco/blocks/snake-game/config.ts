import type { SnakeGameConfig, SnakeGameColors } from './types'

/** Theme-aware default colors using CSS variables */
export const DEFAULT_COLORS: SnakeGameColors = {
  snake: 'var(--foreground)',
  food: 'var(--primary)',
  background: 'var(--muted)',
}

/** Complete default configuration */
export const DEFAULT_CONFIG: SnakeGameConfig = {
  colors: DEFAULT_COLORS,
  grid: {
    size: 20,
  },
  physics: {
    initialSpeed: 150,
    speedIncrement: 2,
    minSpeed: 50,
  },
  scoring: {
    pointsPerFood: 1,
  },
  storage: {
    storageKey: 'snake-highscores',
    maxHighscores: 4,
  },
}

/** Game constants (not configurable) */
export const GAME_CONSTANTS = {
  /** Initial snake length */
  INITIAL_SNAKE_LENGTH: 3,
  /** Minimum swipe distance for touch controls */
  MIN_SWIPE_DISTANCE: 30,
  /** System font stack for canvas text */
  FONT_FAMILY: 'system-ui, -apple-system, sans-serif',
} as const

/** Keyboard bindings */
export const KEY_BINDINGS = {
  UP: ['ArrowUp', 'KeyW', 'w', 'W'] as readonly string[],
  DOWN: ['ArrowDown', 'KeyS', 's', 'S'] as readonly string[],
  LEFT: ['ArrowLeft', 'KeyA', 'a', 'A'] as readonly string[],
  RIGHT: ['ArrowRight', 'KeyD', 'd', 'D'] as readonly string[],
  PAUSE: ['Escape', 'KeyP', 'p', 'P'] as readonly string[],
  START: ['Space', ' '] as readonly string[],
} as const

/** Direction vectors for movement */
export const DIRECTION_VECTORS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
} as const

/** Opposite directions (for preventing 180° turns) */
export const OPPOSITE_DIRECTIONS = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
} as const

