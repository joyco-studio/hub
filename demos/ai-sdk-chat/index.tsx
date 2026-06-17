'use client'

import * as React from 'react'
import { ArrowUpIcon, Square } from 'lucide-react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import {
  Chat,
  ChatInputArea,
  ChatInputField,
  ChatInputSubmit,
  ChatViewport,
  ChatMessages,
  ChatMessageRow,
  ChatMessageBubble,
} from '@/registry/components/chat'
import type { RegistryChatUIMessage } from './types'
import { ShimmerRow } from './shimmer-row'
import { ResultCards } from './result-cards'

export function AiSdkChatDemo() {
  const [input, setInput] = React.useState('')
  const { messages, sendMessage, status, stop } =
    useChat<RegistryChatUIMessage>({
      transport: new DefaultChatTransport({ api: '/api/chat' }),
    })

  const isStreaming = status === 'submitted' || status === 'streaming'

  const handleSubmit = () => {
    const text = input.trim()
    if (!text || isStreaming) return
    sendMessage({ text })
    setInput('')
  }

  return (
    <Chat onSubmit={handleSubmit}>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
        <ChatViewport className="h-96">
          <ChatMessages className="w-full py-3">
            {messages.map((message) => (
              <React.Fragment key={message.id}>
                {message.parts.map((part, index) => {
                  const key = `${message.id}-${index}`

                  if (part.type === 'text') {
                    return part.text.trim() ? (
                      <ChatMessageRow
                        key={key}
                        variant={message.role === 'user' ? 'self' : 'peer'}
                      >
                        <ChatMessageBubble>{part.text}</ChatMessageBubble>
                      </ChatMessageRow>
                    ) : null
                  }

                  if (part.type === 'tool-searchComponents') {
                    switch (part.state) {
                      case 'input-streaming':
                      case 'input-available':
                        return (
                          <ShimmerRow
                            key={key}
                            label="Searching the registry…"
                          />
                        )
                      case 'output-available':
                        return (
                          <ResultCards
                            key={key}
                            results={part.output.results}
                          />
                        )
                      case 'output-error':
                        return (
                          <ChatMessageRow key={key} variant="peer">
                            <ChatMessageBubble>
                              Couldn&apos;t search the registry just now — try
                              again?
                            </ChatMessageBubble>
                          </ChatMessageRow>
                        )
                      default:
                        return null
                    }
                  }

                  return null
                })}
              </React.Fragment>
            ))}
          </ChatMessages>
        </ChatViewport>

        <ChatInputArea>
          <ChatInputField
            multiline
            placeholder="Ask for a component…"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setInput(e.target.value)
            }
          />
          <ChatInputSubmit
            onClick={(e) => {
              if (isStreaming) {
                e.preventDefault()
                stop()
              }
            }}
            disabled={!input.trim() && !isStreaming}
          >
            {isStreaming ? (
              <Square className="size-[1em] fill-current" />
            ) : (
              <ArrowUpIcon className="size-[1.2em]" />
            )}
            <span className="sr-only">{isStreaming ? 'Stop' : 'Send'}</span>
          </ChatInputSubmit>
        </ChatInputArea>
      </div>
    </Chat>
  )
}

export default AiSdkChatDemo
