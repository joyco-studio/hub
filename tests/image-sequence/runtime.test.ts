import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  binaryFrameOrder,
  resolveFrameSource,
  resolveFrameUrl,
  SequenceDemandController,
  type SequenceOptions,
} from '../../registry/lib/image-sequence/runtime'
import {
  EncodedFrameCache,
  FrameTransfer,
  DEFAULT_ENCODED_FRAME_BUDGET,
} from '../../registry/lib/image-sequence/transfer'

const flush = async () => {
  for (let i = 0; i < 40; i++) await Promise.resolve()
}
const source = (index: number) => `frame-${index}`
let images: FakeImage[]
let urls: string[]
let revoked: string[]
let decode: ((image: FakeImage) => Promise<void>) | undefined
class FakeImage {
  src = ''
  naturalWidth = 32
  naturalHeight = 32
  constructor() {
    images.push(this)
  }
  decode() {
    return decode?.(this) ?? Promise.resolve()
  }
  removeAttribute(name: string) {
    if (name === 'src') this.src = ''
  }
}
const disposals: (() => void)[] = []
function transport(concurrency = 8, budget = 1024) {
  const requests: {
    url: string
    signal: AbortSignal
    resolve: (blob?: Blob) => void
    reject: (error: Error) => void
  }[] = []
  const cache = new FrameTransfer(
    (url, signal) =>
      new Promise<Blob>((resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), {
          once: true,
        })
        requests.push({
          url,
          signal,
          resolve: (blob) => resolve(blob ?? new Blob([url])),
          reject,
        })
      }),
    new EncodedFrameCache(budget),
    concurrency
  )
  return {
    cache,
    requests,
    resolve: async (url: string) => {
      requests
        .findLast((request) => request.url === url && !request.signal.aborted)
        ?.resolve()
      await flush()
    },
  }
}
function player(cache: FrameTransfer, options: Partial<SequenceOptions> = {}) {
  const painted: number[] = []
  let visible: string | undefined
  let release: (() => void) | undefined
  const instance = new SequenceDemandController(cache, {
    frameCount: 10,
    source,
    frameDuration: 10,
    ...options,
    onFrame: (index, frame) => {
      const previous = release
      release = instance.retainSurface(frame)
      visible = frame.src
      previous?.()
      painted.push(index)
      options.onFrame?.(index, frame)
    },
  })
  const dispose = () => {
    instance.dispose()
    release?.()
  }
  disposals.push(dispose)
  return { instance, painted, dispose, visible: () => visible }
}
beforeEach(() => {
  vi.useFakeTimers()
  images = []
  urls = []
  revoked = []
  decode = undefined
  vi.stubGlobal('Image', FakeImage)
  vi.stubGlobal('URL', {
    createObjectURL: () => {
      const url = `blob:${urls.length}`
      urls.push(url)
      return url
    },
    revokeObjectURL: (url: string) => revoked.push(url),
  })
  vi.stubGlobal('requestAnimationFrame', (fn: (time: number) => void) =>
    setTimeout(() => fn(0), 16)
  )
  vi.stubGlobal('cancelAnimationFrame', clearTimeout)
})
afterEach(async () => {
  for (const dispose of disposals.splice(0)) dispose()
  await flush()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('responsive sources and transfer ownership', () => {
  it('spreads binary coverage across every frame exactly once', () => {
    expect(binaryFrameOrder(0, 8)).toEqual([0, 8, 4, 2, 6, 1, 3, 5, 7])
    for (let n = 0; n < 100; n++)
      expect([...binaryFrameOrder(0, n - 1)].sort((a, b) => a - b)).toEqual(
        Array.from({ length: n }, (_, i) => i)
      )
  })
  it('selects the smallest sufficient width, caps at largest, and falls back for density descriptors', () => {
    const source = {
      src: 'original',
      srcSet: 'large 1080w, small 320w, medium 640w',
    }
    expect(
      [100, 321, 640, 641, 2400].map((width) => resolveFrameUrl(source, width))
    ).toEqual(['small', 'medium', 'medium', 'large', 'large'])
    expect(
      resolveFrameUrl({ src: 'fallback', srcSet: 'one 1x, two 2x' }, 500)
    ).toBe('fallback')
  })
  it('admits eight transfers and deduplicates resolved URLs between owners', async () => {
    const { cache, requests, resolve } = transport()
    const a = Symbol(),
      b = Symbol()
    const demand = Array.from({ length: 9 }, (_, i) => ({
      source: source(i),
      priority: i,
    }))
    cache.update(a, demand, () => {})
    cache.update(
      b,
      [
        {
          source: resolveFrameSource(
            { src: 'other', srcSet: 'frame-0 640w' },
            500
          ),
          priority: 0,
        },
      ],
      () => {}
    )
    expect(requests).toHaveLength(8)
    await resolve('frame-0')
    expect(requests).toHaveLength(9)
    cache.release(a)
    cache.release(b)
  })
  it('round-robins visible owners even when only one slot completes at a time', async () => {
    const { cache, requests, resolve } = transport(1)
    const a = Symbol(),
      b = Symbol()
    cache.update(
      a,
      [0, 1, 2].map((i) => ({ source: `a${i}`, priority: i })),
      () => {}
    )
    cache.update(
      b,
      [0, 1, 2].map((i) => ({ source: `b${i}`, priority: i })),
      () => {}
    )
    await resolve('a0')
    expect(requests.at(-1)?.url).toBe('b0')
    await resolve('b0')
    expect(requests.at(-1)?.url).toBe('a1')
    await resolve('a1')
    expect(requests.at(-1)?.url).toBe('b1')
    cache.release(a)
    cache.release(b)
  })
  it('gives visible demand a slot after the nearby retirement grace', async () => {
    const { cache, requests } = transport(1)
    const a = Symbol(),
      b = Symbol()
    cache.update(a, [{ source: 'nearby', priority: 0 }], () => {}, false)
    cache.update(b, [{ source: 'visible', priority: 0 }], () => {})
    await vi.advanceTimersByTimeAsync(999)
    expect(requests).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(requests[0].signal.aborted).toBe(true)
    expect(requests.at(-1)?.url).toBe('visible')
    cache.release(a)
    cache.release(b)
  })
  it('evicts encoded blobs by byte budget and recency', () => {
    const cache = new EncodedFrameCache(6)
    cache.put('a', new Blob(['aaa']))
    cache.put('b', new Blob(['bbb']))
    cache.get('a')
    cache.put('c', new Blob(['ccc']))
    expect(cache.has('b')).toBe(false)
    expect(cache.has('a')).toBe(true)
    cache.put('huge', new Blob(['1234567']))
    expect(cache.has('huge')).toBe(false)
  })
  it('preserves content type and Accept metadata', async () => {
    const fetcher = vi.fn(
      async () =>
        new Response(new Uint8Array([1, 2]), {
          headers: { 'content-type': 'image/webp' },
        })
    )
    vi.stubGlobal('fetch', fetcher)
    const cache = new FrameTransfer(),
      owner = Symbol()
    cache.update(
      owner,
      [
        {
          source: resolveFrameSource(
            { src: 'original', srcSet: 'small 320w', accept: 'image/webp' },
            100
          ),
          priority: 0,
        },
      ],
      () => {}
    )
    await flush()
    expect(fetcher).toHaveBeenCalledWith(
      'small',
      expect.objectContaining({ headers: { Accept: 'image/webp' } })
    )
    expect(cache.get('small')?.type).toBe('image/webp')
    cache.release(owner)
  })
  it('allows slow streaming beyond 15 seconds while bytes continue; times out only contended idle slots', async () => {
    let body!: ReadableStreamDefaultController<Uint8Array>
    let signal!: AbortSignal
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        if (url === 'waiting') return new Response('done')
        signal = init.signal as AbortSignal
        return new Response(
          new ReadableStream({
            start(controller) {
              body = controller
              signal.addEventListener('abort', () => body.error(signal.reason))
            },
          })
        )
      })
    )
    const cache = new FrameTransfer(undefined, new EncodedFrameCache(), 1),
      owner = Symbol()
    cache.update(owner, [{ source: 'slow', priority: 0 }], () => {})
    await flush()
    await vi.advanceTimersByTimeAsync(60000)
    expect(signal.aborted).toBe(false)
    cache.update(
      owner,
      [
        { source: 'slow', priority: 0 },
        { source: 'waiting', priority: 1 },
      ],
      () => {}
    )
    for (let i = 0; i < 3; i++) {
      await vi.advanceTimersByTimeAsync(14000)
      body.enqueue(new Uint8Array([i]))
      await flush()
    }
    expect(signal.aborted).toBe(false)
    await vi.advanceTimersByTimeAsync(15000)
    expect(signal.aborted).toBe(true)
    expect(await cache.get('waiting')?.text()).toBe('done')
    cache.release(owner)
  })
  it('cancels oversized streamed bodies without retrying while demanded', async () => {
    let pulls = 0
    const cancel = vi.fn()
    const fetcher = vi.fn(
      async () =>
        new Response(
          new ReadableStream({
            pull(controller) {
              pulls++
              controller.enqueue(
                new Uint8Array(DEFAULT_ENCODED_FRAME_BUDGET / 2)
              )
            },
            cancel,
          })
        )
    )
    vi.stubGlobal('fetch', fetcher)
    const cache = new FrameTransfer(),
      owner = Symbol()
    cache.update(owner, [{ source: 'huge', priority: 0 }], () => {})
    await flush()
    await vi.advanceTimersByTimeAsync(60000)
    expect(cache.hasFailed('huge')).toBe(true)
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(cancel).toHaveBeenCalled()
    expect(pulls).toBeLessThanOrEqual(4)
    cache.release(owner)
  })
  it('retries transient failures only while demanded', async () => {
    const { cache, requests } = transport(1),
      owner = Symbol()
    cache.update(owner, [{ source: 'retry', priority: 0 }], () => {})
    requests[0].reject(new Error('offline'))
    await flush()
    await vi.advanceTimersByTimeAsync(499)
    expect(requests).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(requests).toHaveLength(2)
    requests[1].reject(new Error('offline'))
    await flush()
    cache.release(owner)
    await vi.advanceTimersByTimeAsync(60000)
    expect(requests).toHaveLength(2)
  })
})

