'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import * as ScrollArea from '@/registry/joyco/blocks/scroll-area'
import { ChevronDown, ChevronUp, Heart, Minus, Music, Palette, Plus, Sparkles, Star, Zap } from 'lucide-react'
import { useEffect, useRef, useState } from "react"

const items = [
  {
    icon: Sparkles,
    title: 'Sparkling Magic',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Star,
    title: 'Stellar Design',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Heart,
    title: 'Heartfelt Experience',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
  {
    icon: Music,
    title: 'Harmonious Flow',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
  },
  {
    icon: Palette,
    title: 'Creative Palette',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
]

function ChevronExample() {
  const [itemCount, setItemCount] = useState<number>(6)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [itemCount])

  return (
    <>
      <ScrollArea.Root
        className="relative h-96"
        topShadowGradient="bg-linear-to-b from-card to-transparent"
        bottomShadowGradient="bg-linear-to-t from-card to-transparent"
      >
        {/* Scroll indicator arrows */}
        <div
          className={cn(
            'pointer-events-none absolute top-2 left-1/2 z-30 -translate-x-1/2 transition-opacity duration-300',
            'group-data-[scroll-top=true]/scroll-area:opacity-100',
            'opacity-0',
          )}
        >
          <ChevronUp className="text-muted-foreground h-5 w-5" />
        </div>
        <div
          className={cn(
            'pointer-events-none absolute bottom-2 left-1/2 z-30 -translate-x-1/2 transition-opacity duration-300',
            'group-data-[scroll-bottom=true]/scroll-area:opacity-100',
            'opacity-0',
          )}
        >
          <ChevronDown className="text-muted-foreground h-5 w-5" />
        </div>
        <ScrollArea.Content ref={scrollRef} className="space-y-4 p-6">
        {Array.from({ length: itemCount }, (_, i) => {
            const item = items[i % items.length]
            const Icon = item.icon
            return (
              <div key={i} className="bg-background rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-3">
                  <div className={cn('rounded-lg p-2', item.bg)}>
                    <Icon className={cn('h-5 w-5', item.color)} />
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Scroll down to see the bottom shadow appear, and scroll back
                  up to see the top shadow.
                </p>
              </div>
            )
          })}
        </ScrollArea.Content>
      </ScrollArea.Root>
      <div className="mt-4 flex gap-3">
        <Button onClick={() => setItemCount(itemCount + 1)}>
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
        <Button
          variant="secondary"
          onClick={() => setItemCount(Math.max(1, itemCount - 1))}
          disabled={itemCount <= 1}
        >
          <Minus className="h-4 w-4" />
          Remove Item
        </Button>
      </div>
    </>
  )
}

export default ChevronExample