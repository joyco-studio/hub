/** Game state machine states */
export type GameState = 'idle' | 'playing' | 'paused' | 'won' | 'lost' | 'levelComplete'

/** Brick types with different behaviors */
export type BrickType =
  | 'normal'      // Standard brick, 1 hit
  | 'strong'      // 2 hits to destroy
  | 'metal'       // 3 hits to destroy
  | 'indestructible' // Cannot be destroyed

/** 2D Vector for positions and velocities */
export interface Vector2D {
  x: number
  y: number
}

/** Rectangle bounds for collision detection */
export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

/** Collision side for proper bounce direction */
export type CollisionSide = 'top' | 'bottom' | 'left' | 'right' | 'corner'

/** Individual brick state */
export interface Brick {
  id: string
  row: number
  col: number
  bounds: Bounds
  type: BrickType
  health: number
  maxHealth: number
  destroyed: boolean
  destroyedAt?: number
  points: number
}

/** Brick definition in level data (simplified for level design) */
export interface BrickDefinition {
  /** Brick type - determines health and behavior */
  type: BrickType
  /** Optional custom points override */
  points?: number
}

/** Level definition */
export interface Level {
  /** Level number (1-indexed for display) */
  id: number
  /** Level name */
  name: string
  /** Grid of brick definitions. Use null for empty cells. */
  bricks: (BrickDefinition | null)[][]
  /** Ball speed multiplier for this level */
  speedMultiplier?: number
  /** Background color override */
  backgroundColor?: string
}

/** Paddle state */
export interface Paddle {
  bounds: Bounds
  targetX: number | null
  speed: number
}

/** Ball state */
export interface Ball {
  position: Vector2D
  velocity: Vector2D
  radius: number
  speed: number
  trail: Vector2D[]
  isLaunched: boolean
}

/** Complete game state (mutable, stored in refs) */
export interface GameEngine {
  state: GameState
  level: number
  score: number
  lives: number
  bricks: Brick[]
  paddle: Paddle
  ball: Ball
  combo: number
  lastHitTime: number
}

/** Immutable snapshot for React rendering */
export interface GameSnapshot {
  state: GameState
  level: number
  levelName: string
  score: number
  highScore: number
  lives: number
  bricks: Brick[]
  paddle: Paddle
  ball: Ball
  combo: number
  totalLevels: number
}

/** Color configuration using CSS custom properties */
export interface BrickBreakerColors {
  background: string
  paddle: string
  ball: string
  ballTrail: string
  text: string
  textMuted: string
  /** Colors by brick type */
  bricks: {
    normal: string
    strong: string
    metal: string
    indestructible: string
  }
}

/** Layout configuration */
export interface BrickBreakerLayout {
  /** Number of brick columns */
  cols: number
  /** Number of brick rows */
  rows: number
  /** Gap between bricks in pixels */
  brickGap: number
  /** Top padding for score area (ratio of height) */
  topPadding: number
  /** Side padding (ratio of width) */
  sidePadding: number
  /** Brick border radius in pixels */
  brickBorderRadius: number
  /** Paddle border radius in pixels (0 for sharp corners) */
  paddleBorderRadius: number | 'auto'
  /** Ball style: 'round', 'square', or 'custom' (requires renderBall) */
  ballStyle: 'round' | 'square' | 'custom'
  /** Custom ball renderer (used when ballStyle is 'custom') */
  renderBall?: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string
  ) => void
}

/** Size ratios relative to canvas dimensions */
export interface BrickBreakerSizing {
  paddleWidth: number
  paddleHeight: number
  ballRadius: number
  paddleOffset: number
}

/** Physics configuration */
export interface BrickBreakerPhysics {
  /** Base ball speed (pixels per frame at 60fps) */
  baseSpeed: number
  /** Speed increase per level */
  speedPerLevel: number
  /** Maximum ball speed cap */
  maxSpeed: number
  /** Paddle movement speed */
  paddleSpeed: number
  /** Max bounce angle from paddle edges (radians) */
  maxBounceAngle: number
  /** Minimum Y velocity to prevent horizontal loops */
  minYVelocity: number
}

/** Scoring configuration */
export interface BrickBreakerScoring {
  /** Points by brick type */
  pointsByType: {
    normal: number
    strong: number
    metal: number
    indestructible: number
  }
  /** Combo multiplier increment */
  comboMultiplier: number
  /** Combo timeout in ms */
  comboTimeout: number
  /** Max combo multiplier */
  maxCombo: number
  /** Points for completing a level */
  levelBonus: number
}

/** Gameplay configuration */
export interface BrickBreakerGameplay {
  /** Starting lives */
  startingLives: number
  /** Max lives */
  maxLives: number
}

/** Visual effects configuration */
export interface BrickBreakerEffects {
  showTrail: boolean
  trailLength: number
  trailOpacity: number
  destroyAnimationDuration: number
  /** Screen shake on brick hit */
  screenShake: boolean
}

/** Storage configuration */
export interface BrickBreakerStorage {
  persistHighScore: boolean
  persistProgress: boolean
  storageKey: string
}

/** Complete configuration object */
export interface BrickBreakerConfig {
  colors: BrickBreakerColors
  layout: BrickBreakerLayout
  sizing: BrickBreakerSizing
  physics: BrickBreakerPhysics
  scoring: BrickBreakerScoring
  gameplay: BrickBreakerGameplay
  effects: BrickBreakerEffects
  storage: BrickBreakerStorage
}

/** Props for the BrickBreaker component */
export interface BrickBreakerProps {
  /** Partial config overrides */
  config?: DeepPartial<BrickBreakerConfig>
  /** Custom levels (overrides built-in levels) */
  levels?: Level[]
  /** Starting level (1-indexed) */
  startLevel?: number
  /** Called when game ends */
  onGameEnd?: (result: GameEndResult) => void
  /** Called when score updates */
  onScoreChange?: (score: number, combo: number) => void
  /** Called when game state changes */
  onStateChange?: (state: GameState) => void
  /** Called when level changes */
  onLevelChange?: (level: number) => void
  /** Additional container className */
  className?: string
  /** Auto-focus canvas on mount */
  autoFocus?: boolean
  /** Show focus ring when canvas is focused (default: true) */
  showFocusRing?: boolean
}

/** Game end result */
export interface GameEndResult {
  won: boolean
  score: number
  highScore: number
  level: number
  totalLevels: number
  bricksDestroyed: number
  totalBricks: number
}

/** Collision detection result */
export interface CollisionResult {
  collided: boolean
  side?: CollisionSide
  normal?: Vector2D
  penetration?: number
  contactPoint?: Vector2D
}

/** Canvas dimensions */
export interface CanvasDimensions {
  width: number
  height: number
  dpr: number
}

/** Deep partial utility type */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
