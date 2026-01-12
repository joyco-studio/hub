// Component
export { BrickBreaker } from './brick-breaker'

// Hook (for advanced usage)
export { useBrickBreaker } from './use-brick-breaker'

// UI Components (for custom layouts)
export {
  useBrickBreakerUI,
  BrickBreakerUIProvider,
  BrickBreakerScore,
  BrickBreakerHighScore,
  BrickBreakerLevel,
  BrickBreakerLives,
  BrickBreakerHUD,
  BrickBreakerOverlay,
  BrickBreakerTitle,
  BrickBreakerMessage,
  BrickBreakerHint,
  BrickBreakerScoreDisplay,
  BrickBreakerActionButton,
  BrickBreakerDefaultUI,
} from './ui'

// Types
export type {
  // Core game types
  GameState,
  GameSnapshot,
  GameEndResult,

  // Geometry
  Vector2D,
  Bounds,
  CollisionSide,
  CollisionResult,

  // Game objects
  Brick,
  BrickType,
  BrickDefinition,
  Ball,
  Paddle,

  // Levels
  Level,

  // Configuration
  BrickBreakerConfig,
  BrickBreakerProps,
  BrickBreakerColors,
  BrickBreakerLayout,
  BrickBreakerSizing,
  BrickBreakerPhysics,
  BrickBreakerScoring,
  BrickBreakerGameplay,
  BrickBreakerEffects,
  BrickBreakerStorage,

  // Utilities
  DeepPartial,
  CanvasDimensions,
} from './types'

// Config presets
export {
  DEFAULT_CONFIG,
  DEFAULT_COLORS,
  GAME_CONSTANTS,
  KEY_BINDINGS,
  BRICK_VISUALS,
} from './config'

// Level utilities
export {
  DEFAULT_LEVELS,
  createLevelFromPattern,
  generateRandomLevel,
  getBrickHealth,
  isLevelCompletable,
  countDestructibleBricks,
} from './levels'

// Utility functions
export {
  mergeConfig,
  detectCollision,
  resolveBallBrickCollision,
  resolveBallPaddleCollision,
  resolveCssColor,
  formatScore,
  normalize,
  magnitude,
  scale,
  add,
  subtract,
  dot,
  reflect,
  clamp,
  lerp,
  storage,
} from './utils'
