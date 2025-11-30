'use client'

import * as ScrollArea from '@/registry/joyco/blocks/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import {
  Plus,
  Minus,
  Sparkles,
  Star,
  Zap,
  Heart,
  Music,
  Palette,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

export function ScrollAreaDemo() {
  return <SimpleExample />
}

function SimpleExample() {
  const [itemCount, setItemCount] = useState<number>(4)
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
    <Card className="not-prose">
      <CardHeader>
        <CardTitle>Simple Example</CardTitle>
      </CardHeader>
      <CardContent className="mx-auto max-w-md">
        <ScrollArea.Root
          className="h-96"
          topShadowGradient="fade-card fade-b"
          bottomShadowGradient="fade-card fade-t"
        >
          <ScrollArea.Content ref={scrollRef} className="space-y-4">
            {Array.from({ length: itemCount }, (_, i) => (
              <SimpleItem key={i} item={items[i % items.length]} />
            ))}
          </ScrollArea.Content>
        </ScrollArea.Root>
        <div className="mt-4 flex gap-3">
          <Button
            className="flex-1"
            onClick={() => setItemCount(itemCount + 1)}
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setItemCount(Math.max(1, itemCount - 1))}
            disabled={itemCount <= 1}
          >
            <Minus className="h-4 w-4" />
            Remove Item
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ChevronExample() {
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
    <Card>
      <CardHeader>
        <CardTitle>With Chevron Indicators</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea.Root
          className="relative h-96 p-4"
          topShadowGradient="fade-card fade-b"
          bottomShadowGradient="fade-card fade-t"
        >
          {/* Scroll indicator arrows */}
          <div
            className={cn(
              'pointer-events-none absolute top-2 left-1/2 z-30 -translate-x-1/2',
              'group-data-[scroll-top=true]/scroll-area:animate-in group-data-[scroll-top=true]/scroll-area:fade-in group-data-[scroll-top=true]/scroll-area:opacity-100 group-data-[scroll-top=true]/scroll-area:duration-300',
              'group-data-[scroll-top=false]/scroll-area:animate-out group-data-[scroll-top=false]/scroll-area:fade-out group-data-[scroll-top=false]/scroll-area:opacity-0 group-data-[scroll-top=false]/scroll-area:duration-300',
              'opacity-0'
            )}
          >
            <ChevronUp className="text-muted-foreground h-5 w-5" />
          </div>
          <div
            className={cn(
              'pointer-events-none absolute bottom-2 left-1/2 z-30 -translate-x-1/2',
              'group-data-[scroll-bottom=true]/scroll-area:animate-in group-data-[scroll-bottom=true]/scroll-area:fade-in group-data-[scroll-bottom=true]/scroll-area:opacity-100 group-data-[scroll-bottom=true]/scroll-area:duration-200',
              'group-data-[scroll-bottom=false]/scroll-area:animate-out group-data-[scroll-bottom=false]/scroll-area:fade-out group-data-[scroll-bottom=false]/scroll-area:opacity-0 group-data-[scroll-bottom=false]/scroll-area:duration-200',
              'opacity-0'
            )}
          >
            <ChevronDown className="text-muted-foreground h-5 w-5" />
          </div>
          <ScrollArea.Content ref={scrollRef} className="space-y-4 p-6">
            {Array.from({ length: itemCount }, (_, i) => (
              <SimpleItem key={i} item={items[i % items.length]} />
            ))}
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
      </CardContent>
    </Card>
  )
}

const SimpleItem = ({ item }: { item: (typeof items)[number] }) => {
  const Icon = item.icon
  return (
    <div className="bg-background rounded-lg border p-4">
      <div className="mb-2 flex items-center gap-3">
        <div className={`${item.bg} rounded-lg p-2`}>
          <Icon className={`h-5 w-5 ${item.color}`} />
        </div>
        <h3 className="font-semibold">{item.title}</h3>
      </div>
      <p className="text-muted-foreground text-sm">
        Scroll down to see the bottom shadow appear, and scroll back up to see
        the top shadow.
      </p>
    </div>
  )
}
