import { CANVAS, GAME_CONSTANTS } from './config'
import type {
  Boss,
  Bullet,
  Enemy,
  EnemyKind,
  SpaceInvadersConfig,
  InputState,
  Particle,
  Player,
  World,
} from './types'

// ---- Shared helpers ------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// ---- Collision -----------------------------------------------------------

/** Axis-aligned bounding-box overlap for center-positioned entities. Edge-touch is not an overlap. */
export function aabbOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return (
    Math.abs(a.x - b.x) * 2 < a.width + b.width &&
    Math.abs(a.y - b.y) * 2 < a.height + b.height
  )
}

// ---- Loop ----------------------------------------------------------------

export interface StepResult {
  steps: number
  remainder: number
}

/**
 * Given an accumulated time budget, return how many fixed steps to run and the
 * leftover time. Clamps to maxSteps and discards excess to avoid a spiral of
 * death after the tab is backgrounded.
 */
export function computeSteps(accumulator: number, fixedStep: number, maxSteps: number): StepResult {
  let steps = Math.floor(accumulator / fixedStep)
  if (steps > maxSteps) {
    return { steps: maxSteps, remainder: 0 }
  }
  if (steps < 0) {
    steps = 0
  }
  return { steps, remainder: accumulator - steps * fixedStep }
}

export interface LoopHandle {
  stop: () => void
}

/**
 * Run `onStep(fixedStep)` at a fixed cadence and `onRender()` once per
 * animation frame. Clamps delta to avoid a spiral of death after backgrounding.
 */
export function startLoop(
  onStep: (fixedStep: number) => void,
  onRender: () => void,
  fixedStep: number,
  maxSteps: number,
): LoopHandle {
  let accumulator = 0
  let last = performance.now()
  let rafId = 0
  let running = true

  const frame = (now: number): void => {
    if (!running) return
    accumulator += (now - last) / 1000
    last = now

    const { steps, remainder } = computeSteps(accumulator, fixedStep, maxSteps)
    for (let i = 0; i < steps; i += 1) {
      onStep(fixedStep)
    }
    accumulator = remainder

    onRender()
    rafId = requestAnimationFrame(frame)
  }

  rafId = requestAnimationFrame(frame)

  return {
    stop: () => {
      running = false
      cancelAnimationFrame(rafId)
    },
  }
}

// ---- Spawner -------------------------------------------------------------

function enemiesForLevel(level: number, config: SpaceInvadersConfig): number {
  return config.spawn.baseEnemies + (level - 1) * config.spawn.enemiesPerLevel
}

function spawnIntervalForLevel(level: number, config: SpaceInvadersConfig): number {
  const interval = config.spawn.baseInterval - (level - 1) * config.spawn.rampPerLevel
  return Math.max(config.spawn.minInterval, interval)
}

function enemyFireInterval(level: number, config: SpaceInvadersConfig): number {
  const interval = config.enemy.fireIntervalBase - (level - 1) * config.enemy.fireIntervalRamp
  return Math.max(config.enemy.fireIntervalMin, interval)
}

/**
 * Deterministic enemy-kind selection based on level and the enemy's index in
 * the wave. Determinism keeps spawning unit-testable (no Math.random).
 */
function pickEnemyKind(level: number, indexInWave: number): EnemyKind {
  if (level <= 1) {
    return 'grunt'
  }
  if (level >= 4 && indexInWave % 5 === 4) {
    return 'tank'
  }
  if (indexInWave % 3 === 1) {
    return 'weaver'
  }
  return 'grunt'
}

// ---- Player --------------------------------------------------------------

function createPlayer(config: SpaceInvadersConfig): Player {
  return {
    x: config.player.startX,
    y: config.player.startY,
    width: config.player.width,
    height: config.player.height,
    fireCooldown: 0,
    invincibleFor: config.player.invincibleTime,
    muzzleFlash: 0,
  }
}

