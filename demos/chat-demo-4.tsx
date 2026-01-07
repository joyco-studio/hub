'use client'

import * as React from 'react'
import {
  Chat,
  ChatInputArea,
  ChatInputField,
  ChatInputSubmit,
  ChatViewport,
  ChatMessages,
  ChatMessageRow,
  ChatMessageBubble,
  ChatMessageTime,
  ChatMessageAddon,
  type ChatSubmitEvent,
} from '@/registry/joyco/blocks/chat'
import { Button } from '@/components/ui/button'
import { Check, CheckCheck, EllipsisVertical, SmilePlus } from 'lucide-react'

type Message = {
  type: 'message'
  id: string
  content: string
  role: 'self' | 'peer'
  timestamp: Date
}

const initialChat: Message[] = [
  {
    type: 'message',
    id: '1',
    content: 'DUD, I HAVE SOMETHING TO TELL YOU',
    role: 'peer',
    timestamp: new Date('2025-12-26T04:00:00.000Z'),
  },
  {
    type: 'message',
    id: '2',
    content: 'what is it?',
    role: 'self',
    timestamp: new Date('2025-12-26T04:01:00.000Z'),
  },
  {
    type: 'message',
    id: '3',
    content: 'gimme 5',
    role: 'peer',
    timestamp: new Date('2025-12-26T04:03:00.000Z'),
  },
]

export function ChatDemo() {
  const [chat, setChat] = React.useState<Message[]>(initialChat)
  const [input, setInput] = React.useState('')

  const handleSubmit = (e: ChatSubmitEvent) => {
    const userMessage: Message = {
      type: 'message',
      id: Date.now().toString(),
      content: e.message,
      role: 'self',
      timestamp: new Date(),
    }

    setChat((prev) => [...prev, userMessage])
    setInput('')
  }

  return (
    <Chat onSubmit={handleSubmit}>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6 [--primary-foreground:var(--color-black)] [--primary:var(--color-mustard-yellow)] [--radius:0] [--ring:var(--color-mustard-yellow)]">
        <ChatViewport className="h-96">
          <ChatMessages className="w-full py-3">
            {chat.map((message, idx) => (
              <ChatMessageRow key={message.id} variant={message.role}>
                <ChatMessageBubble>{message.content}</ChatMessageBubble>
                <ChatMessageAddon align="inline">
                  <Button variant="secondary" size="icon-sm" title="React">
                    {message.role === 'self' ? (
                      <EllipsisVertical />
                    ) : (
                      <SmilePlus />
                    )}
                  </Button>
                </ChatMessageAddon>
                <ChatMessageAddon align="block">
                  <ChatMessageTime dateTime={message.timestamp} />
                  {message.role === 'self' &&
                    (idx < 3 ? (
                      <CheckCheck className="size-4" />
                    ) : (
                      <Check className="size-4" />
                    ))}
                </ChatMessageAddon>
              </ChatMessageRow>
            ))}
          </ChatMessages>

          <div className="from-card sticky bottom-0 z-10 mt-auto bg-linear-to-t to-transparent pb-4">
            <ChatInputArea className="bg-card rounded-none">
              <ChatInputField
                multiline
                placeholder="Type your secret..."
                value={input}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setInput(e.target.value)
                }
              />
              <ChatInputSubmit
                className="*:[button]:rounded-none"
                disabled={!input.trim()}
              />
            </ChatInputArea>
          </div>
        </ChatViewport>
      </div>
    </Chat>
  )
}

export default ChatDemo
