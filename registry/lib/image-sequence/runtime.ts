import { FrameTransfer, sourceUrl, type TransferDemand } from './transfer'
export type { TransferDemand } from './transfer'
export {
  EncodedFrameCache,
  getSharedFrameTransfer,
  DEFAULT_ENCODED_FRAME_BUDGET,
} from './transfer'
export type FrameTransport = Pick<FrameTransfer, 'get' | 'update' | 'release'>

export type FrameSource =
  | string
  | {
      src: string
      srcSet?: string
      sizes?: string
      width?: number
      height?: number
      accept?: string
    }
export type DecodedFrame = {
  image: HTMLImageElement
  src: string
  width: number
  height: number
  bytes: number
}
type Demand = TransferDemand & { index: number }
const MAX_READY_AHEAD = 3

/** Spread first, last, and midpoint transfer requests across a frame range. */
export function binaryFrameOrder(first: number, last: number): number[] {
  if (first > last) return []
  if (first === last) return [first]
  const order = [first, last]
  const ranges: [number, number][] = [[first, last]]
  for (let position = 0; position < ranges.length; position++) {
    const [start, end] = ranges[position]
    if (end - start <= 1) continue
    const middle = Math.floor((start + end) / 2)
    order.push(middle)
    ranges.push([start, middle], [middle, end])
  }
  return order
}

/** Pick the smallest responsive candidate that covers the visible image's physical pixels. */
export function resolveFrameUrl(
  source: FrameSource,
  pixelWidth: number
): string {
  if (typeof source === 'string' || !source.srcSet)
    return typeof source === 'string' ? source : source.src
  const candidates = source.srcSet
    .split(',')
    .map((candidate) => {
      const [url, descriptor] = candidate.trim().split(/\s+/)
      const width = Number(descriptor?.match(/^(\d+)w$/)?.[1])
      return width > 0 ? { url, width } : null
    })
    .filter(
      (candidate): candidate is { url: string; width: number } =>
        candidate !== null
    )
    .sort((a, b) => a.width - b.width)
  if (!candidates.length) return source.src
  return (
    candidates.find((candidate) => candidate.width >= pixelWidth)?.url ??
    candidates.at(-1)!.url
  )
}

/** Retain transfer metadata when choosing a responsive URL for the fetch queue. */
export function resolveFrameSource(
  source: FrameSource,
  pixelWidth: number
): FrameSource {
  if (typeof source === 'string') return source
  return {
    ...source,
    src: resolveFrameUrl(source, pixelWidth),
    srcSet: undefined,
  }
}

function releaseFrame(frame: DecodedFrame) {
  frame.image.removeAttribute('srcset')
  frame.image.removeAttribute('src')
  if (frame.src.startsWith('blob:')) URL.revokeObjectURL(frame.src)
}

export async function decodeFrame(
  blob: Blob,
  signal: AbortSignal
): Promise<DecodedFrame> {
  const image = new Image()
  image.decoding = 'async'
  const src = URL.createObjectURL(blob)
  image.src = src
  let timeout: ReturnType<typeof setTimeout> | undefined
  let onAbort: (() => void) | undefined
  try {
    if (signal.aborted) throw signal.reason
    const cancelled = new Promise<never>((_, reject) => {
      onAbort = () =>
        reject(signal.reason ?? new DOMException('Cancelled', 'AbortError'))
      signal.addEventListener('abort', onAbort, { once: true })
    })
    const timedOut = new Promise<never>((_, reject) => {
      timeout = setTimeout(
        () => reject(new DOMException('Decode timeout', 'TimeoutError')),
        15_000
      )
    })
    await Promise.race([image.decode(), cancelled, timedOut])
    if (signal.aborted) throw signal.reason
    return {
      image,
      src,
      width: image.naturalWidth,
      height: image.naturalHeight,
      bytes: image.naturalWidth * image.naturalHeight * 4,
    }
  } catch (error) {
    image.removeAttribute('src')
    URL.revokeObjectURL(src)
    throw error
  } finally {
    if (timeout) clearTimeout(timeout)
    if (onAbort) signal.removeEventListener('abort', onAbort)
  }
}

