import { CANVAS, GAME_CONSTANTS } from './config'
import type { Boss, Enemy, Player, World } from './types'

export interface ResolvedColors {
  background: string
  player: string
  playerBullet: string
  enemyBullet: string
  enemy: string
  particle: string
  boss: string
  bossHit: string
  exhaust: readonly [string, string, string]
}

type SpriteGrid = readonly (readonly number[])[]

const shipSprite: SpriteGrid = [
  [0, 0, 1, 0, 0],
  [0, 1, 1, 1, 0],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [1, 0, 1, 0, 1],
]

// Angular fighter with three turret prongs, diving point-down at the player.
const gruntSprite: SpriteGrid = [
  [1, 0, 1, 0, 1],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 0],
]

// Winged interceptor with a central spike. Symmetric, point-down.
const weaverSprite: SpriteGrid = [
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 0, 1, 0, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
]

// Bulky battlecruiser with twin cannon gaps. Symmetric.
const tankSprite: SpriteGrid = [
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 1, 1, 0, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
]

const bossSprite: SpriteGrid = [
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1],
  [0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0],
  [0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0],
]

function drawSprite(
  ctx: CanvasRenderingContext2D,
  grid: SpriteGrid,
  cx: number,
  cy: number,
  w: number,
  h: number,
  color: string,
): void {
  const rows = grid.length
  const cols = grid[0].length
  const cw = w / cols
  const ch = h / rows
  const gapX = cw * GAME_CONSTANTS.cellGap
  const gapY = ch * GAME_CONSTANTS.cellGap
  const left = cx - w / 2
  const top = cy - h / 2
  ctx.fillStyle = color
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (grid[r][c]) {
        ctx.fillRect(
          Math.round(left + c * cw + gapX / 2),
          Math.round(top + r * ch + gapY / 2),
          Math.max(1, Math.round(cw - gapX)),
          Math.max(1, Math.round(ch - gapY)),
        )
      }
    }
  }
}

function enemyVisual(enemy: Enemy): SpriteGrid {
  switch (enemy.kind) {
    case 'weaver':
      return weaverSprite
    case 'tank':
      return tankSprite
    default:
      return gruntSprite
  }
}

/** Flickering engine flame emitted from the rear (bottom) of the ship. */
function drawExhaust(
  ctx: CanvasRenderingContext2D,
  player: Player,
  frame: number,
  colors: ResolvedColors,
): void {
  const cell = player.width / GAME_CONSTANTS.exhaustCells
  const startY = player.y + player.height / 2 - cell * 0.4
  const phase = Math.floor(frame / 3) % 2 // toggles flame shape every 3 frames
  const tongues = [
    { col: -1, segs: phase === 0 ? 2 : 1 },
    { col: 0, segs: phase === 0 ? 3 : 4 },
    { col: 1, segs: phase === 0 ? 2 : 1 },
  ]
  for (const tongue of tongues) {
    for (let s = 0; s < tongue.segs; s += 1) {
      const size = cell * (1 - s * 0.18)
      ctx.fillStyle = colors.exhaust[Math.min(s, colors.exhaust.length - 1)]
      ctx.fillRect(
        Math.round(player.x + tongue.col * cell - size / 2),
        Math.round(startY + s * cell * 0.85),
        Math.max(2, Math.round(size)),
        Math.max(2, Math.round(size * 0.9)),
      )
    }
  }
}

function drawMuzzleFlash(
  ctx: CanvasRenderingContext2D,
  player: Player,
  colors: ResolvedColors,
): void {
  const cell = player.width / GAME_CONSTANTS.exhaustCells
  const noseY = player.y - player.height / 2 - cell * 0.4
  ctx.fillStyle = colors.playerBullet
  // A small 3-cell cross burst at the nose.
  ctx.fillRect(
    Math.round(player.x - cell / 2),
    Math.round(noseY - cell),
    Math.max(2, Math.round(cell)),
    Math.max(2, Math.round(cell)),
  )
  ctx.fillRect(
    Math.round(player.x - cell),
    Math.round(noseY),
    Math.max(2, Math.round(cell * 0.6)),
    Math.max(2, Math.round(cell * 0.8)),
  )
  ctx.fillRect(
    Math.round(player.x + cell * 0.4),
    Math.round(noseY),
    Math.max(2, Math.round(cell * 0.6)),
    Math.max(2, Math.round(cell * 0.8)),
  )
}

const ROMAN = ['', '', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

/** Boss name, with a tier numeral for the tougher bosses at level 20, 30, ... */
function bossName(level: number): string {
  const tier = Math.floor(level / GAME_CONSTANTS.bossEveryLevels)
  if (tier <= 1) {
    return 'REBEL CRUSHER'
  }
  return `REBEL CRUSHER ${ROMAN[tier] ?? tier}`
}

function drawBoss(
  ctx: CanvasRenderingContext2D,
  boss: Boss,
  name: string,
  colors: ResolvedColors,
): void {
  const color = boss.hitFlash > 0 ? colors.bossHit : colors.boss
  drawSprite(ctx, bossSprite, boss.x, boss.y, boss.width, boss.height, color)

  // Health bar, placed clearly below the HUD row so the two never overlap.
  const margin = 24
  const barWidth = CANVAS.width - margin * 2
  const barHeight = 14
  const barY = 96

  // Boss name — large and bold so it reads clearly.
  ctx.fillStyle = colors.bossHit
  ctx.font = "700 20px ui-monospace, monospace"
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(name, margin, barY - 10)

  ctx.fillStyle = colors.enemy
  ctx.globalAlpha = 0.25
  ctx.fillRect(margin, barY, barWidth, barHeight)
  ctx.globalAlpha = 1
  const ratio = Math.max(0, boss.hp) / boss.maxHp
  ctx.fillStyle = colors.boss
  ctx.fillRect(margin, barY, Math.round(barWidth * ratio), barHeight)
}

export function renderWorld(
  ctx: CanvasRenderingContext2D,
  world: World,
  colors: ResolvedColors,
): void {
  ctx.fillStyle = colors.background
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height)

  for (const b of world.bullets) {
    ctx.fillStyle = b.owner === 'player' ? colors.playerBullet : colors.enemyBullet
    ctx.fillRect(b.x - b.width / 2, b.y - b.height / 2, b.width, b.height)
  }

  for (const enemy of world.enemies) {
    drawSprite(ctx, enemyVisual(enemy), enemy.x, enemy.y, enemy.width, enemy.height, colors.enemy)
  }

  if (world.boss) {
    drawBoss(ctx, world.boss, bossName(world.level), colors)
  }

  // Explosion debris: themed blocks that fade as they age.
  for (const p of world.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife) * (0.4 + 0.6 * p.shade)
    ctx.fillStyle = colors.particle
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
  }
  ctx.globalAlpha = 1

  // Blink the player while invincible.
  const blinkHidden =
    world.player.invincibleFor > 0 && Math.floor(world.player.invincibleFor * 10) % 2 === 0
  if (!blinkHidden) {
    if (world.phase === 'playing') {
      drawExhaust(ctx, world.player, world.frame, colors)
    }
    if (world.player.muzzleFlash > 0) {
      drawMuzzleFlash(ctx, world.player, colors)
    }
    drawSprite(
      ctx,
      shipSprite,
      world.player.x,
      world.player.y,
      world.player.width,
      world.player.height,
      colors.player,
    )
  }
}
