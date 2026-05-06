// @ts-expect-error: No types available for tiny-emitter
import { TinyEmitter } from 'tiny-emitter'

/**
 * Thin typed wrapper around `tiny-emitter`. Subclasses pin an event-map type
 * (`{ eventName: payloadType }`) so `on`/`emit` are fully typed.
 */
export class TypedEmitter<EventMap extends Record<string, unknown>> {
  private readonly emitter = new TinyEmitter()

  on<K extends keyof EventMap & string>(
    event: K,
    listener: (payload: EventMap[K]) => void
  ): () => void {
    this.emitter.on(event, listener as (...args: unknown[]) => void)
    return () => this.off(event, listener)
  }

  once<K extends keyof EventMap & string>(
    event: K,
    listener: (payload: EventMap[K]) => void
  ): void {
    this.emitter.once(event, listener as (...args: unknown[]) => void)
  }

  off<K extends keyof EventMap & string>(
    event: K,
    listener?: (payload: EventMap[K]) => void
  ): void {
    this.emitter.off(
      event,
      listener as ((...args: unknown[]) => void) | undefined
    )
  }

  protected emit<K extends keyof EventMap & string>(
    event: K,
    payload: EventMap[K]
  ): void {
    this.emitter.emit(event, payload)
  }
}