type DecodeDemand = { index: number; source: FrameSource; priority: number }
/** A sequence's decoded ring and bounded decode pump. */
class LocalFrames {
  private frames = new Map<string, DecodedFrame>()
  private retained = new Map<DecodedFrame, number>()
  private wanted: DecodeDemand[] = []
  private visible?: string
  private pending = new Map<string, AbortController>()
  private readonly decodeConcurrency = 3
  private generation = 0
  private disposed = false
  private failures = new Set<string>()
  private decodeFailures = new Map<string, number>()
  private retryTimers = new Map<string, ReturnType<typeof setTimeout>>()
  constructor(
    private transport: FrameTransport,
    private owner: symbol,
    private source: (index: number) => FrameSource,
    private notify: (reason: 'transfer' | 'decode') => void
  ) {}
  get(source: FrameSource) {
    return this.frames.get(sourceUrl(source))
  }
  isReady(source: FrameSource) {
    return this.frames.has(sourceUrl(source))
  }
  hasBytes(source: FrameSource) {
    return Boolean(this.transport.get(source))
  }
  retain(frame: DecodedFrame) {
    this.retained.set(frame, (this.retained.get(frame) ?? 0) + 1)
    let released = false
    return () => {
      if (released) return
      released = true
      const count = (this.retained.get(frame) ?? 1) - 1
      if (count) this.retained.set(frame, count)
      else {
        this.retained.delete(frame)
        if (![...this.frames.values()].includes(frame)) releaseFrame(frame)
      }
    }
  }
  setVisible(source: FrameSource) {
    this.visible = sourceUrl(source)
    this.trim()
  }
  update(wanted: Demand[], decode: number[], active: boolean) {
    if (this.disposed) return
    this.wanted = decode.map((index, priority) => ({
      index,
      source: this.source(index),
      priority,
    }))
    const demandUrls = new Set(
      this.wanted.map((item) => sourceUrl(item.source))
    )
    // This bounds relevant decode promises. Browser codec work abandoned after
    // cancellation may overlap briefly because HTMLImageElement.decode() has no
    // cancellable API. Current demand must not wait behind obsolete frames.
    for (const [url, controller] of this.pending)
      if (!demandUrls.has(url)) {
        controller.abort()
        this.pending.delete(url)
      }
    this.transport.update(
      this.owner,
      wanted,
      () => {
        this.pump()
        this.notify('transfer')
      },
      active
    )
    this.trim()
    this.pump()
  }
  private trim() {
    const keep = new Set(this.wanted.map((item) => sourceUrl(item.source)))
    if (this.visible) keep.add(this.visible)
    for (const url of this.failures)
      if (!keep.has(url)) {
        this.failures.delete(url)
        this.decodeFailures.delete(url)
        const timer = this.retryTimers.get(url)
        if (timer) clearTimeout(timer)
        this.retryTimers.delete(url)
      }
    for (const [url, frame] of this.frames) {
      if (keep.has(url)) continue
      this.frames.delete(url)
      if (!this.retained.has(frame)) releaseFrame(frame)
    }
  }
  private pump() {
    if (this.disposed) return
    for (const next of this.wanted) {
      if (this.pending.size >= this.decodeConcurrency) break
      const url = sourceUrl(next.source)
      if (
        this.frames.has(url) ||
        this.failures.has(url) ||
        this.pending.has(url)
      )
        continue
      const blob = this.transport.get(next.source)
      if (!blob) continue
      this.startDecode(url, blob)
    }
  }
  private startDecode(url: string, blob: Blob) {
    const controller = new AbortController()
    const generation = this.generation
    this.pending.set(url, controller)
    void decodeFrame(blob, controller.signal)
      .then(
        (frame) => {
          if (
            this.disposed ||
            generation !== this.generation ||
            controller.signal.aborted ||
            this.pending.get(url) !== controller ||
            !this.wanted.some((item) => sourceUrl(item.source) === url)
          ) {
            releaseFrame(frame)
            return
          }
          this.frames.set(url, frame)
          this.notify('decode')
        },
        () => {
          if (
            controller.signal.aborted ||
            generation !== this.generation ||
            this.disposed
          )
            return
          this.failures.add(url)
          const failures = (this.decodeFailures.get(url) ?? 0) + 1
          this.decodeFailures.set(url, failures)
          const delay = Math.min(500 * 2 ** Math.min(failures - 1, 6), 30_000)
          this.retryTimers.set(
            url,
            setTimeout(() => {
              this.retryTimers.delete(url)
              this.failures.delete(url)
              if (!this.disposed && generation === this.generation) this.pump()
            }, delay)
          )
        }
      )
      .finally(() => {
        if (this.pending.get(url) === controller) this.pending.delete(url)
        this.trim()
        this.pump()
      })
  }
  resize() {
    this.generation++
    for (const controller of this.pending.values()) controller.abort()
    this.pending.clear()
    this.failures.clear()
    this.decodeFailures.clear()
    for (const timer of this.retryTimers.values()) clearTimeout(timer)
    this.retryTimers.clear()
    for (const frame of this.frames.values())
      if (!this.retained.has(frame)) releaseFrame(frame)
    this.frames.clear()
  }
  suspend() {
    this.wanted = []
    for (const controller of this.pending.values()) controller.abort()
    this.pending.clear()
    this.visible = undefined
    this.trim()
    this.transport.release(this.owner)
  }
  release() {
    if (this.disposed) return
    this.disposed = true
    this.resize()
    this.transport.release(this.owner)
  }
}

