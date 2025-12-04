'use client'

import * as ScrollArea from '@/registry/joyco/blocks/scroll-area'
import { useState, useRef, useEffect } from 'react'
import { Button } from '../components/ui/button'
import {
  Plus,
  X,
  MessageSquare,
  UserPlus,
  CreditCard,
  Bell,
  Mail,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

function ScrollAreaDemo() {
  const [items, setItems] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7])
  const nextIdRef = useRef(4)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [items.length])

  const addNotification = () => {
    setItems((prev) => [...prev, nextIdRef.current++])
  }

  const dismissNotification = (id: number) => {
    setItems((prev) => prev.filter((item) => item !== id))
  }

  return (
    <div className="w-full px-4 mx-auto max-w-md">
      <ScrollArea.Root
        className="h-[400px] w-full"
        topShadowGradient="bg-linear-to-b from-card to-transparent"
        bottomShadowGradient="bg-linear-to-t from-card to-transparent"
      >
        <ScrollArea.Content ref={scrollRef} className="space-y-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">No notifications</p>
            </div>
          ) : (
            items.map((id, index) => {
              const notification = notifications[id % notifications.length]
              const Icon = notification.icon
              return (
                <div key={`${id}-${index}`} className="bg-background rounded-lg border p-3">
                  <div className="flex items-start gap-3">
                    <div className={cn('rounded-sm p-2 bg-muted')}>
                      <Icon className={cn('h-5 w-5 text-muted-foreground')} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {notification.description}
                      </p>
                    </div>
                    <button
                      onClick={() => dismissNotification(id)}
                      className="text-muted-foreground hover:text-foreground -mr-1 -mt-1 rounded p-1 transition-colors"
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

export default ScrollAreaDemo
