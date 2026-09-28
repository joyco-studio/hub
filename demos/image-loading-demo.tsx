'use client'

import Image from 'next/image'
import { useState } from 'react'

const base = '/images/logs/image-delivery'
const speeds = [24, 48, 96] as const
type Speed = (typeof speeds)[number]
type Strategy = 'blur' | 'staged' | 'progressive'
type Run = { id: string; speed: Speed }

function imageUrl(
  asset: 'baseline' | 'preview' | 'progressive',
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
  const isProgressive = strategy === 'progressive'
  const requestSpeed = run
    ? strategy === 'staged'
      ? run.speed / 2
      : run.speed
    : 0
  const showBlur =
    !isProgressive && !finalLoaded && (strategy === 'blur' || !previewLoaded)
  const title = {
    blur: 'Blur → final',
    staged: 'Blur → preview → final',
    progressive: 'Progressive JPEG',
  }[strategy]
  const status = !run
    ? 'Ready to load'
    : finalLoaded
      ? 'Final image loaded'
      : isProgressive
        ? 'Progressive JPEG downloading'
        : strategy === 'staged' && previewLoaded
          ? 'Preview visible; final image downloading'
          : strategy === 'staged'
            ? 'Preview and final image downloading'
            : 'Final image downloading behind the blur'

  return (
    <div data-slot="sample" className="bg-card min-w-0 p-3">
      <div
        data-slot="image-frame"
        className="bg-muted relative aspect-[3840/1956] overflow-hidden"
      >
        {run && (
          // A native img receives the original JPEG bytes. Next Image would
          // route the file through an optimizer and may change its encoding.
          <img
            data-slot="final-image"
            src={imageUrl(
              isProgressive ? 'progressive' : 'baseline',
              requestSpeed,
              `${run.id}-${strategy}-final`
            )}
            alt={`Sazabi artwork loading with ${title.toLowerCase()}`}
            width={2560}
            height={1304}
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
            onLoad={() => setPreviewLoaded(true)}
            className="absolute inset-0 size-full object-cover"
            style={{ visibility: previewLoaded ? 'visible' : 'hidden' }}
          />
        )}
        {showBlur && (
          <Image
            data-slot="blur-image"
            src={`${base}/artwork-blur.webp`}
            alt=""
            aria-hidden="true"
            width={16}
            height={8}
            unoptimized
            className="absolute inset-0 size-full object-cover blur-xl"
          />
        )}
        {!run && isProgressive && (
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
        className="bg-border grid gap-px md:grid-cols-3"
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
      </div>
      <figcaption className="text-muted-foreground border-border border-t px-4 py-3 text-xs">
        These are real image requests streamed at the selected cap. The staged
        example splits that cap between its preview and final requests. The
        progressive panel receives an unchanged progressive JPEG with no
        covering layer; when its scans become visible depends on the browser.
      </figcaption>
    </figure>
  )
}
