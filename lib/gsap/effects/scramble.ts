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
  /** Seconds of full scramble before characters start resolving. */
  revealDelay?: number
  /** How many scramble frames each character gets before resolving (higher = more chaotic). */
  scrambleFrames?: number
}

const randomChar = (chars: string) =>
  chars[Math.floor(Math.random() * chars.length)]

interface InternalConfig {
  text: string
  chars: string
  duration: number
  ease: string
  revealDelay: number
  scrambleFrames: number
}

gsap.registerEffect({
  name: 'scramble',
  effect: (targets: Element[], config: InternalConfig) => {
    const el = targets[0] as HTMLElement
    const finalText = (config.text as string) || el.textContent || ''
    const chars = config.chars as string
    const revealDelay = config.revealDelay as number
    const scrambleFrames = config.scrambleFrames as number

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

    return gsap.to(
      { progress: 0 },
      {
        progress: 1,
        duration: duration + revealDelay,
        ease: config.ease,
        onUpdate: function () {
          const rawP = this.progress()
          // Account for revealDelay: remap progress so reveal starts after delay
          const delayFraction =
            duration + revealDelay > 0
              ? revealDelay / (duration + revealDelay)
              : 0
          const p =
            delayFraction >= 1
              ? 0
              : Math.max(0, (rawP - delayFraction) / (1 - delayFraction))

          if (rawP === lastProgress) return
          lastProgress = rawP

          let display = ''
          for (let i = 0; i < len; i++) {
            if (finalText[i] === ' ') {
              display += ' '
              continue
            }

            if (resolved[i]) {
              display += finalText[i]
              continue
            }

            // Check if this character should resolve
            if (p >= schedule[i] && frameCounts[i] >= scrambleFrames) {
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
    duration: 0,
    ease: 'none',
    chars: DEFAULT_CHARS,
    text: '',
    revealDelay: 0,
    scrambleFrames: 3,
  },
  extendTimeline: true,
})
