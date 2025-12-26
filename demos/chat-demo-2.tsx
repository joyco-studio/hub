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
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
  },
  {
    type: 'message',
    id: '2',
    content: 'So no one knows am I?',
    role: 'peer',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
  },
  {
    type: 'message',
    id: '3',
    content: 'I do.',
    role: 'self',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
]

export function ChatDemo() {
  const [chat, setChat] = React.useState<Message[]>(initialChat)
  const [input, setInput] = React.useState('')

  const handleSubmit = (msg: string) => {
    const userMessage: Message = {
      type: 'message',
      id: Date.now().toString(),
      content: msg,
      role: 'self',
      timestamp: new Date(),
    }

    setChat((prev) => [...prev, userMessage])
    setInput('')
  }

  return (
    <Chat onSubmit={handleSubmit}>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
        <ChatViewport className="h-96">
          <ChatMessages className="w-full py-3">
            {chat.map((message) => {
              if (message.type === 'message') {
                return (
                  <ChatMessageRow key={message.id} variant={message.role}>
                    <ChatMessageBubble>{message.content}</ChatMessageBubble>
                    <ChatMessageTime dateTime={message.timestamp} />
                  </ChatMessageRow>
                )
              }

              return (
                <div
                  className="text-muted-foreground my-6 text-center text-sm"
                  key={message.id}
                >
                  {message.content}
                </div>
              )
            })}
          </ChatMessages>
        </ChatViewport>

        <ChatInputArea>
          <ChatInputField
            multiline
            placeholder="Type... or not"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
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
