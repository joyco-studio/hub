import type { FrameSource } from './runtime'

export type TransferDemand = { source: FrameSource; priority: number }
type Owner = { wanted: TransferDemand[]; notify: () => void; active: boolean }
type Entry = {
  url: string
  accept?: string
  state: 'queued' | 'pending' | 'failed' | 'ready'
  controller?: AbortController
  failures: number
  retryTimer?: ReturnType<typeof setTimeout>
  retireTimer?: ReturnType<typeof setTimeout>
  contentionTimer?: ReturnType<typeof setTimeout>
  timedOut?: boolean
  preempted?: boolean
  reclaiming?: boolean
  preemptTimer?: ReturnType<typeof setTimeout>
}
const DEFAULT_ENCODED_FRAME_BUDGET = 16 * 1024 * 1024
const PENDING_FRAME_GRACE_MS = 1_000
const CONTENDED_FRAME_IDLE_MS = 15_000
export const sourceUrl = (source: FrameSource) =>
  typeof source === 'string' ? source : source.src

class OversizedFrameError extends Error {
  constructor() {
    super('Frame exceeds encoded byte budget')
    this.name = 'OversizedFrameError'
  }
}

class FrameHttpError extends Error {
  readonly retryable: boolean
  constructor(status: number) {
    super(`Frame request failed: ${status}`)
    this.retryable = status === 408 || status === 429 || status >= 500
  }
}

/** Compressed responses survive local decoded-frame eviction. */
class EncodedFrameCache {
  private entries = new Map<string, Blob>()
  private bytes = 0
  has(url: string) {
    return this.entries.has(url)
  }
  get(url: string) {
    const blob = this.entries.get(url)
    if (!blob) return undefined
    this.entries.delete(url)
    this.entries.set(url, blob)
    return blob
  }
  put(url: string, blob: Blob) {
    const previous = this.entries.get(url)
    if (previous) {
      this.bytes -= previous.size
      this.entries.delete(url)
    }
    if (blob.size > DEFAULT_ENCODED_FRAME_BUDGET) return
    this.entries.set(url, blob)
    this.bytes += blob.size
    while (this.bytes > DEFAULT_ENCODED_FRAME_BUDGET) {
      const oldest = this.entries.keys().next().value
      if (oldest === undefined) break
      this.bytes -= this.entries.get(oldest)!.size
      this.entries.delete(oldest)
    }
  }
}

