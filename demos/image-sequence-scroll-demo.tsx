'use client'

import { useEffect, useRef, useState } from 'react'
import { Cluster, Filler } from '@/components/ui/cluster'
import { ImageSequence } from '@/registry/components/image-sequence'

const frameCount = 71
const source = (index: number) =>
  `https://qfxa88yauvyse9vr.public.blob.vercel-storage.com/sequence-03/Ducky${String(index).padStart(2, '0')}.webp`

export default function ImageSequenceScrollDemo() {
  const section = useRef<HTMLDivElement>(null)
  const [target, setTarget] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        if (!section.current) return
        const { top, height } = section.current.getBoundingClientRect()
        const margin = window.innerHeight * 0.2
        const distance = Math.max(1, height + window.innerHeight - margin * 2)
        const progress = Math.max(
          0,
          Math.min(1, (window.innerHeight - margin - top) / distance)
        )
        setTarget(Math.round(progress * (frameCount - 1)))
      })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div className="w-full">
      <Cluster direction="col" align="stretch">
        <Cluster>
          <p className="p-3 text-sm">Scroll the page to animate the duck.</p>
          <Filler />
          <span className="w-12 shrink-0 py-3 text-center font-mono text-sm tabular-nums">
            {Math.round((target / (frameCount - 1)) * 100)}%
          </span>
        </Cluster>
        <div ref={section} className="grid h-96 place-items-center">
          <ImageSequence
            sequenceId="scroll-duck"
            poster={{ src: source(0), width: 600, height: 600 }}
            frameCount={frameCount}
            source={source}
            mode="scrub"
            target={target}
            alt="Duck animated by page scrolling"
            className="size-64 max-h-full max-w-full"
          />
        </div>
      </Cluster>
    </div>
  )
}
