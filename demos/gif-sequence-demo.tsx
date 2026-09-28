'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useSequence } from '@/registry/components/image-sequence'

const base = '/images/logs/image-delivery'
const frameCount = 8
const frameDuration = 130
const framePath = (index: number) =>
  `${base}/frames/${String(index).padStart(2, '0')}.webp`

export default function GifSequenceDemo() {
  const [playing, setPlaying] = useState(false)
  const [frame, setFrame] = useState(0)
  const { state } = useSequence({ frameCount, getImagePath: framePath })
  const ready = state.loadedCount === frameCount

  useEffect(() => {
    if (!playing || !ready) return
    const timer = window.setInterval(
      () => setFrame((current) => (current + 1) % frameCount),
      frameDuration
    )
    return () => window.clearInterval(timer)
  }, [playing, ready])

  return (
    <figure className="not-prose border-border bg-card my-8 border">
      <div
        data-slot="controls"
        className="border-border flex flex-wrap items-center gap-4 border-b px-4 py-3"
      >
        <button
          type="button"
          onClick={() => {
            if (playing) {
              setPlaying(false)
            } else {
              setFrame(0)
              setPlaying(true)
            }
          }}
          disabled={!ready}
          className="bg-primary text-primary-foreground hover:bg-primary/85 focus-visible:ring-primary touch-manipulation px-3 py-1.5 text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          {!ready ? 'Loading frames…' : playing ? 'Stop' : 'Play both'}
        </button>
        <span aria-live="polite" className="text-muted-foreground text-xs">
          {ready
            ? 'The sequence can be paused and scrubbed.'
            : `${state.loadedCount}/${frameCount} frames ready`}
        </span>
      </div>
      <div
        data-slot="comparison"
        className="bg-border grid gap-px sm:grid-cols-2"
      >
        <div data-slot="gif" className="bg-card min-w-0 p-3">
          <Image
            src={playing ? `${base}/animation.gif` : framePath(0)}
            alt="Johanna Arrieta showcase animation as a GIF"
            width={540}
            height={540}
            unoptimized
            loading="lazy"
            className="mx-auto aspect-square w-full max-w-64 object-contain"
          />
          <p className="mt-2 text-sm font-medium">GIF</p>
          <p className="text-muted-foreground text-xs">One file · 171 kB</p>
        </div>
        <div data-slot="sequence" className="bg-card min-w-0 p-3">
          <Image
            src={framePath(frame)}
            alt={`Johanna Arrieta showcase animation, frame ${frame + 1} of ${frameCount}`}
            width={540}
            height={540}
            unoptimized
            loading="lazy"
            className="mx-auto aspect-square w-full max-w-64 object-contain"
          />
          <p className="mt-2 text-sm font-medium">Image sequence</p>
          <p className="text-muted-foreground text-xs">
            Eight WebP files · 47 kB total
          </p>
          <label
            htmlFor="image-sequence-frame"
            className="mt-3 block text-xs font-medium"
          >
            Frame {frame + 1} of {frameCount}
          </label>
          <input
            id="image-sequence-frame"
            type="range"
            min="0"
            max={frameCount - 1}
            value={frame}
            onChange={(event) => {
              setPlaying(false)
              setFrame(Number(event.target.value))
            }}
            disabled={!ready}
            className="accent-primary focus-visible:ring-primary mt-1 w-full cursor-pointer focus-visible:ring-2 disabled:cursor-wait"
          />
        </div>
      </div>
      <figcaption className="text-muted-foreground border-border border-t px-4 py-3 text-xs">
        Identical source animation, different delivery. File sizes describe
        these particular encodes; the sequence adds eight requests and explicit
        playback logic.
      </figcaption>
    </figure>
  )
}
