'use client'

import { useState } from 'react'
import { CanvasSequence } from '@/registry/joyco/blocks/image-sequence'
import { cn } from '@/lib/utils'

const sequences = [
  {
    name: 'Grafitty Can',
    frameCount: 71,
    getImagePath: (idx: number) =>
      `https://qfxa88yauvyse9vr.public.blob.vercel-storage.com/sequence-01/Lata${String(idx).padStart(2, '0')}.webp`,
  },
  {
    name: 'Sentinel Bot',
    frameCount: 71,
    getImagePath: (idx: number) =>
      `https://qfxa88yauvyse9vr.public.blob.vercel-storage.com/sequence-02/Bot${String(idx).padStart(2, '0')}.webp`,
  },
  {
    name: 'Rubber Duck',
    frameCount: 71,
    getImagePath: (idx: number) =>
      `https://qfxa88yauvyse9vr.public.blob.vercel-storage.com/sequence-03/Ducky${String(idx).padStart(2, '0')}.webp`,
  },
]

function ImageSequenceDemo() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="flex min-h-80 w-full items-center justify-center p-8">
      <div className="flex flex-wrap items-center justify-center gap-6">
        {sequences.map((seq, index) => {
          const isActive = index === activeIndex

          return (
            <div
              key={seq.name}
              className="relative cursor-pointer"
              onMouseEnter={() => setActiveIndex(index)}
            >
              <CanvasSequence
                frameCount={seq.frameCount}
                frameDuration={33}
                getImagePath={seq.getImagePath}
                width={200}
                height={200}
                objectFit="contain"
                isPlaying={isActive}
                resetOnPlay
                className="rounded-lg transition-opacity duration-200"
                style={{ opacity: isActive ? 1 : 0.5 }}
              />

              {/* Active frame indicator */}
              <div
                className={cn(
                  'pointer-events-none absolute inset-0 border-2',
                  isActive
                    ? 'border-primary opacity-100'
                    : 'border-transparent opacity-0'
                )}
              >
                <span className="bg-primary -translate-y-full text-primary-foreground absolute top-0 -left-0.5 px-1 py-0.5 font-mono text-xs uppercase">
                  {seq.name}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ImageSequenceDemo
