import type {
  Position,
  SnakeGameConfig,
  DeepPartial,
  HighscoreEntry,
} from './types'
import { GAME_CONSTANTS } from './config'

/**
 * Deep merge configuration objects
 * @param base - Base configuration
 * @param overrides - Partial overrides to merge
 * @returns Merged configuration
 */
export function mergeConfig(
  base: SnakeGameConfig,
  overrides?: DeepPartial<SnakeGameConfig>
): SnakeGameConfig {
  if (!overrides) return base

  return {
    colors: { ...base.colors, ...overrides.colors },
    grid: { ...base.grid, ...overrides.grid },
    physics: { ...base.physics, ...overrides.physics },
    scoring: { ...base.scoring, ...overrides.scoring },
    storage: { ...base.storage, ...overrides.storage },
  }
}

/**
 * Create initial snake at center of grid
 * @param gridSize - Size of the grid
 * @returns Array of positions for initial snake
 */
export function createInitialSnake(gridSize: number): Position[] {
  const y = Math.floor(gridSize / 2)
  const headX = Math.floor(gridSize / 2)

  return Array.from({ length: GAME_CONSTANTS.INITIAL_SNAKE_LENGTH }, (_, i) => ({
    x: headX - i,
    y,
  }))
}

/**
 * Generate food position that doesn't overlap with snake
 * @param snake - Current snake segments
 * @param gridSize - Size of the grid
 * @returns New food position
 */
export function generateFood(snake: Position[], gridSize: number): Position {
  let newFood: Position
  do {
    newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    }
  } while (snake.some((s) => s.x === newFood.x && s.y === newFood.y))
  return newFood
}

/**
 * Check if two positions are equal
 * @param a - First position
 * @param b - Second position
 * @returns True if positions match
 */
export function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y
}

/**
 * Check if position is within grid bounds
 * @param pos - Position to check
 * @param gridSize - Size of the grid
 * @returns True if within bounds
 */
export function isWithinBounds(pos: Position, gridSize: number): boolean {
  return pos.x >= 0 && pos.x < gridSize && pos.y >= 0 && pos.y < gridSize
}

/**
 * Check if snake collides with itself
 * @param snake - Snake segments (head is first element)
 * @returns True if head collides with body
 */
export function checkSelfCollision(snake: Position[]): boolean {
  const head = snake[0]
  return snake.slice(1).some((segment) => positionsEqual(head, segment))
}

/**
 * Resolve CSS variable to actual color value
 * @param color - Color string (may contain var())
 * @param element - DOM element to get computed styles from
 * @returns Resolved color value
 */
export function resolveCssColor(color: string, element: HTMLElement): string {
  if (!color.includes('var(')) return color

  const computed = getComputedStyle(element)
  const varMatch = color.match(/var\((--[^)]+)\)/)

  if (varMatch) {
    const varName = varMatch[1]
    const resolved = computed.getPropertyValue(varName).trim()
    return resolved || color
  }

  return color
}

/**
 * Format date for high score display
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatHighscoreDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/** Storage utilities for localStorage operations */
export const storage = {
  /**
   * Get high scores from localStorage
   * @param key - Storage key
   * @returns Array of high score entries
   */
  getHighscores(key: string): HighscoreEntry[] {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  /**
   * Save high scores to localStorage
   * @param key - Storage key
   * @param scores - High score entries to save
   */
  setHighscores(key: string, scores: HighscoreEntry[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(scores))
    } catch {
      // Storage full or disabled - silently fail
    }
  },

  /**
   * Add a new high score entry
   * @param key - Storage key
   * @param score - Score to add
   * @param maxEntries - Maximum entries to keep
   * @returns Updated high scores array
   */
  addHighscore(
    key: string,
    score: number,
    maxEntries: number
  ): HighscoreEntry[] {
    const current = storage.getHighscores(key)
    const newEntry: HighscoreEntry = {
      score,
      date: formatHighscoreDate(),
    }

    const updated = [...current, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, maxEntries)

    storage.setHighscores(key, updated)
    return updated
  },
}

/**
 * Calculate game speed based on score
 * @param initialSpeed - Starting speed in ms
 * @param speedIncrement - Speed decrease per point
 * @param minSpeed - Minimum speed cap
 * @param score - Current score
 * @returns Speed in ms
 */
export function calculateSpeed(
  initialSpeed: number,
  speedIncrement: number,
  minSpeed: number,
  score: number
): number {
  return Math.max(minSpeed, initialSpeed - score * speedIncrement)
}