export type SequenceOptions = {
  frameCount: number
  source: (index: number) => FrameSource
  onFrame: (index: number, frame: DecodedFrame) => boolean | void
  onComplete?: () => void
  mode?: 'autoplay' | 'scrub'
  frameDuration?: number
  loop?: boolean
  loopStart?: number
  loopEnd?: number
  initialFrame?: number
  loadInitial?: boolean
  priority?: 'sequential' | 'hybrid'
  /** Future decoded candidates; supported range is 0..3. */
  readyAhead?: number
  maxFrameSkip?: number
  ahead?: number
  behind?: number
}

const integer = (value: number | undefined, fallback: number) =>
  value !== undefined && Number.isFinite(value) ? Math.floor(value) : fallback

/** Owns demand and playback; React never receives the per-frame working set. */
export class SequenceDemandController {
  private owner = Symbol('sequence')
  private frames: LocalFrames
  private current: number
  private playhead: number
  private target: number
  private direction = 1
  private elapsed = 0
  private nearby = false
  private playing = false
  private disposed = false
  private hasPresented = false
  private presentedUrl?: string
  private cycle = 0
  private presentedCycle = 0
  private queuedTarget?: number
  private targetRaf?: number
  private readonly count: number
  private readonly start: number
  private readonly end: number
  private readonly initial: number
  private readonly runway: number
  private readonly duration: number
  private readonly order: number[]
  private readonly hybrid: boolean
  private readonly skip: number
  private completed = false

  constructor(
    transport: FrameTransport,
    private options: SequenceOptions
  ) {
    this.count = Math.max(0, integer(options.frameCount, 0))
    this.end = Math.max(
      0,
      Math.min(this.count - 1, integer(options.loopEnd, this.count - 1))
    )
    this.start = Math.max(0, Math.min(this.end, integer(options.loopStart, 0)))
    this.initial = Math.max(
      this.start,
      Math.min(this.end, integer(options.initialFrame, this.start))
    )
    this.current = this.playhead = this.target = this.initial
    this.runway = Math.max(
      0,
      Math.min(MAX_READY_AHEAD, integer(options.readyAhead, 3))
    )
    this.duration = Math.max(
      1,
      Number.isFinite(options.frameDuration)
        ? options.frameDuration!
        : 1000 / 24
    )
    this.skip = Math.max(
      0,
      Math.min(this.end - this.start, integer(options.maxFrameSkip, 0))
    )
    this.hybrid = options.priority !== 'sequential'
    this.order = binaryFrameOrder(this.start, this.end)
    this.frames = new LocalFrames(
      transport,
      this.owner,
      options.source,
      (reason) => {
        if (this.disposed || !this.nearby || this.completed) return
        if (reason === 'transfer') this.refresh()
        if (options.mode === 'scrub') this.presentTarget()
        else if (!this.hasPresented && (this.playing || options.loadInitial))
          this.present(this.initial)
      }
    )
  }

  get isComplete() {
    return this.completed
  }

