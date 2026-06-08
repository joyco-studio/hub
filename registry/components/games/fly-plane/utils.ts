import type { DeepPartial, FlyPlaneConfig } from './types'
import { GAME_CONSTANTS } from './config'

/** Deep-merge config overrides onto a base config (one level per section). */
export function mergeConfig(
  base: FlyPlaneConfig,
  overrides?: DeepPartial<FlyPlaneConfig>
): FlyPlaneConfig {
  if (!overrides) return base
  const exhaustOverride = overrides.colors?.exhaust
  return {
    colors: {
      ...base.colors,
      ...overrides.colors,
      exhaust: [
        exhaustOverride?.[0] ?? base.colors.exhaust[0],
        exhaustOverride?.[1] ?? base.colors.exhaust[1],
        exhaustOverride?.[2] ?? base.colors.exhaust[2],
      ],
    },
    player: { ...base.player, ...overrides.player },
    enemy: {
      ...base.enemy,
      ...overrides.enemy,
      grunt: { ...base.enemy.grunt, ...overrides.enemy?.grunt },
      weaver: { ...base.enemy.weaver, ...overrides.enemy?.weaver },
      tank: { ...base.enemy.tank, ...overrides.enemy?.tank },
    },
    bullet: { ...base.bullet, ...overrides.bullet },
    spawn: { ...base.spawn, ...overrides.spawn },
    particle: { ...base.particle, ...overrides.particle },
    boss: { ...base.boss, ...overrides.boss },
  }
}

/** Resolve a `var(--x)` color to its computed value for canvas painting. */
export function resolveCssColor(color: string, element: HTMLElement): string {
  if (!color.includes('var(')) return color
  const computed = getComputedStyle(element)
  const match = color.match(/var\(\s*(--[\w-]+)/)
  if (!match) return color
  const resolved = computed.getPropertyValue(match[1]).trim()
  return resolved || color
}

/** Zero-pad a score to 7 digits. */
export function formatScore(score: number): string {
  return score.toString().padStart(7, '0')
}

/** Single high-score persistence (SSR-safe, swallows parse/quota errors). */
export const storage = {
  getHighScore(key: string = GAME_CONSTANTS.storageKey): number {
    if (typeof window === 'undefined') return 0
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return 0
      const parsed = Number.parseInt(raw, 10)
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
    } catch {
      return 0
    }
  },
  setHighScore(score: number, key: string = GAME_CONSTANTS.storageKey): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, String(Math.floor(score)))
    } catch {
      // Storage unavailable — high score is non-critical.
    }
  },
}
