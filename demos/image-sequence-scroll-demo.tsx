'use client'

import { useState } from 'react'
import { Cluster, Filler } from '@/components/ui/cluster'
import { ImageSequence } from '@/registry/components/image-sequence'

const frameCount = 71
const source = (index: number) =>
  `https://qfxa88yauvyse9vr.public.blob.vercel-storage.com/sequence-02/Bot${String(index).padStart(2, '0')}.webp`

export default function ImageSequenceScrollDemo() {
  const [target, setTarget] = useState(0)

  return (
    <Cluster direction="col" align="stretch" className="w-full">
      <Cluster>
        <p className="p-3 text-sm">
          Scroll to rotate. Try reversing direction.
        </p>
        <Filler />
        <span className="p-3 font-mono text-sm tabular-nums">
          {Math.round((target / (frameCount - 1)) * 100)}%
        </span>
      </Cluster>
      <div
        role="region"
        aria-label="Scroll-controlled robot sequence. Scroll or use the arrow keys to rotate."
        tabIndex={0}
        className="focus-visible:outline-ring h-96 overflow-y-auto overscroll-contain focus-visible:outline-2 focus-visible:-outline-offset-2"
        onScroll={({ currentTarget }) => {
          const { scrollTop, scrollHeight, clientHeight } = currentTarget
          const progress = Math.max(
            0,
            Math.min(1, scrollTop / Math.max(1, scrollHeight - clientHeight))
          )
          setTarget(Math.round(progress * (frameCount - 1)))
        }}
      >
        <div className="h-[300%]">
          <div className="sticky top-0 grid h-96 place-items-center">
            <ImageSequence
              sequenceId="scroll-robot"
              poster={{ src: source(0), width: 600, height: 600 }}
              frameCount={frameCount}
              source={source}
              mode="scrub"
              target={target}
              alt="Robot rotating as you scroll"
              className="size-64 max-w-full"
            />
          </div>
        </div>
      </div>
    </Cluster>
  )
}
