'use client'

import { useState } from 'react'

const base = '/images/logs/image-delivery'
const speeds = [24, 48, 96] as const
type Speed = (typeof speeds)[number]
type Strategy = 'blur' | 'staged' | 'progressive' | 'interlaced'
type Run = { id: string; speed: Speed }

function imageUrl(
  asset: 'baseline' | 'preview' | 'progressive' | 'interlaced',
  speed: number,
  run: string
) {
  const params = new URLSearchParams({ asset, speed: String(speed), run })
  return `/api/image-delivery?${params}`
}

function LoadingSample({
  strategy,
  run,
}: {
  strategy: Strategy
  run: Run | null
}) {
  const [finalLoaded, setFinalLoaded] = useState(false)
  const [previewLoaded, setPreviewLoaded] = useState(false)
  const isEncoded = strategy === 'progressive' || strategy === 'interlaced'
  const requestSpeed = run
    ? strategy === 'staged'
      ? run.speed / 2
      : run.speed
    : 0
  const showBlur =
    !isEncoded && !finalLoaded && (strategy === 'blur' || !previewLoaded)
  const title = {
    blur: 'Blur → final',
    staged: 'Blur → preview → final',
    progressive: 'Progressive JPEG',
    interlaced: 'Interlaced PNG',
  }[strategy]
  const status = !run
    ? 'Ready to load'
    : finalLoaded
      ? 'Final image loaded'
      : isEncoded
        ? `${title} downloading`
        : strategy === 'staged' && previewLoaded
          ? 'Preview visible; final image downloading'
          : strategy === 'staged'
            ? 'Preview and final image downloading'
            : 'Final image downloading behind the blur'

  async function revealPreview(image: HTMLImageElement) {
    try {
      await image.decode()
    } catch {
      // Some browsers reject decode after a successful load.
    }
    if (image.isConnected && image.naturalWidth) setPreviewLoaded(true)
  }

  return (
    <div data-slot="sample" className="bg-card min-w-0 p-3">
      <div
        data-slot="image-frame"
        className="bg-muted relative aspect-[3840/1956] overflow-hidden"
      >
        {run && (
          // Native img preserves the progressive/interlaced file encoding.
          <img
            data-slot="final-image"
            src={imageUrl(
              isEncoded ? strategy : 'baseline',
              requestSpeed,
              `${run.id}-${strategy}-final`
            )}
            alt={`Sazabi artwork loading with ${title.toLowerCase()}`}
            width={isEncoded ? 960 : 2560}
            height={isEncoded ? 489 : 1304}
            onLoad={() => setFinalLoaded(true)}
            className="absolute inset-0 size-full object-cover"
          />
        )}
        {strategy === 'staged' && run && !finalLoaded && (
          <img
            data-slot="preview-image"
            src={imageUrl('preview', requestSpeed, `${run.id}-staged-preview`)}
            alt=""
            aria-hidden="true"
            width={960}
            height={489}
            onLoad={(event) => void revealPreview(event.currentTarget)}
            className="absolute inset-0 size-full object-cover"
            style={{ visibility: previewLoaded ? 'visible' : 'hidden' }}
          />
        )}
        {showBlur && (
          <span
            data-slot="blur-placeholder"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden bg-[#080713]"
          >
            <span
              data-slot="blur-image"
              className="absolute -inset-6 bg-[length:100%_100%]"
              style={{
                backgroundImage: `url("${base}/artwork-blur.webp")`,
                filter: 'blur(12px)',
              }}
            />
          </span>
        )}
        {!run && isEncoded && (
          <span className="text-muted-foreground absolute inset-0 grid place-items-center text-xs">
            Press Load to start
          </span>
        )}
      </div>
      <p className="mt-2 text-sm font-medium">{title}</p>
      <p
        data-slot="status"
        aria-live="polite"
        className="text-muted-foreground min-h-8 text-xs"
      >
        {status}
      </p>
    </div>
  )
}

export default function ImageLoadingDemo() {
  const [speed, setSpeed] = useState<Speed>(48)
  const [run, setRun] = useState<Run | null>(null)

  return (
    <figure className="not-prose border-border bg-card my-8 border">
      <div
        data-slot="controls"
        className="border-border flex flex-wrap items-center gap-3 border-b px-4 py-3"
      >
        <label htmlFor="image-loading-speed" className="text-sm font-medium">
          Transfer cap
        </label>
        <select
          id="image-loading-speed"
          value={speed}
          onChange={(event) => setSpeed(Number(event.target.value) as Speed)}
          className="border-border bg-card text-foreground focus-visible:ring-primary rounded-none border px-2 py-1.5 text-sm focus-visible:ring-2"
        >
          {speeds.map((value) => (
            <option key={value} value={value}>
              {value} kB/s
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setRun({ id: crypto.randomUUID(), speed })}
          className="bg-primary text-primary-foreground hover:bg-primary/85 focus-visible:ring-primary touch-manipulation px-3 py-1.5 text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {run ? 'Load again' : 'Load images'}
        </button>
      </div>
      <div
        data-slot="comparison"
        className="bg-border grid gap-px md:grid-cols-2"
      >
        <LoadingSample
          key={`${run?.id ?? 'idle'}-blur`}
          strategy="blur"
          run={run}
        />
        <LoadingSample
          key={`${run?.id ?? 'idle'}-staged`}
          strategy="staged"
          run={run}
        />
        <LoadingSample
          key={`${run?.id ?? 'idle'}-progressive`}
          strategy="progressive"
          run={run}
        />
        <LoadingSample
          key={`${run?.id ?? 'idle'}-interlaced`}
          strategy="interlaced"
          run={run}
        />
      </div>
      <figcaption className="text-muted-foreground border-border border-t px-4 py-3 text-xs">
        These are real image requests streamed at the selected cap. Blur and
        staged loading use the 2560 px JPEG; the staged preview and final share
        the cap. The progressive JPEG and interlaced PNG use the same 960 px
        artwork and arrive unchanged, with no covering layer. When their scans
        or passes appear depends on the browser.
      </figcaption>
    </figure>
  )
}
