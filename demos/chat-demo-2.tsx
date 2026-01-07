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
  type ChatSubmitEvent,
} from '@/registry/joyco/blocks/chat'

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
    content: 'There are no avatars in this chat.',
    role: 'self',
    timestamp: new Date('2025-12-26T02:00:00.000Z'),
  },
  {
    type: 'message',
    id: '2',
    content: 'So nobody knows who I am?',
    role: 'peer',
    timestamp: new Date('2025-12-26T02:01:00.000Z'),
  },
  {
    type: 'message',
    id: '3',
    content: 'I do.',
    role: 'self',
    timestamp: new Date('2025-12-26T02:03:00.000Z'),
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
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6 [--primary-foreground:var(--color-black)] [--primary:var(--color-mint-green)] [--ring:var(--color-mint-green)]">
        <ChatViewport className="h-96">
          <ChatMessages className="w-full py-3">
            {chat.map((message) => (
              <ChatMessageRow key={message.id} variant={message.role}>
                <ChatMessageBubble>{message.content}</ChatMessageBubble>
                <ChatMessageTime dateTime={message.timestamp} />
              </ChatMessageRow>
            ))}
          </ChatMessages>
        </ChatViewport>

        <ChatInputArea>
          <ChatInputField
            multiline={false}
            placeholder="Type... or not"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInput(e.target.value)
            }
          />
          <ChatInputSubmit disabled={!input.trim()} />
        </ChatInputArea>
      </div>
    </Chat>
  )
}

export default ChatDemo
