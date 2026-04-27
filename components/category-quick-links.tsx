'use client'

import { useState } from 'react'

import {
  CategoryCardLink,
  CategoryCardLinkHeader,
  CategoryCardLinkSplash,
} from '@/components/category-card-link'
import { CanvasSequence } from '@/registry/components/image-sequence'
import { useRegistryMeta } from '@/components/registry-meta'
import { useCycleIndex } from '@/hooks/use-cycle-index'
import CubeIcon from './icons/3d-cube'
import TerminalWithCursorIcon from './icons/terminal-w-cursor'
import FileIcon from './icons/file'
import { useMediaQuery } from 'fumadocs-core/utils/use-media-query'
import Image from 'next/image'

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
] as const

export function CategoryQuickLinks() {
  const { counts } = useRegistryMeta()
  const [isHovering, setIsHovering] = useState(false)
  const [activeIndex, setActiveIndex] = useCycleIndex({
    count: sequences.length,
    delayMs: 2000,
    paused: isHovering,
  })
  const isMd = useMediaQuery('(min-width: 768px)')

  const handleEnter = (i: number) => {
    setIsHovering(true)
    setActiveIndex(i)
  }
  const handleLeave = () => setIsHovering(false)

  return (
    <div className="not-prose @container">
      <div className="grid grid-cols-1 gap-2 @md:gap-4 @xl:grid-cols-2 @3xl:grid-cols-3">
        <CategoryCardLink
          href="/components"
          onMouseEnter={() => handleEnter(0)}
          onMouseLeave={handleLeave}
          onFocus={() => handleEnter(0)}
          onBlur={handleLeave}
          className="overflow-visible"
        >
          <CategoryCardLinkHeader
            label="Components"
            icon={<CubeIcon />}
            count={counts.components}
          />
          <CategoryCardLinkSplash className="relative overflow-visible">
            <CanvasSequence
              frameCount={sequences[1].frameCount}
              frameDuration={33}
              getImagePath={sequences[1].getImagePath}
              objectFit="contain"
              isPlaying={activeIndex === 0}
              resetOnPlay
              /* Only start loading the sequence on md */
              preload={isMd ?? false}
              className="pointer-events-none translate-y-[-3%] scale-[1.3] max-md:hidden"
            />
            <Image
              className="object-contain md:hidden"
              src={sequences[1].getImagePath(18)}
              alt={sequences[1].name}
              sizes="100vw"
              fill
            />
          </CategoryCardLinkSplash>
        </CategoryCardLink>

        <CategoryCardLink
          href="/toolbox"
          onMouseEnter={() => handleEnter(1)}
          onMouseLeave={handleLeave}
          onFocus={() => handleEnter(1)}
          onBlur={handleLeave}
          className="overflow-visible"
        >
          <CategoryCardLinkHeader
            label="Toolbox"
            icon={<TerminalWithCursorIcon />}
            count={counts.toolbox}
          />
          <CategoryCardLinkSplash className="relative overflow-visible">
            <CanvasSequence
              frameCount={sequences[2].frameCount}
              frameDuration={33}
              getImagePath={sequences[2].getImagePath}
              objectFit="contain"
              isPlaying={activeIndex === 1}
              resetOnPlay
              /* Only start loading the sequence on md */
              preload={isMd ?? false}
              className="pointer-events-none scale-[1.3] max-md:hidden"
            />
            <Image
              className="object-contain md:hidden"
              src={sequences[2].getImagePath(18)}
              alt={sequences[2].name}
              sizes="100vw"
              fill
            />
          </CategoryCardLinkSplash>
        </CategoryCardLink>

        <CategoryCardLink
          href="/logs"
          onMouseEnter={() => handleEnter(2)}
          onMouseLeave={handleLeave}
          onFocus={() => handleEnter(2)}
          onBlur={handleLeave}
          className="overflow-visible"
        >
          <CategoryCardLinkHeader
            label="Logs"
            icon={<FileIcon />}
            count={counts.logs}
          />
          <CategoryCardLinkSplash className="relative overflow-visible">
            <CanvasSequence
              frameCount={sequences[0].frameCount}
              frameDuration={33}
              getImagePath={sequences[0].getImagePath}
              objectFit="contain"
              isPlaying={activeIndex === 2}
              resetOnPlay
              /* Only start loading the sequence on md */
              preload={isMd ?? false}
              className="pointer-events-none translate-y-[-5%] scale-[1.3] max-md:hidden"
            />
            <Image
              className="object-contain md:hidden"
              src={sequences[0].getImagePath(18)}
              alt={sequences[0].name}
              sizes="100vw"
              fill
            />
          </CategoryCardLinkSplash>
        </CategoryCardLink>
      </div>
    </div>
  )
}
