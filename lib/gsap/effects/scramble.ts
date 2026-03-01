import gsap from 'gsap'

const DEFAULT_CHARS = '!<>-_\\/[]{}—=+*^?#________'

export interface ScrambleEffectConfig {
  /** The final text to reveal. Falls back to the element's current textContent. */
  text?: string
  /** Character set used for scrambling. Repeated chars increase their probability. */
  chars?: string
  /** Duration of the animation in seconds. When 0, auto-scales with text length. */
  duration?: number
  /** GSAP ease string. */
  ease?: string
  /** How many randomization cycles each character gets before resolving (higher = more chaotic). */
  cycles?: number
  /** Probability (0–1) that each character scrambles. Default 1. */
  chance?: number
  /** Show all character positions from the start rather than growing in. Default true. */
  overflow?: boolean
  /** Skip prefers-reduced-motion check. Default false. */
  ignoreReducedMotion?: boolean
}

const randomChar = (chars: string) =>
  chars[Math.floor(Math.random() * chars.length)]

interface InternalConfig {
  text: string
  chars: string
  duration: number
  ease: string
  cycles: number
  chance: number
  overflow: boolean
  ignoreReducedMotion: boolean
}

gsap.registerEffect({
  name: 'scramble',
  effect: (targets: Element[], config: InternalConfig) => {
    const el = targets[0] as HTMLElement
    const finalText = (config.text as string) || el.textContent || ''
    const chars = config.chars as string
    const cycles = config.cycles as number
    const chance = config.chance as number
    const overflow = config.overflow as boolean

    // prefers-reduced-motion guard
    if (
      !config.ignoreReducedMotion &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      el.textContent = finalText
      return gsap.to({ p: 0 }, { p: 1, duration: 0 })
    }

    // Auto-scale duration: ~50ms per character, min 0.3s, max 1.2s
    const autoDuration = Math.min(1.2, Math.max(0.3, finalText.length * 0.05))
    const duration = (config.duration as number) || autoDuration

    // Build per-character resolve schedule with staggered random timing
    const len = finalText.length
    const schedule: number[] = []
    for (let i = 0; i < len; i++) {
      // Base progress is left-to-right, but add jitter for organic feel
      const base = len === 1 ? 0.5 : i / (len - 1)
      const jitter = (Math.random() - 0.5) * 0.3
      schedule.push(Math.max(0, Math.min(1, base + jitter)))
    }

    // Track per-character scramble frame counters
    const frameCounts = new Array(len).fill(0)
    const resolved = new Array(len).fill(false)
    let lastProgress = -1

    // Pre-resolve characters that skip scrambling based on chance
    for (let i = 0; i < len; i++) {
      if (Math.random() >= chance) resolved[i] = true
    }

    return gsap.to(
      { progress: 0 },
      {
        progress: 1,
        duration,
        ease: config.ease,
        onUpdate: function () {
          const p = this.progress()

          if (p === lastProgress) return
          lastProgress = p

          const visibleCount = overflow ? len : Math.round(p * len)
          let display = ''
          for (let i = 0; i < len; i++) {
            if (i >= visibleCount) break

            if (finalText[i] === ' ') {
              display += ' '
              continue
            }

            if (resolved[i]) {
              display += finalText[i]
              continue
            }

            // Check if this character should resolve
            if (p >= schedule[i] && frameCounts[i] >= cycles) {
              resolved[i] = true
              display += finalText[i]
              continue
            }

            // Increment frame count once past schedule point
            if (p >= schedule[i]) {
              frameCounts[i]++
            }

            display += randomChar(chars)
          }

          el.textContent = display
        },
        onComplete() {
          el.textContent = finalText
        },
      }
    )
  },
  defaults: {
    duration: 0.5,
    ease: 'none',
    chars: DEFAULT_CHARS,
    text: '',
    cycles: 2,
    chance: 1,
    overflow: true,
    ignoreReducedMotion: false,
  },
  extendTimeline: true,
})
