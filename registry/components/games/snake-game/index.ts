// Component
export { SnakeGame } from './snake-game'

// Hook (for advanced usage)
export { useSnakeGame } from './use-snake-game'

// Types
export type {
  // Core game types
  GameState,
  GameSnapshot,
  GameEndResult,
  Direction,

  // Geometry
  Position,

  // Game objects
  Snake,
  Food,
  HighscoreEntry,

  // Configuration
  SnakeGameConfig,
  SnakeGameProps,
  SnakeGameColors,
  SnakeGameGrid,
  SnakeGamePhysics,
  SnakeGameScoring,
  SnakeGameStorage,

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
  DIRECTION_VECTORS,
  OPPOSITE_DIRECTIONS,
} from './config'

// Utility functions (for custom implementations)
export {
  mergeConfig,
  createInitialSnake,
  generateFood,
  positionsEqual,
  isWithinBounds,
  checkSelfCollision,
  resolveCssColor,
  formatHighscoreDate,
  calculateSpeed,
  storage,
} from './utils'

