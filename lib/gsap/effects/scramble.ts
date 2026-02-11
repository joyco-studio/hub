import gsap from 'gsap'

const DEFAULT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}=+*^?#'

export interface ScrambleEffectConfig {
  /** The final text to reveal. Falls back to the element's current textContent. */
  text?: string
  /** Character set used for scrambling. */
  chars?: string
  /** Duration of the animation in seconds. */
  duration?: number
  /** GSAP ease string. */
  ease?: string
}

const randomChar = (chars: string) =>
  chars[Math.floor(Math.random() * chars.length)]

interface EffectConfig {
  text: string
  chars: string
  duration: number
  ease: string
}

gsap.registerEffect({
  name: 'scramble',
  effect: (targets: Element[], config: EffectConfig) => {
    const el = targets[0] as HTMLElement
    const finalText = (config.text as string) || el.textContent || ''
    const chars = config.chars as string

    return gsap.to(
      { progress: 0 },
      {
        progress: 1,
        duration: config.duration,
        ease: config.ease,
        onUpdate: function () {
          const p = this.progress()
          const len = finalText.length
          const resolved = Math.floor(p * len)
          let display = ''

          for (let i = 0; i < len; i++) {
            if (finalText[i] === ' ') {
              display += ' '
            } else if (i < resolved) {
              display += finalText[i]
            } else {
              display += randomChar(chars)
            }
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
    duration: 0.6,
    ease: 'none',
    chars: DEFAULT_CHARS,
    text: '',
  },
  extendTimeline: true,
})