/** Advances the player and returns any bullets fired this step. Mutates `player`. */
function updatePlayer(player: Player, input: InputState, dt: number, config: SpaceInvadersConfig): Bullet[] {
  const dx = (input.right ? 1 : 0) - (input.left ? 1 : 0)
  const dy = (input.down ? 1 : 0) - (input.up ? 1 : 0)
  player.x += dx * config.player.speed * dt
  player.y += dy * config.player.speed * dt

  const halfW = player.width / 2
  const halfH = player.height / 2
  player.x = clamp(player.x, halfW, CANVAS.width - halfW)
  player.y = clamp(player.y, halfH, CANVAS.height - halfH)

  if (player.invincibleFor > 0) {
    player.invincibleFor = Math.max(0, player.invincibleFor - dt)
  }
  if (player.fireCooldown > 0) {
    player.fireCooldown = Math.max(0, player.fireCooldown - dt)
  }
  if (player.muzzleFlash > 0) {
    player.muzzleFlash = Math.max(0, player.muzzleFlash - dt)
  }

  const bullets: Bullet[] = []
  if (input.fire && player.fireCooldown === 0) {
    bullets.push({
      x: player.x,
      y: player.y - halfH,
      width: config.bullet.width,
      height: config.bullet.height,
      vx: 0,
      vy: -config.player.bulletSpeed,
      owner: 'player',
    })
    player.fireCooldown = config.player.fireInterval
    player.muzzleFlash = config.player.muzzleFlashTime
  }
  return bullets
}

/** Resets position and grants invincibility after losing a life. Mutates `player`. */
function respawnPlayer(player: Player, config: SpaceInvadersConfig): void {
  player.x = config.player.startX
  player.y = config.player.startY
  player.fireCooldown = 0
  player.invincibleFor = config.player.invincibleTime
}

// ---- Bullets -------------------------------------------------------------

/** Advances bullets and returns the list with off-screen bullets removed. Mutates positions. */
function updateBullets(bullets: Bullet[], dt: number): Bullet[] {
  for (const b of bullets) {
    b.x += b.vx * dt
    b.y += b.vy * dt
  }
  const margin = 40
  const xMargin = 60
  return bullets.filter(
    (b) =>
      b.y > -margin &&
      b.y < CANVAS.height + margin &&
      b.x > -xMargin &&
      b.x < CANVAS.width + xMargin,
  )
}

// ---- Enemies -------------------------------------------------------------

function statsFor(
  kind: EnemyKind,
  config: SpaceInvadersConfig,
): { width: number; height: number; hp: number; speedY: number } {
  switch (kind) {
    case 'weaver':
      return config.enemy.weaver
    case 'tank':
      return config.enemy.tank
    case 'grunt':
    default:
      return config.enemy.grunt
  }
}

function createEnemy(kind: EnemyKind, spawnX: number, level: number, config: SpaceInvadersConfig): Enemy {
  const stats = statsFor(kind, config)
  return {
    kind,
    x: spawnX,
    y: -stats.height,
    width: stats.width,
    height: stats.height,
    hp: stats.hp,
    speedY: stats.speedY,
    age: 0,
    spawnX,
    fireCooldown: enemyFireInterval(level, config),
  }
}

/** Advances the enemy and returns a fired bullet or null. Mutates `enemy`. */
function updateEnemy(
  enemy: Enemy,
  player: Player,
  level: number,
  dt: number,
  config: SpaceInvadersConfig,
): Bullet | null {
  enemy.age += dt
  enemy.y += enemy.speedY * dt

  if (enemy.kind === 'weaver') {
    const { amplitude, frequency } = config.enemy.weaver
    const halfW = enemy.width / 2
    const offset = Math.sin(enemy.age * frequency) * amplitude
    enemy.x = clamp(enemy.spawnX + offset, halfW, CANVAS.width - halfW)
  }

  enemy.fireCooldown -= dt
  if (enemy.fireCooldown > 0) {
    return null
  }
  enemy.fireCooldown = enemyFireInterval(level, config)

  // Aim toward the player, but scatter within a cone so shots head your way
  // without tracking you perfectly.
  const dx = player.x - enemy.x
  const dy = player.y - enemy.y
  const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * config.enemy.aimSpread
  const speed = config.enemy.bulletSpeed
  return {
    x: enemy.x,
    y: enemy.y + enemy.height / 2,
    width: config.bullet.width,
    height: config.bullet.height,
    vx: Math.cos(angle) * speed,
    vy: Math.max(speed * 0.2, Math.sin(angle) * speed), // always heads downward (~20% of bulletSpeed floor)
    owner: 'enemy',
  }
}

