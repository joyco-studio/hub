// ---- Geometry & entities -------------------------------------------------

export interface Entity {
  x: number // center x
  y: number // center y
  width: number
  height: number
}

export type EnemyKind = 'grunt' | 'weaver' | 'tank'

export interface Enemy extends Entity {
  kind: EnemyKind
  hp: number
  speedY: number
  age: number
  spawnX: number
  fireCooldown: number
}

export type BulletOwner = 'player' | 'enemy'

export interface Bullet extends Entity {
  vx: number
  vy: number
  owner: BulletOwner
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  shade: number
}

export interface Player extends Entity {
  fireCooldown: number
  invincibleFor: number
  muzzleFlash: number
}

export type BossPattern = 'aimed' | 'radial'

export interface Boss extends Entity {
  hp: number
  maxHp: number
  dirX: number
  age: number
  fireCooldown: number
  fireInterval: number
  patternTimer: number
  pattern: BossPattern
  hitFlash: number
}

export type GameState = 'idle' | 'playing' | 'paused' | 'gameOver'

export interface World {
  phase: GameState
  player: Player
  bullets: Bullet[]
  enemies: Enemy[]
  boss: Boss | null
  particles: Particle[]
  score: number
  lives: number
  level: number
  highScore: number
  spawnTimer: number
  enemiesToSpawn: number
  frame: number
}

/** HUD-relevant snapshot, pushed to React only when a value changes. */
export interface HudState {
  score: number
  lives: number
  level: number
  highScore: number
  phase: GameState
}

// ---- Input ---------------------------------------------------------------

export interface InputState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  fire: boolean
}

// ---- Configuration -------------------------------------------------------

/** Theme-aware colors (CSS variables or any valid CSS color). */
export interface SpaceInvadersColors {
  background: string
  player: string
  playerBullet: string
  enemyBullet: string
  enemy: string
  particle: string
  boss: string
  bossHit: string
  /** Engine flame gradient, core → tail. */
  exhaust: readonly [string, string, string]
}

export interface SpaceInvadersConfig {
  colors: SpaceInvadersColors
  player: {
    width: number
    height: number
    speed: number
    fireInterval: number
    bulletSpeed: number
    invincibleTime: number
    startLives: number
    startX: number
    startY: number
    muzzleFlashTime: number
  }
  enemy: {
    bulletSpeed: number
    fireIntervalBase: number
    fireIntervalRamp: number
    fireIntervalMin: number
    aimSpread: number // radians: random cone around the aim direction (0 = perfectly aimed)
    grunt: { width: number; height: number; hp: number; speedY: number; score: number }
    weaver: {
      width: number
      height: number
      hp: number
      speedY: number
      score: number
      amplitude: number
      frequency: number
    }
    tank: { width: number; height: number; hp: number; speedY: number; score: number }
  }
  bullet: { width: number; height: number }
  spawn: {
    baseEnemies: number
    enemiesPerLevel: number
    baseInterval: number
    rampPerLevel: number
    minInterval: number
  }
  particle: { countPerExplosion: number; speed: number; life: number; sizeMin: number; sizeMax: number }
  boss: {
    width: number
    height: number
    marginY: number
    speedX: number
    baseHp: number
    hpPerTier: number
    bulletSpeed: number
    fireIntervalBase: number
    fireIntervalRamp: number
    fireIntervalMin: number
    patternSwitch: number
    aimedCount: number
    aimedSpread: number
    aimJitter: number // radians: random offset applied to the aimed volley's base angle
    radialCount: number
    scoreBonus: number
    bonusPerTier: number
    hitSpark: number
  }
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export interface SpaceInvadersProps {
  config?: DeepPartial<SpaceInvadersConfig>
  showControls?: boolean
  onScoreChange?: (score: number) => void
  onStateChange?: (state: GameState) => void
  onGameEnd?: (result: { score: number; level: number }) => void
  className?: string
}