  setConditions(nearby: boolean, playing: boolean) {
    if (this.disposed) return
    this.nearby = nearby
    this.playing = nearby && playing
    if (!this.playing) this.elapsed = 0
    this.refresh()
    if (nearby && this.options.mode === 'scrub') this.presentTarget()
    else if (
      nearby &&
      !this.hasPresented &&
      (this.playing || this.options.loadInitial)
    )
      this.present(this.initial)
  }

  setTarget(index: number) {
    if (this.disposed || !Number.isFinite(index)) return
    const next = Math.max(this.start, Math.min(this.end, Math.round(index)))
    if (next !== this.target) this.direction = next > this.target ? 1 : -1
    this.target = next
    this.refresh()
    this.presentTarget()
  }

  /** Coalesce scroll input and suppress presentation against an outdated target. */
  queueTarget(index: number) {
    if (this.disposed) return
    this.queuedTarget = index
    if (this.targetRaf !== undefined) return
    this.targetRaf = requestAnimationFrame(() => {
      this.targetRaf = undefined
      const target = this.queuedTarget
      this.queuedTarget = undefined
      if (target !== undefined) this.setTarget(target)
    })
  }

  tick(delta: number) {
    if (
      !this.playing ||
      this.disposed ||
      this.completed ||
      !this.count ||
      this.options.mode === 'scrub'
    )
      return
    if (!this.hasPresented) {
      this.present(this.initial)
      return
    }
    this.elapsed += Math.max(0, Number.isFinite(delta) ? delta : 0)
    if (this.hybrid) {
      const steps = Math.floor(this.elapsed / this.duration)
      if (steps) {
        this.elapsed %= this.duration
        if (this.options.loop !== false && steps > this.end - this.playhead) {
          this.cycle +=
            1 +
            Math.floor(
              (steps - (this.end - this.playhead + 1)) /
                (this.end - this.start + 1)
            )
        }
        this.playhead = this.advance(this.playhead, steps)
        this.refresh()
      }
      const candidate = this.closestReady()
      if (candidate !== undefined) this.present(candidate)
    } else if (this.elapsed >= this.duration) {
      // Hold authored time until an allowed next frame is ready.
      this.elapsed = Math.min(this.elapsed, this.duration * 2)
      this.refresh()
      for (let offset = 1; offset <= this.skip + 1; offset++) {
        const next = this.advance(this.current, offset)
        if (!this.frames.isReady(this.options.source(next))) continue
        this.elapsed -= this.duration
        this.playhead = next
        this.present(next)
        break
      }
    }
  }

  resetWindow() {
    if (this.disposed) return
    this.frames.resize()
    this.refresh()
  }

  /** Poster restoration invalidates the presentation identity, not the run. */
  restorePoster() {
    this.hasPresented = false
    this.presentedUrl = undefined
  }

  retainSurface(frame: DecodedFrame) {
    return this.frames.retain(frame)
  }

  dispose() {
    this.disposed = true
    if (this.targetRaf !== undefined) cancelAnimationFrame(this.targetRaf)
    this.frames.release()
  }

  private advance(index: number, offset: number) {
    if (this.options.loop === false) return Math.min(this.end, index + offset)
    return (
      this.start + ((index - this.start + offset) % (this.end - this.start + 1))
    )
  }

  private canPresent(index: number) {
    return this.cycle > this.presentedCycle || index >= this.current
  }

  private closestReady() {
    let candidate: number | undefined
    for (const index of this.order) {
      if (
        !this.canPresent(index) ||
        !this.frames.isReady(this.options.source(index))
      )
        continue
      // One-shot completion must follow authored time all the way to the end.
      if (
        this.options.loop === false &&
        index === this.end &&
        this.playhead !== this.end
      )
        continue
      if (
        candidate === undefined ||
        Math.abs(index - this.playhead) < Math.abs(candidate - this.playhead) ||
        (Math.abs(index - this.playhead) ===
          Math.abs(candidate - this.playhead) &&
          index < candidate)
      )
        candidate = index
    }
    return candidate
  }

  private presentTarget() {
    if (
      this.options.mode !== 'scrub' ||
      !this.nearby ||
      this.queuedTarget !== undefined
    )
      return
    const direction = this.target >= this.current ? -1 : 1
    for (
      let index = this.target;
      direction === -1 ? index >= this.current : index <= this.current;
      index += direction
    ) {
      if (this.frames.isReady(this.options.source(index))) {
        this.present(index)
        return
      }
    }
  }