describe('local readiness and presentation', () => {
  it('starts without waiting for the last frame and retains at most three future decoded frames', async () => {
    const { cache, resolve } = transport()
    const { instance, painted } = player(cache)
    instance.setConditions(true, true)
    await resolve('frame-0')
    expect(painted).toEqual([0])
    for (let i = 1; i < 8; i++) await resolve(source(i))
    expect(urls.length - revoked.length).toBeLessThanOrEqual(4)
    instance.tick(10)
    expect(painted.at(-1)).toBe(1)
  })
  it('holds strict sequential playback at a missing next frame, with an explicit skip opt-in', async () => {
    const { cache, resolve } = transport()
    const strict = player(cache, { priority: 'sequential' })
    const skipping = player(cache, { priority: 'sequential', maxFrameSkip: 1 })
    strict.instance.setConditions(true, true)
    skipping.instance.setConditions(true, true)
    await resolve('frame-0')
    await resolve('frame-2')
    strict.instance.tick(10)
    skipping.instance.tick(10)
    await flush()
    skipping.instance.tick(0)
    expect(strict.painted).toEqual([0])
    expect(skipping.painted).toEqual([0, 2])
  })
  it.each(['hybrid', 'sequential'] as const)(
    'makes progress with readyAhead zero in %s mode',
    async (priority) => {
      const { cache, resolve } = transport()
      const { instance, painted } = player(cache, { priority, readyAhead: 0 })
      instance.setConditions(true, true)
      await resolve('frame-0')
      expect(urls.length - revoked.length).toBe(1)
      instance.tick(10)
      await resolve('frame-1')
      instance.tick(0)
      expect(painted).toEqual([0, 1])
    }
  )
  it('keeps hybrid authored time moving while holding and never moves backward within a loop', async () => {
    const { cache, resolve } = transport()
    const { instance, painted } = player(cache)
    instance.setConditions(true, true)
    await resolve('frame-0')
    instance.tick(50)
    await resolve('frame-5')
    instance.tick(0)
    expect(painted.at(-1)).toBe(5)
    await resolve('frame-4')
    instance.tick(0)
    expect(painted.at(-1)).toBe(5)
  })
  it.each(['hybrid', 'sequential'] as const)(
    'presents the final frame and completes once per one-shot %s run',
    async (priority) => {
      const cache = new FrameTransfer(async (url) => new Blob([url]))
      const onComplete = vi.fn()
      const { instance, painted } = player(cache, {
        priority,
        loop: false,
        loopStart: 2,
        loopEnd: 4,
        onComplete,
      })
      instance.setConditions(true, true)
      await flush()
      for (let i = 0; i < 10; i++) {
        instance.tick(10)
        await flush()
      }
      expect(painted[0]).toBe(2)
      expect(painted.at(-1)).toBe(4)
      expect(onComplete).toHaveBeenCalledTimes(1)
      instance.setConditions(false, false)
      instance.setConditions(true, true)
      instance.tick(1000)
      await flush()
      expect(onComplete).toHaveBeenCalledTimes(1)
      expect(painted.every((index) => index >= 2 && index <= 4)).toBe(true)
    }
  )
  it('one-shot hybrid waits for the actual final frame when it is delayed', async () => {
    const { cache, resolve } = transport()
    const onComplete = vi.fn(),
      { instance, painted } = player(cache, {
        loop: false,
        frameCount: 3,
        onComplete,
      })
    instance.setConditions(true, true)
    await resolve('frame-0')
    instance.tick(100)
    expect(onComplete).not.toHaveBeenCalled()
    await resolve('frame-2')
    instance.tick(0)
    expect(painted.at(-1)).toBe(2)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
  it('wraps only within the configured loop bounds', async () => {
    const cache = new FrameTransfer(async (url) => new Blob([url]))
    const { instance, painted } = player(cache, {
      loopStart: 2,
      loopEnd: 4,
      priority: 'sequential',
    })
    instance.setConditions(true, true)
    await flush()
    for (let i = 0; i < 6; i++) {
      instance.tick(10)
      await flush()
    }
    expect(painted).toEqual([2, 3, 4, 2, 3, 4, 2])
  })
  it('treats decode concurrency as a soft limit: reversals admit current work before obsolete native decodes settle', async () => {
    const pending: (() => void)[] = []
    decode = () => new Promise((resolve) => pending.push(resolve))
    const cache = new FrameTransfer(async (url) => new Blob([url]))
    const { instance, painted } = player(cache, {
      frameCount: 30,
      mode: 'scrub',
    })
    instance.setConditions(true, true)
    instance.setTarget(20)
    await flush()
    const old = pending.splice(0)
    expect(old.length).toBe(3)
    instance.setTarget(2)
    await flush()
    expect(pending.length).toBe(3)
    old.forEach((resolve) => resolve())
    await flush()
    expect(painted).toEqual([])
    pending[0]()
    await flush()
    expect(painted.at(-1)).toBe(2)
  })
  it('coalesces target changes and stale candidates never move away from the latest target', async () => {
    const cache = new FrameTransfer(async (url) => new Blob([url]))
    const { instance, painted } = player(cache, {
      mode: 'scrub',
      frameCount: 30,
    })
    instance.setConditions(true, true)
    await flush()
    instance.queueTarget(25)
    instance.queueTarget(2)
    await vi.advanceTimersByTimeAsync(16)
    await flush()
    expect(painted.at(-1)).toBe(2)
    expect(painted).not.toContain(25)
  })
  it('resize keeps the old surface alive, ignores stale decodes, and resolves future identities', async () => {
    let size = 'small'
    const cache = new FrameTransfer(async (url) => new Blob([url]))
    const { instance, visible } = player(cache, {
      source: (i) => `${size}-${i}`,
      mode: 'scrub',
    })
    instance.setConditions(true, true)
    await flush()
    const previous = visible()!
    const pending: (() => void)[] = []
    decode = () => new Promise((resolve) => pending.push(resolve))
    size = 'large'
    instance.resetWindow()
    await flush()
    expect(revoked).not.toContain(previous)
    pending[0]()
    await flush()
    expect(visible()).not.toBe(previous)
    expect(revoked).toContain(previous)
  })
  it('decoded eviction reuses encoded bytes, and suspension preserves only the surface lease', async () => {
    const load = vi.fn(async (url: string) => new Blob([url])),
      cache = new FrameTransfer(load)
    const { instance, visible, dispose } = player(cache, { mode: 'scrub' })
    instance.setConditions(true, true)
    await flush()
    const first = visible()!
    instance.setConditions(false, false)
    await flush()
    expect(revoked).not.toContain(first)
    expect(urls.length - revoked.length).toBe(1)
    const count = load.mock.calls.filter(([url]) => url === 'frame-0').length
    instance.setConditions(true, true)
    await flush()
    expect(load.mock.calls.filter(([url]) => url === 'frame-0')).toHaveLength(
      count
    )
    dispose()
    await flush()
    expect(new Set(revoked)).toEqual(new Set(urls))
    expect(revoked.length).toBe(urls.length)
  })
  it('disposal cancels decodes and cannot commit later', async () => {
    const pending: (() => void)[] = []
    decode = () => new Promise((resolve) => pending.push(resolve))
    const cache = new FrameTransfer(async (url) => new Blob([url]))
    const { instance, painted, dispose } = player(cache)
    instance.setConditions(true, true)
    await flush()
    dispose()
    pending.forEach((resolve) => resolve())
    await flush()
    expect(painted).toEqual([])
    expect(new Set(revoked)).toEqual(new Set(urls))
  })
})

describe('decode deadlines and empty sequences', () => {
  it('starts the decode deadline after bytes arrive and retries timed-out decode without refetching', async () => {
    const { cache, resolve, requests } = transport()
    const { instance, painted } = player(cache, { frameCount: 1, loop: false })
    decode = () => new Promise(() => {})
    instance.setConditions(true, true)
    await vi.advanceTimersByTimeAsync(60_000)
    expect(urls).toHaveLength(0)
    await resolve('frame-0')
    await vi.advanceTimersByTimeAsync(14_999)
    expect(revoked).toHaveLength(0)
    await vi.advanceTimersByTimeAsync(1)
    expect(revoked).toHaveLength(1)
    expect(painted).toEqual([])
    decode = undefined
    await vi.advanceTimersByTimeAsync(500)
    expect(painted).toEqual([0])
    expect(requests).toHaveLength(1)
  })

  it('keeps an empty sequence on its poster without requesting invalid indices', async () => {
    const { cache, requests } = transport()
    const { instance, painted } = player(cache, { frameCount: 0 })
    instance.setConditions(true, true)
    instance.tick(1000)
    await flush()
    expect(requests).toEqual([])
    expect(painted).toEqual([])
  })
})
