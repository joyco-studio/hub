import type { Level, BrickDefinition } from './types'

/** Shorthand brick definitions for level design */
const N: BrickDefinition = { type: 'normal' }
const S: BrickDefinition = { type: 'strong' }
const M: BrickDefinition = { type: 'metal' }
const X: BrickDefinition = { type: 'indestructible' }
const _: null = null // Empty space

/**
 * Built-in levels for the brick breaker game.
 * Each level is a 2D array where:
 * - N = normal brick (1 hit)
 * - S = strong brick (2 hits)
 * - M = metal brick (3 hits)
 * - X = indestructible brick
 * - _ = empty space
 */
export const DEFAULT_LEVELS: Level[] = [
  // Level 1: Introduction - Simple rows
  {
    id: 1,
    name: 'First Steps',
    speedMultiplier: 1.0,
    bricks: [
      [N, N, N, N, N, N, N, N],
      [N, N, N, N, N, N, N, N],
      [N, N, N, N, N, N, N, N],
      [_, _, _, _, _, _, _, _],
      [_, _, _, _, _, _, _, _],
    ],
  },

  // Level 2: Checkerboard
  {
    id: 2,
    name: 'Checkerboard',
    speedMultiplier: 1.0,
    bricks: [
      [N, _, N, _, N, _, N, _],
      [_, N, _, N, _, N, _, N],
      [N, _, N, _, N, _, N, _],
      [_, N, _, N, _, N, _, N],
      [N, _, N, _, N, _, N, _],
    ],
  },

  // Level 3: Pyramid
  {
    id: 3,
    name: 'Pyramid',
    speedMultiplier: 1.05,
    bricks: [
      [_, _, _, N, N, _, _, _],
      [_, _, N, N, N, N, _, _],
      [_, N, N, N, N, N, N, _],
      [N, N, N, N, N, N, N, N],
      [_, _, _, _, _, _, _, _],
    ],
  },

  // Level 4: Introducing Strong Bricks
  {
    id: 4,
    name: 'Getting Stronger',
    speedMultiplier: 1.05,
    bricks: [
      [N, N, N, N, N, N, N, N],
      [N, S, S, S, S, S, S, N],
      [N, S, N, N, N, N, S, N],
      [N, S, S, S, S, S, S, N],
      [N, N, N, N, N, N, N, N],
    ],
  },

  // Level 5: Diamond
  {
    id: 5,
    name: 'Diamond',
    speedMultiplier: 1.1,
    bricks: [
      [_, _, _, S, S, _, _, _],
      [_, _, S, N, N, S, _, _],
      [_, S, N, N, N, N, S, _],
      [_, _, S, N, N, S, _, _],
      [_, _, _, S, S, _, _, _],
    ],
  },

  // Level 6: Walls
  {
    id: 6,
    name: 'The Walls',
    speedMultiplier: 1.1,
    bricks: [
      [S, _, N, N, N, N, _, S],
      [S, _, N, N, N, N, _, S],
      [S, _, N, N, N, N, _, S],
      [S, _, N, N, N, N, _, S],
      [S, _, N, N, N, N, _, S],
    ],
  },

  // Level 7: Introducing Metal
  {
    id: 7,
    name: 'Metal Core',
    speedMultiplier: 1.15,
    bricks: [
      [N, N, N, N, N, N, N, N],
      [N, S, S, S, S, S, S, N],
      [N, S, M, M, M, M, S, N],
      [N, S, S, S, S, S, S, N],
      [N, N, N, N, N, N, N, N],
    ],
  },

  // Level 8: Stripes
  {
    id: 8,
    name: 'Stripes',
    speedMultiplier: 1.15,
    bricks: [
      [M, S, N, S, M, S, N, S],
      [S, N, S, M, S, N, S, M],
      [N, S, M, S, N, S, M, S],
      [S, M, S, N, S, M, S, N],
      [M, S, N, S, M, S, N, S],
    ],
  },

  // Level 9: Fortress with Indestructible
  {
    id: 9,
    name: 'Fortress',
    speedMultiplier: 1.2,
    bricks: [
      [X, N, N, N, N, N, N, X],
      [N, S, S, S, S, S, S, N],
      [N, S, M, M, M, M, S, N],
      [N, S, S, S, S, S, S, N],
      [X, N, N, N, N, N, N, X],
    ],
  },

  // Level 10: Final Challenge
  {
    id: 10,
    name: 'The Gauntlet',
    speedMultiplier: 1.25,
    bricks: [
      [X, M, S, N, N, S, M, X],
      [M, S, N, N, N, N, S, M],
      [S, N, N, M, M, N, N, S],
      [M, S, N, N, N, N, S, M],
      [X, M, S, N, N, S, M, X],
    ],
  },
]