  private present(index: number) {
    if (this.disposed || !this.nearby || !this.count || this.completed) return
    const source = this.options.source(index)
    const url = sourceUrl(source)
    const frame = this.frames.get(source)
    if (
      !frame ||
      (this.hasPresented && index === this.current && this.presentedUrl === url)
    )
      return
    if (this.options.onFrame(index, frame) === false) return
    if (this.disposed) return
    this.current = index
    this.hasPresented = true
    this.presentedUrl = url
    this.presentedCycle = this.cycle
    this.frames.setVisible(source)
    if (
      this.options.mode !== 'scrub' &&
      this.options.loop === false &&
      index === this.end &&
      this.playhead === this.end
    ) {
      this.completed = true
      this.frames.suspend()
      this.options.onComplete?.()
      return
    }
    this.refresh()
  }

  private refresh() {
    if (this.disposed) return
    if (!this.nearby || !this.count || this.completed) {
      this.frames.suspend()
      return
    }
    const wanted: Demand[] = []
    const added = new Set<number>()
    const add = (index: number, priority: number) => {
      if (added.has(index)) return
      added.add(index)
      wanted.push({ index, source: this.options.source(index), priority })
    }
    let decode: number[]
    if (this.options.mode === 'scrub') {
      add(this.target, 0)
      if (this.playing) {
        const ahead = Math.min(
          this.count,
          Math.max(0, integer(this.options.ahead, 7))
        )
        const behind = Math.min(
          this.count,
          Math.max(0, integer(this.options.behind, 3))
        )
        for (let i = 1; i <= ahead; i++) {
          const index = this.target + i * this.direction
          if (index >= this.start && index <= this.end) add(index, i)
        }
        for (let i = 1; i <= behind; i++) {
          const index = this.target - i * this.direction
          if (index >= this.start && index <= this.end) add(index, ahead + i)
        }
      }
      decode = wanted
        .filter((item) => item.index !== this.current)
        .slice(0, 3)
        .map((item) => item.index)
      if (added.has(this.current)) decode.unshift(this.current)
    } else if (!this.playing) {
      add(this.hasPresented ? this.current : this.initial, 0)
      add(this.advance(this.playhead, 1), 1)
      decode =
        this.options.loadInitial && !this.hasPresented ? [this.initial] : []
    } else if (!this.hasPresented) {
      add(this.initial, 0)
      add(this.end, 1)
      if (this.hybrid) this.order.forEach((index, rank) => add(index, rank + 2))
      decode = [this.initial]
    } else if (this.hybrid) {
      add(this.playhead, 0)
      for (let offset = 1; offset <= this.runway; offset++)
        add(this.advance(this.playhead, offset), 1)
      this.order.forEach((index, rank) => add(index, rank + 2))
      // With no runway, decode only the frame due now. It must still progress.
      const limit = Math.max(1, this.runway)
      decode = wanted
        .filter((item) => item.index !== this.current)
        .slice(0, limit)
        .map((item) => item.index)
      if (
        !decode.some((index) =>
          this.frames.hasBytes(this.options.source(index))
        )
      ) {
        const fallback = wanted
          .filter(
            (item) =>
              item.index !== this.current &&
              this.canPresent(item.index) &&
              this.frames.hasBytes(item.source)
          )
          .sort(
            (a, b) =>
              Math.abs(a.index - this.playhead) -
              Math.abs(b.index - this.playhead)
          )[0]
        if (fallback)
          decode = [
            fallback.index,
            ...decode.filter((index) => index !== fallback.index),
          ].slice(0, limit)
      }
      if (this.playhead === this.current) {
        if (this.runway === 0) decode = []
        decode.unshift(this.current)
      }
    } else {
      const count = this.runway || (this.elapsed >= this.duration ? 1 : 0)
      for (
        let offset = 1;
        offset <= Math.max(count, count ? this.skip + 1 : 0);
        offset++
      )
        add(this.advance(this.current, offset), offset)
      // A skip permits already-transferred candidates beyond a missing next frame.
      decode = wanted
        .filter((item) => this.skip === 0 || this.frames.hasBytes(item.source))
        .slice(0, Math.max(1, count))
        .map((item) => item.index)
    }
    this.frames.update(wanted, decode, this.playing)
  }
}
