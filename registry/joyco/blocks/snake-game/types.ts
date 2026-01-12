/** Game state machine states */
export type GameState = 'idle' | 'playing' | 'paused' | 'gameOver'

/** Direction the snake can move */
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

/** 2D position on the grid */
export interface Position {
  x: number
  y: number
}

/** High score entry */
export interface HighscoreEntry {
  score: number
  date: string
}

/** Snake state */
export interface Snake {
  segments: Position[]
  direction: Direction
  nextDirection: Direction
}

/** Food state */
export interface Food {
  position: Position
}

/** Complete game state snapshot */
export interface GameSnapshot {
  state: GameState
  snake: Snake
  food: Food
  score: number
  highscores: HighscoreEntry[]
}

/** Color configuration using CSS custom properties */
export interface SnakeGameColors {
  /** Snake body color - default: 'var(--foreground)' */
  snake: string
  /** Food color - default: 'var(--primary)' */
  food: string
  /** Canvas background - default: 'var(--muted)' */
  background: string
}

/** Grid configuration */
export interface SnakeGameGrid {
  /** Grid size (cells per side) - default: 20 */
  size: number
}

/** Physics/speed configuration */
export interface SnakeGamePhysics {
  /** Initial game speed in ms per move - default: 150 */
  initialSpeed: number
  /** Speed decrease per food eaten (faster) - default: 2 */
  speedIncrement: number
  /** Minimum speed cap in ms - default: 50 */
  minSpeed: number
}

/** Scoring configuration */
export interface SnakeGameScoring {
  /** Points per food eaten - default: 1 */
  pointsPerFood: number
}

/** Storage configuration */
export interface SnakeGameStorage {
  /** localStorage key for high scores */
  storageKey: string
  /** Maximum high scores to keep */
  maxHighscores: number
}

/** Complete configuration object */
export interface SnakeGameConfig {
  colors: SnakeGameColors
  grid: SnakeGameGrid
  physics: SnakeGamePhysics
  scoring: SnakeGameScoring
  storage: SnakeGameStorage
}

/** Props for the SnakeGame component */
export interface SnakeGameProps {
  /** Partial config overrides (deep merged with defaults) */
  config?: DeepPartial<SnakeGameConfig>
  /** Called when game ends */
  onGameEnd?: (result: GameEndResult) => void
  /** Called when score updates */
  onScoreChange?: (score: number) => void
  /** Called when game state changes */
  onStateChange?: (state: GameState) => void
  /** Additional container className */
  className?: string
  /** Show built-in UI controls - default: true */
  showControls?: boolean
  /** Show high scores list - default: true */
  showHighscores?: boolean
}

/** Game end result passed to onGameEnd callback */
export interface GameEndResult {
  score: number
  highscores: HighscoreEntry[]
  snakeLength: number
}

/** Canvas dimensions */
export interface CanvasDimensions {
  size: number
  cellSize: number
  dpr: number
}

/** Deep partial utility type */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

