import type { FlyPlaneColors, FlyPlaneConfig } from './types'

/** Logical canvas resolution (scaled responsively by CSS). 3:4 portrait. */
export const CANVAS = { width: 720, height: 960 } as const

/** Theme-aware default colors using shadcn CSS variables. */
export const DEFAULT_COLORS: FlyPlaneColors = {
  background: 'var(--muted)',
  player: 'var(--foreground)',
  playerBullet: 'var(--primary)',
  enemyBullet: 'var(--destructive)',
  enemy: 'var(--muted-foreground)',
  particle: 'var(--muted-foreground)',
  boss: 'var(--destructive)',
  bossHit: 'var(--foreground)',
  exhaust: ['#fde047', '#fb923c', '#ef4444'],
}

export const DEFAULT_CONFIG: FlyPlaneConfig = {
  colors: DEFAULT_COLORS,
  player: {
    width: 36,
    height: 36,
    speed: 540,
    fireInterval: 0.14,
    bulletSpeed: 680,
    invincibleTime: 1.6,
    startLives: 3,
    startX: 360,
    startY: 820,
    muzzleFlashTime: 0.06,
  },
  enemy: {
    bulletSpeed: 280,
    fireIntervalBase: 1.8,
    fireIntervalRamp: 0.12,
    fireIntervalMin: 0.6,
    grunt: { width: 42, height: 42, hp: 1, speedY: 110, score: 50 },
    weaver: { width: 50, height: 38, hp: 1, speedY: 90, score: 80, amplitude: 140, frequency: 1.6 },
    tank: { width: 70, height: 54, hp: 4, speedY: 60, score: 150 },
  },
  bullet: { width: 6, height: 18 },
  spawn: {
    baseEnemies: 8,
    enemiesPerLevel: 4,
    baseInterval: 1.1,
    rampPerLevel: 0.1,
    minInterval: 0.35,
  },
  particle: { countPerExplosion: 18, speed: 210, life: 0.6, sizeMin: 3, sizeMax: 8 },
  boss: {
    width: 180,
    height: 120,
    marginY: 135,
    speedX: 110,
    baseHp: 50,
    hpPerTier: 40,
    bulletSpeed: 240,
    fireIntervalBase: 0.55,
    fireIntervalRamp: 0.08,
    fireIntervalMin: 0.25,
    patternSwitch: 3.5,
    aimedCount: 3,
    aimedSpread: 0.35,
    radialCount: 16,
    scoreBonus: 1000,
    bonusPerTier: 500,
    hitSpark: 4,
  },
}

/** Game constants (not configurable). */
export const GAME_CONSTANTS = {
  bossEveryLevels: 10,
  fixedStep: 1 / 60,
  maxStepsPerFrame: 5,
  cellGap: 0.18,
  exhaustCells: 5,
  /** 3:4 portrait. */
  aspectRatio: CANVAS.width / CANVAS.height,
  storageKey: 'fly-plane-highscore',
} as const

/** Keyboard bindings (event.code). */
export const KEY_BINDINGS = {
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  fire: ['Space'],
  pause: ['KeyP', 'Escape'],
  skip: ['KeyN'],
} as const