// ---- Particles -----------------------------------------------------------

function createExplosion(x: number, y: number, config: SpaceInvadersConfig): Particle[] {
  const count = config.particle.countPerExplosion
  const sizeRange = config.particle.sizeMax - config.particle.sizeMin
  const particles: Particle[] = []
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2
    // Deterministic per-index variety (no RNG keeps explosions unit-testable):
    // golden-ratio sequences scatter speed, size, and shade so the burst reads
    // as chaotic grayscale debris rather than a uniform ring.
    const speedMul = 0.45 + ((i * 0.6180339887) % 1) * 0.9 // 0.45..1.35
    const size = config.particle.sizeMin + ((i * 7) % (sizeRange + 1))
    const shade = (i * 0.3819660113) % 1 // 0..1
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * config.particle.speed * speedMul,
      vy: Math.sin(angle) * config.particle.speed * speedMul,
      life: config.particle.life,
      maxLife: config.particle.life,
      size,
      shade,
    })
  }
  return particles
}

/** Advances particles and returns the list with dead ones removed. Mutates positions/life. */
function updateParticles(particles: Particle[], dt: number): Particle[] {
  for (const p of particles) {
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.life -= dt
  }
  return particles.filter((p) => p.life > 0)
}

// ---- Boss ----------------------------------------------------------------

export function tierForLevel(level: number): number {
  return Math.max(1, Math.floor(level / GAME_CONSTANTS.bossEveryLevels))
}

export function createBoss(level: number, config: SpaceInvadersConfig): Boss {
  const tier = tierForLevel(level)
  const maxHp = config.boss.baseHp + (tier - 1) * config.boss.hpPerTier
  const fireInterval = Math.max(
    config.boss.fireIntervalMin,
    config.boss.fireIntervalBase - (tier - 1) * config.boss.fireIntervalRamp,
  )
  return {
    x: CANVAS.width / 2,
    y: config.boss.marginY + config.boss.height / 2,
    width: config.boss.width,
    height: config.boss.height,
    hp: maxHp,
    maxHp,
    dirX: 1,
    age: 0,
    fireCooldown: fireInterval,
    fireInterval,
    patternTimer: config.boss.patternSwitch,
    pattern: 'aimed',
    hitFlash: 0,
  }
}

function bullet(x: number, y: number, vx: number, vy: number, config: SpaceInvadersConfig): Bullet {
  return {
    x,
    y,
    width: config.bullet.width,
    height: config.bullet.height,
    vx,
    vy,
    owner: 'enemy',
  }
}

function aimedVolley(boss: Boss, player: Player, config: SpaceInvadersConfig): Bullet[] {
  const muzzleY = boss.y + boss.height / 2
  const dx = player.x - boss.x
  const dy = player.y - muzzleY
  // Aim at the player with a random wobble so the volley isn't dead-on every time.
  const baseAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * config.boss.aimJitter
  const { aimedCount, aimedSpread, bulletSpeed } = config.boss
  const bullets: Bullet[] = []
  const denom = Math.max(1, aimedCount - 1)
  for (let i = 0; i < aimedCount; i += 1) {
    const t = (i - (aimedCount - 1) / 2) / denom // centered: -0.5..0.5 (0 when single)
    const angle = baseAngle + t * aimedSpread
    bullets.push(bullet(boss.x, muzzleY, Math.cos(angle) * bulletSpeed, Math.sin(angle) * bulletSpeed, config))
  }
  return bullets
}

function radialVolley(boss: Boss, config: SpaceInvadersConfig): Bullet[] {
  const muzzleY = boss.y + boss.height / 2
  const { radialCount, bulletSpeed } = config.boss
  const bullets: Bullet[] = []
  for (let i = 0; i < radialCount; i += 1) {
    const angle = (i / radialCount) * Math.PI * 2
    bullets.push(bullet(boss.x, muzzleY, Math.cos(angle) * bulletSpeed, Math.sin(angle) * bulletSpeed, config))
  }
  return bullets
}

