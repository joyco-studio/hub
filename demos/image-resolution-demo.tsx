'use client'

import Image from 'next/image'
import { useState } from 'react'

const base = '/images/logs/image-delivery'

export default function ImageResolutionDemo() {
  const [zoom, setZoom] = useState(1)

  return (
    <figure className="not-prose border-border bg-card my-8 border">
      <div
        data-slot="controls"
        className="border-border flex flex-wrap items-center gap-3 border-b px-4 py-3"
      >
        <label htmlFor="image-resolution-zoom" className="text-sm font-medium">
          Inspect the detail
        </label>
        <input
          id="image-resolution-zoom"
          type="range"
          min="1"
          max="2.5"
          step="0.1"
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
          className="accent-primary focus-visible:ring-primary min-w-0 flex-1 cursor-pointer focus-visible:ring-2"
        />
        <output
          htmlFor="image-resolution-zoom"
          className="w-10 text-right font-mono text-sm tabular-nums"
        >
          {zoom.toFixed(1)}×
        </output>
      </div>
      <div
        data-slot="comparison"
        className="bg-border grid gap-px sm:grid-cols-2"
      >
        {[
          { label: '480 px export', src: `${base}/artwork-small.jpg` },
          { label: '2560 px export', src: `${base}/artwork-full.jpg` },
        ].map((item) => (
          <div
            key={item.src}
            data-slot="sample"
            className="bg-card min-w-0 p-3"
          >
            <div className="relative aspect-[3840/1956] overflow-hidden">
              <Image
                src={item.src}
                alt="Sazabi showcase artwork used to compare source resolution"
                width={2560}
                height={1304}
                unoptimized
                loading="lazy"
                className="size-full object-cover"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center',
                }}
              />
            </div>
            <p className="text-muted-foreground mt-2 text-xs">{item.label}</p>
          </div>
        ))}
      </div>
      <figcaption className="text-muted-foreground border-border border-t px-4 py-3 text-xs">
        Illustrative exports from the same artwork. These are not the original
        files from the export issue.
      </figcaption>
    </figure>
  )
}
