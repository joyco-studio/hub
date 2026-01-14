'use client'

import { useState } from 'react'

import {
  CategoryCardLink,
  CategoryCardLinkHeader,
  CategoryCardLinkSplash,
} from '@/components/category-card-link'
import { CanvasSequence } from '@/registry/joyco/blocks/image-sequence'
import { useRegistryMeta } from '@/components/registry-meta'
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
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const isMd = useMediaQuery('(min-width: 768px)')

  return (
    <div className="not-prose grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
      <CategoryCardLink
        href="/components"
        onMouseEnter={() => setActiveIndex(0)}
        onMouseLeave={() => setActiveIndex(-1)}
        onFocus={() => setActiveIndex(0)}
        onBlur={() => setActiveIndex(-1)}
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
            sizes="50vw"
            fill
          />
        </CategoryCardLinkSplash>
      </CategoryCardLink>

      <CategoryCardLink
        href="/toolbox"
        onMouseEnter={() => setActiveIndex(1)}
        onMouseLeave={() => setActiveIndex(-1)}
        onFocus={() => setActiveIndex(1)}
        onBlur={() => setActiveIndex(-1)}
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
            sizes="50vw"
            fill
          />
        </CategoryCardLinkSplash>
      </CategoryCardLink>

      <CategoryCardLink
        href="/logs"
        onMouseEnter={() => setActiveIndex(2)}
        onMouseLeave={() => setActiveIndex(-1)}
        onFocus={() => setActiveIndex(2)}
        onBlur={() => setActiveIndex(-1)}
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
            sizes="50vw"
            fill
          />
        </CategoryCardLinkSplash>
      </CategoryCardLink>
    </div>
  )
}
