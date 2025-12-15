'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import * as ScrollArea from '@/registry/joyco/blocks/scroll-area'
import {
  Bell,
  Calendar,
  ChevronDown,
  CreditCard,
  ChevronUp,
  Mail,
  Plus,
  MessageSquare,
  UserPlus,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const notifications = [
  {
    icon: MessageSquare,
    title: 'New comment',
    description: 'Sarah left a comment on your post',
  },
  {
    icon: UserPlus,
    title: 'New follower',
    description: 'Alex started following you',
  },
  {
    icon: CreditCard,
    title: 'Payment received',
    description: 'You received $250.00 from Client Co.',
  },
  {
    icon: Bell,
    title: 'Reminder',
    description: 'Team standup meeting in 30 minutes',
  },
  {
    icon: Mail,
    title: 'New message',
    description: 'Jordan sent you a direct message',
  },
  {
    icon: Calendar,
    title: 'Event tomorrow',
    description: 'Product launch scheduled for 9:00 AM',
  },
]

function ChevronExample() {
  const [items, setItems] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7])
  const nextIdRef = useRef(4)
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevLengthRef = useRef(items.length)

  useEffect(() => {
    // Only scroll when items are added (length increases)
    if (items.length > prevLengthRef.current && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
    prevLengthRef.current = items.length
  }, [items.length])

  const addNotification = () => {
    setItems((prev) => [...prev, nextIdRef.current++])
  }

  const dismissNotification = (id: number) => {
    setItems((prev) => prev.filter((item) => item !== id))
  }

  return (
    <div className="mx-auto w-full max-w-md p-10">
      <ScrollArea.Root
        className="h-[400px] w-full"
        topShadowGradient="bg-linear-to-b from-card to-transparent"
        bottomShadowGradient="bg-linear-to-t from-card to-transparent"
      >
        {/* Scroll indicator arrows */}
        <div
          className={cn(
            'bg-background border-border pointer-events-none absolute top-2 left-1/2 z-30 -translate-x-1/2 rounded-full border p-0.5 transition-opacity duration-300',
            'group-data-[scroll-top=true]/scroll-area:opacity-100',
            'opacity-0'
          )}
        >
          <ChevronUp className="text-muted-foreground h-5 w-5" />
        </div>
        <div
          className={cn(
            'bg-background border-border pointer-events-none absolute bottom-2 left-1/2 z-30 -translate-x-1/2 rounded-full border p-0.5 transition-opacity duration-300',
            'group-data-[scroll-bottom=true]/scroll-area:opacity-100',
            'opacity-0'
          )}
        >
          <ChevronDown className="text-muted-foreground h-5 w-5" />
        </div>
        <ScrollArea.Content ref={scrollRef} className="space-y-2">
          {items.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <div className="bg-muted mb-3 rounded-full p-3">
                <Bell className="text-muted-foreground h-6 w-6" />
              </div>
              <p className="text-muted-foreground text-sm">No notifications</p>
            </div>
          ) : (
            items.map((id, index) => {
              const notification = notifications[id % notifications.length]
              const Icon = notification.icon
              return (
                <div
                  key={`${id}-${index}`}
                  className="bg-background rounded-lg border p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('bg-muted rounded-sm p-2')}>
                      <Icon className={cn('text-muted-foreground h-5 w-5')} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {notification.description}
                      </p>
                    </div>
                    <button
                      onClick={() => dismissNotification(id)}
                      className="text-muted-foreground hover:text-foreground -mt-1 -mr-1 rounded p-1 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </ScrollArea.Content>
      </ScrollArea.Root>
      <div className="mt-4 w-full">
        <Button className="w-full" onClick={addNotification}>
          <Plus className="h-4 w-4" />
          Trigger Notification
        </Button>
      </div>
    </div>
  )
}

export default ChevronExample