/** Advances the boss and returns any bullets fired this step. Mutates `boss`. */
function updateBoss(boss: Boss, player: Player, dt: number, config: SpaceInvadersConfig): Bullet[] {
  boss.age += dt
  if (boss.hitFlash > 0) {
    boss.hitFlash = Math.max(0, boss.hitFlash - dt)
  }

  // Side-to-side movement, bouncing off the playfield edges.
  const halfW = boss.width / 2
  boss.x += boss.dirX * config.boss.speedX * dt
  if (boss.x <= halfW) {
    boss.x = halfW
    boss.dirX = 1
  } else if (boss.x >= CANVAS.width - halfW) {
    boss.x = CANVAS.width - halfW
    boss.dirX = -1
  }
  boss.x = clamp(boss.x, halfW, CANVAS.width - halfW)

  // Pattern switching.
  boss.patternTimer -= dt
  if (boss.patternTimer <= 0) {
    boss.pattern = boss.pattern === 'aimed' ? 'radial' : 'aimed'
    boss.patternTimer = config.boss.patternSwitch
  }

  // Firing.
  boss.fireCooldown -= dt
  if (boss.fireCooldown > 0) {
    return []
  }
  boss.fireCooldown = boss.fireInterval
  return boss.pattern === 'aimed' ? aimedVolley(boss, player, config) : radialVolley(boss, config)
}

// ---- World ---------------------------------------------------------------

function scoreForKind(kind: EnemyKind, config: SpaceInvadersConfig): number {
  switch (kind) {
    case 'weaver':
      return config.enemy.weaver.score
    case 'tank':
      return config.enemy.tank.score
    case 'grunt':
    default:
      return config.enemy.grunt.score
  }
}

/** Configures `world` for `level`: a boss-only level or a normal wave. Mutates `world`. */
function startLevel(world: World, level: number, config: SpaceInvadersConfig): void {
  world.level = level
  if (level % GAME_CONSTANTS.bossEveryLevels === 0) {
    world.boss = createBoss(level, config)
    world.enemiesToSpawn = 0
    world.spawnTimer = 0
  } else {
    world.boss = null
    world.enemiesToSpawn = enemiesForLevel(level, config)
    world.spawnTimer = spawnIntervalForLevel(level, config)
  }
}

/** Debug helper: clears the field and jumps to the next level immediately. Mutates `world`. */
export function skipToNextLevel(world: World, config: SpaceInvadersConfig): void {
  if (world.phase !== 'playing') return
  world.enemies = []
  world.boss = null
  world.bullets = world.bullets.filter((b) => b.owner === 'player')
  startLevel(world, world.level + 1, config)
}

export function createWorld(highScore: number, config: SpaceInvadersConfig): World {
  const world: World = {
    phase: 'playing',
    player: createPlayer(config),
    bullets: [],
    enemies: [],
    particles: [],
    boss: null,
    score: 0,
    lives: config.player.startLives,
    level: 1,
    highScore,
    spawnTimer: 0,
    enemiesToSpawn: 0,
    frame: 0,
  }
  startLevel(world, 1, config)
  return world
}

function spawnX(level: number, index: number): number {
  // Deterministic spread across the playfield width (golden-ratio, no RNG).
  const margin = 60
  const span = CANVAS.width - margin * 2
  const t = (((index * 0.618 + level * 0.137) % 1) + 1) % 1
  return margin + t * span
}

function loseLife(world: World, config: SpaceInvadersConfig): void {
  world.lives -= 1
  world.particles.push(...createExplosion(world.player.x, world.player.y, config))
  if (world.lives <= 0) {
    world.phase = 'gameOver'
    if (world.score > world.highScore) {
      world.highScore = world.score
    }
    return
  }
  respawnPlayer(world.player, config)
}

