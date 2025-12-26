'use client'

import { useState, FormEvent } from 'react'
import {
  ChatInputArea,
  ChatInputField,
  ChatInputSubmit,
  ChatViewport,
  ChatMessages,
  ChatMessageRow,
  ChatMessageBubble,
  ChatMessageTime,
  Chat,
} from '@/registry/joyco/blocks/chat'

interface Message {
  id: string
  content: string
  role: 'self' | 'peer' | 'system'
  timestamp: Date
}

export function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'self',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'This is a simulated response from the assistant.',
        role: 'peer',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    }, 500)
  }

  return (
    <Chat onSubmit={handleSubmit}>
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 p-8">
        <ChatViewport className="h-96">
          {messages.length === 0 ? (
            <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
              Start a conversation...
            </div>
          ) : (
            <ChatMessages className="w-full">
              {messages.map((message) => (
                <ChatMessageRow key={message.id} variant={message.role}>
                  <ChatMessageBubble variant={message.role}>
                    {message.content}
                  </ChatMessageBubble>
                  <ChatMessageTime dateTime={message.timestamp.toISOString()}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </ChatMessageTime>
                </ChatMessageRow>
              ))}
            </ChatMessages>
          )}
        </ChatViewport>

        <ChatInputArea>
          <ChatInputField
            multiline
            placeholder="Type a message..."
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