/** Shared admission and deduplication. Owns encoded bytes, never decoded images. */
class FrameTransfer {
  private entries = new Map<string, Entry>()
  private owners = new Map<symbol, Owner>()
  private active = 0
  private reclaiming = 0
  private lastOwner?: symbol
  private encoded = new EncodedFrameCache()
  private concurrency = 8
  private async load(
    url: string,
    signal: AbortSignal,
    accept?: string,
    onBytes?: () => void
  ) {
    const response = await fetch(url, {
      signal,
      priority: 'low',
      ...(accept ? { headers: { Accept: accept } } : {}),
    })
    if (!response.ok) {
      void response.body?.cancel().catch(() => {})
      throw new FrameHttpError(response.status)
    }
    const type = response.headers.get('content-type') ?? ''
    if (!response.body) return new Blob([], { type })
    const reader = response.body.getReader()
    const chunks: Uint8Array<ArrayBuffer>[] = []
    let bytes = 0
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (value.byteLength === 0) continue
        if (value.byteLength > DEFAULT_ENCODED_FRAME_BUDGET - bytes) {
          void reader.cancel().catch(() => {})
          throw new OversizedFrameError()
        }
        bytes += value.byteLength
        // Stream producers may reuse the buffer before the Blob is assembled.
        chunks.push(new Uint8Array(value))
        onBytes?.()
      }
    } finally {
      reader.releaseLock()
    }
    return new Blob(chunks, { type })
  }
  get(source: FrameSource) {
    return this.encoded.get(sourceUrl(source))
  }
  update(
    owner: symbol,
    wanted: TransferDemand[],
    notify: () => void,
    active = true
  ) {
    this.owners.set(owner, { wanted, notify, active })
    for (const item of wanted) {
      const entry = this.entries.get(sourceUrl(item.source))
      if (
        entry?.state === 'ready' &&
        !this.encoded.has(entry.url) &&
        item.priority <= 1
      )
        entry.state = 'queued'
    }
    this.reconcile()
  }
  release(owner: symbol) {
    this.owners.delete(owner)
    this.reconcile()
  }
  private desired() {
    const wanted = new Map<string, string | undefined>()
    for (const owner of this.owners.values()) {
      for (const item of owner.wanted) {
        const url = sourceUrl(item.source)
        const accept =
          typeof item.source === 'string' ? undefined : item.source.accept
        if (wanted.has(url) && wanted.get(url) !== accept)
          throw new Error(`Conflicting Accept headers for frame ${url}`)
        wanted.set(url, accept)
      }
    }
    return wanted
  }
  private visibleUrls() {
    const wanted = new Set<string>()
    for (const owner of this.owners.values())
      if (owner.active)
        for (const item of owner.wanted) wanted.add(sourceUrl(item.source))
    return wanted
  }
  private queue() {
    const seen = new Set<string>()
    const owners = [...this.owners.entries()]
    const previous = owners.findIndex(([id]) => id === this.lastOwner)
    const rotated = [
      ...owners.slice(previous + 1),
      ...owners.slice(0, previous + 1),
    ]
    const queue: { url: string; owner: symbol }[] = []
    // Rotate after every admission, including when only one slot becomes free.
    // Rebuilding a fixed owner order would starve later owners on rolling requests.
    for (const active of [true, false]) {
      const lanes = rotated
        .filter(([, owner]) => owner.active === active)
        .map(([id, owner]) => ({
          id,
          urls: [...owner.wanted]
            .sort((a, b) => a.priority - b.priority)
            .map((item) => sourceUrl(item.source)),
        }))
      while (lanes.some((lane) => lane.urls.length)) {
        for (const lane of lanes) {
          let url = lane.urls.shift()
          while (
            url &&
            (seen.has(url) || this.entries.get(url)?.state !== 'queued')
          )
            url = lane.urls.shift()
          if (url) {
            seen.add(url)
            queue.push({ url, owner: lane.id })
          }
        }
      }
    }
    return queue
  }
  private reconcile() {
    const wanted = this.desired()
    for (const [url, entry] of this.entries) {
      if (!wanted.has(url)) {
        if (entry.state === 'pending') this.retire(entry)
        else {
          if (entry.retryTimer) clearTimeout(entry.retryTimer)
          this.clearContentionTimer(entry)
          this.entries.delete(url)
        }
      } else if (entry.retireTimer) {
        clearTimeout(entry.retireTimer)
        entry.retireTimer = undefined
      }
    }
    for (const [url, accept] of wanted)
      if (!this.encoded.has(url) && !this.entries.has(url))
        this.entries.set(url, { url, accept, state: 'queued', failures: 0 })
    const queue = this.queue()
    let slotsNeeded = Math.max(
      0,
      Math.min(
        queue.length,
        this.active - this.reclaiming + queue.length - this.concurrency
      )
    )
    for (const [url, entry] of this.entries) {
      if (!slotsNeeded || !entry.retireTimer) continue
      clearTimeout(entry.retireTimer)
      entry.retireTimer = undefined
      entry.controller?.abort()
      entry.reclaiming = true
      this.reclaiming++

      this.entries.delete(url)
      slotsNeeded--
    }
    // A newly visible owner must not wait behind already admitted nearby work.
    const visibleUrls = this.visibleUrls()
    const visibleQueued = queue.filter((item) => visibleUrls.has(item.url))
    let visibleSlotsNeeded = Math.max(
      0,
      Math.min(
        visibleQueued.length,
        this.active - this.reclaiming + visibleQueued.length - this.concurrency
      )
    )
    for (const entry of this.entries.values()) {
      if (!visibleSlotsNeeded) break
      if (
        entry.state !== 'pending' ||
        !wanted.has(entry.url) ||
        visibleUrls.has(entry.url) ||
        entry.controller?.signal.aborted
      )
        continue
      // Keep the entry pending until its aborted fetch settles, then requeue it.
      // This preserves deduplication and prevents it from racing the visible URL.
      if (!entry.preemptTimer)
        entry.preemptTimer = setTimeout(() => {
          entry.preemptTimer = undefined
          if (
            entry.state !== 'pending' ||
            entry.controller?.signal.aborted ||
            this.visibleUrls().has(entry.url) ||
            !this.queue().some((item) => this.visibleUrls().has(item.url))
          )
            return
          entry.preempted = true
          entry.controller?.abort()
          entry.reclaiming = true
          this.reclaiming++
        }, PENDING_FRAME_GRACE_MS)
      visibleSlotsNeeded--
    }
    for (const { url, owner } of queue) {
      if (this.active >= this.concurrency) break
      const entry = this.entries.get(url)
      if (!entry || entry.state !== 'queued') continue
      const controller = new AbortController()
      entry.controller = controller
      entry.state = 'pending'
      entry.timedOut = false
      this.lastOwner = owner
      this.active++
      void this.load(url, controller.signal, entry.accept, () => {
        if (entry.controller !== controller || controller.signal.aborted) return
        if (entry.contentionTimer) this.armContentionTimer(entry)
      })
        .then(
          (blob) => {
            if (controller.signal.aborted || this.entries.get(url) !== entry)
              return
            this.encoded.put(url, blob)
            entry.state = 'ready'

            for (const owner of this.owners.values()) owner.notify()
          },
          (error) => {
            if (
              (controller.signal.aborted && !entry.timedOut) ||
              this.entries.get(url) !== entry
            )
              return
            this.fail(entry, error)
          }
        )
        .finally(() => {
          this.clearContentionTimer(entry)
          if (entry.preemptTimer) clearTimeout(entry.preemptTimer)
          entry.preemptTimer = undefined
          this.active--
          if (entry.reclaiming) {
            this.reclaiming--
            entry.reclaiming = false
          }
          if (
            entry.timedOut &&
            entry.state === 'pending' &&
            this.entries.get(url) === entry
          )
            this.fail(entry, controller.signal.reason)
          entry.controller = undefined
          if (entry.retireTimer) clearTimeout(entry.retireTimer)
          entry.retireTimer = undefined
          if (entry.preempted) {
            entry.preempted = false
            if (this.entries.get(url) === entry) {
              if (this.desired().has(url)) entry.state = 'queued'
              else this.entries.delete(url)
            }
          }
          this.reconcile()
        })
    }
    this.syncContentionTimers()
  }
  private clearContentionTimer(entry: Entry) {
    if (entry.contentionTimer) clearTimeout(entry.contentionTimer)
    entry.contentionTimer = undefined
  }
  private hasQueuedFrames() {
    for (const entry of this.entries.values())
      if (entry.state === 'queued') return true
    return false
  }
  private armContentionTimer(entry: Entry) {
    this.clearContentionTimer(entry)
    const controller = entry.controller
    if (!controller) return
    entry.contentionTimer = setTimeout(() => {
      entry.contentionTimer = undefined
      if (
        this.entries.get(entry.url) !== entry ||
        entry.state !== 'pending' ||
        entry.controller !== controller ||
        controller.signal.aborted ||
        this.active - this.reclaiming < this.concurrency ||
        !this.hasQueuedFrames()
      )
        return
      entry.timedOut = true
      entry.reclaiming = true
      this.reclaiming++
      controller.abort(
        new DOMException('Contended frame stalled', 'TimeoutError')
      )
      this.syncContentionTimers()
    }, CONTENDED_FRAME_IDLE_MS)
  }
  private syncContentionTimers() {
    const queued = this.hasQueuedFrames()
    const contended =
      queued && this.active - this.reclaiming >= this.concurrency
    for (const entry of this.entries.values()) {
      if (
        !queued ||
        entry.state !== 'pending' ||
        entry.retireTimer ||
        !entry.controller ||
        entry.controller.signal.aborted
      )
        this.clearContentionTimer(entry)
      else if (contended) {
        if (!entry.contentionTimer) this.armContentionTimer(entry)
      } else this.clearContentionTimer(entry)
    }
  }
  private retire(entry: Entry) {
    if (entry.retireTimer) return
    this.clearContentionTimer(entry)
    if (!entry.controller) {
      this.entries.delete(entry.url)
      return
    }
    entry.retireTimer = setTimeout(() => {
      entry.retireTimer = undefined
      if (
        this.entries.get(entry.url) !== entry ||
        this.desired().has(entry.url) ||
        entry.state !== 'pending'
      )
        return
      entry.controller?.abort()
      entry.reclaiming = true
      this.reclaiming++

      this.entries.delete(entry.url)
    }, PENDING_FRAME_GRACE_MS)
  }
  private fail(entry: Entry, error: unknown) {
    entry.state = 'failed'
    entry.failures++

    if (
      !(error instanceof OversizedFrameError) &&
      (!(error instanceof FrameHttpError) || error.retryable)
    )
      this.retry(entry)
    for (const owner of this.owners.values()) owner.notify()
  }
  private retry(entry: Entry) {
    const delay = Math.min(500 * 2 ** Math.min(entry.failures - 1, 6), 30_000)
    entry.retryTimer = setTimeout(() => {
      entry.retryTimer = undefined
      if (
        this.entries.get(entry.url) !== entry ||
        !this.desired().has(entry.url)
      )
        return
      entry.state = 'queued'

      this.reconcile()
    }, delay)
  }
}
let shared: FrameTransfer | undefined
export const getSharedFrameTransfer = () => (shared ??= new FrameTransfer())