/** Advances the world by one fixed step. Mutates `world`. */
export function stepWorld(world: World, input: InputState, dt: number, config: SpaceInvadersConfig): void {
  if (world.phase !== 'playing') {
    return
  }

  world.frame += 1 // advances sprite/flame animation

  // Player + player bullets.
  world.bullets.push(...updatePlayer(world.player, input, dt, config))

  // Spawn enemies over time.
  if (world.enemiesToSpawn > 0) {
    world.spawnTimer -= dt
    if (world.spawnTimer <= 0) {
      const index = enemiesForLevel(world.level, config) - world.enemiesToSpawn
      const kind = pickEnemyKind(world.level, index)
      world.enemies.push(createEnemy(kind, spawnX(world.level, index), world.level, config))
      world.enemiesToSpawn -= 1
      world.spawnTimer = spawnIntervalForLevel(world.level, config)
    }
  }

  // Enemies + enemy bullets.
  for (const enemy of world.enemies) {
    const fired = updateEnemy(enemy, world.player, world.level, dt, config)
    if (fired) {
      world.bullets.push(fired)
    }
  }
  // Cull enemies that left the bottom.
  world.enemies = world.enemies.filter((e) => e.y - e.height / 2 < CANVAS.height + 40)

  // Boss: move, fire, and feed its bullets into the shared bullet list.
  if (world.boss) {
    world.bullets.push(...updateBoss(world.boss, world.player, dt, config))
  }

  // Move + cull off-screen bullets.
  world.bullets = updateBullets(world.bullets, dt)

  // Player bullets vs enemies (each bullet damages at most one enemy).
  const spentBullets = new Set<Bullet>()
  for (const bullet of world.bullets) {
    if (bullet.owner !== 'player') {
      continue
    }
    for (const enemy of world.enemies) {
      if (enemy.hp > 0 && aabbOverlap(bullet, enemy)) {
        enemy.hp -= 1
        spentBullets.add(bullet)
        if (enemy.hp <= 0) {
          world.score += scoreForKind(enemy.kind, config)
          world.particles.push(...createExplosion(enemy.x, enemy.y, config))
        }
        break
      }
    }
  }
  world.bullets = world.bullets.filter((b) => !spentBullets.has(b))
  world.enemies = world.enemies.filter((e) => e.hp > 0)

  // Player bullets vs the boss.
  if (world.boss) {
    const boss = world.boss
    const bossSpent = new Set<Bullet>()
    for (const b of world.bullets) {
      if (b.owner === 'player' && aabbOverlap(b, boss)) {
        boss.hp -= 1
        boss.hitFlash = 0.06
        bossSpent.add(b)
        const sparks = createExplosion(b.x, b.y, config).slice(0, config.boss.hitSpark)
        world.particles.push(...sparks)
      }
    }
    if (bossSpent.size > 0) {
      world.bullets = world.bullets.filter((b) => !bossSpent.has(b))
    }
    if (boss.hp <= 0) {
      world.particles.push(...createExplosion(boss.x, boss.y, config))
      world.particles.push(...createExplosion(boss.x - boss.width / 4, boss.y, config))
      world.particles.push(...createExplosion(boss.x + boss.width / 4, boss.y, config))
      world.score += config.boss.scoreBonus + (tierForLevel(world.level) - 1) * config.boss.bonusPerTier
      world.lives += 1
      world.boss = null
    }
  }

  // Enemy bullets and enemy bodies vs the player.
  if (world.player.invincibleFor === 0) {
    const hittingBullets = new Set<Bullet>(
      world.bullets.filter((b) => b.owner === 'enemy' && aabbOverlap(b, world.player)),
    )
    const rammingEnemies = world.enemies.filter((e) => aabbOverlap(e, world.player))
    if (hittingBullets.size > 0 || rammingEnemies.length > 0) {
      world.bullets = world.bullets.filter((b) => !hittingBullets.has(b))
      // Ramming an enemy destroys it too (mutual destruction).
      for (const enemy of rammingEnemies) {
        world.particles.push(...createExplosion(enemy.x, enemy.y, config))
      }
      const ramming = new Set(rammingEnemies)
      world.enemies = world.enemies.filter((e) => !ramming.has(e))
      loseLife(world, config)
    }
  }

  // Boss body vs the player (the boss is unharmed by ramming).
  if (
    world.phase === 'playing' &&
    world.boss &&
    world.player.invincibleFor === 0 &&
    aabbOverlap(world.boss, world.player)
  ) {
    loseLife(world, config)
  }

  // Particles.
  world.particles = updateParticles(world.particles, dt)

  // Level complete: everything spawned, no enemies, and no boss remaining.
  if (
    world.phase === 'playing' &&
    world.enemiesToSpawn === 0 &&
    world.enemies.length === 0 &&
    world.boss === null
  ) {
    startLevel(world, world.level + 1, config)
  }
}