/**
 * Create a custom level from a pattern string.
 * Use this for quick level prototyping.
 *
 * @example
 * ```ts
 * const level = createLevelFromPattern(1, 'My Level', `
 *   N N N N N N N N
 *   . S S S S S S .
 *   . S M M M M S .
 *   . S S S S S S .
 *   N N N N N N N N
 * `)
 * ```
 */
export function createLevelFromPattern(
  id: number,
  name: string,
  pattern: string,
  speedMultiplier: number = 1.0
): Level {
  const lines = pattern
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const bricks: (BrickDefinition | null)[][] = lines.map((line) => {
    const cells = line.split(/\s+/)
    return cells.map((cell) => {
      switch (cell.toUpperCase()) {
        case 'N':
          return { type: 'normal' as const }
        case 'S':
          return { type: 'strong' as const }
        case 'M':
          return { type: 'metal' as const }
        case 'X':
          return { type: 'indestructible' as const }
        case '.':
        case '_':
        case '0':
          return null
        default:
          return null
      }
    })
  })

  return { id, name, bricks, speedMultiplier }
}

/**
 * Generate a random level with given parameters.
 */
export function generateRandomLevel(
  id: number,
  cols: number = 8,
  rows: number = 5,
  difficulty: number = 0.5
): Level {
  const bricks: (BrickDefinition | null)[][] = []

  for (let row = 0; row < rows; row++) {
    const rowBricks: (BrickDefinition | null)[] = []
    for (let col = 0; col < cols; col++) {
      // Higher rows have stronger bricks
      const rowDifficulty = (rows - row) / rows
      const rand = Math.random()

      if (rand < 0.1) {
        // 10% empty
        rowBricks.push(null)
      } else if (rand < 0.1 + 0.5 * (1 - difficulty * rowDifficulty)) {
        // Normal bricks
        rowBricks.push({ type: 'normal' })
      } else if (rand < 0.8) {
        // Strong bricks
        rowBricks.push({ type: 'strong' })
      } else if (rand < 0.95) {
        // Metal bricks
        rowBricks.push({ type: 'metal' })
      } else {
        // Rare indestructible
        rowBricks.push({ type: 'indestructible' })
      }
    }
    bricks.push(rowBricks)
  }

  return {
    id,
    name: `Random Level ${id}`,
    bricks,
    speedMultiplier: 1 + difficulty * 0.3,
  }
}

/**
 * Get brick health by type
 */
export function getBrickHealth(type: BrickDefinition['type']): number {
  switch (type) {
    case 'normal':
      return 1
    case 'strong':
      return 2
    case 'metal':
      return 3
    case 'indestructible':
      return Infinity
  }
}

/**
 * Check if a level is completable (has at least one destructible brick)
 */
export function isLevelCompletable(level: Level): boolean {
  return level.bricks.some((row) =>
    row.some((brick) => brick !== null && brick.type !== 'indestructible')
  )
}

/**
 * Count total destructible bricks in a level
 */
export function countDestructibleBricks(level: Level): number {
  let count = 0
  for (const row of level.bricks) {
    for (const brick of row) {
      if (brick !== null && brick.type !== 'indestructible') {
        count++
      }
    }
  }
  return count
}

