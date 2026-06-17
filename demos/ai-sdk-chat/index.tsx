'use client'

import * as React from 'react'
import { ArrowUpIcon, Square } from 'lucide-react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Streamdown } from 'streamdown'
import {
  Chat,
  ChatInputArea,
  ChatInputField,
  ChatInputSubmit,
  ChatViewport,
  ChatMessages,
  ChatMessageRow,
  ChatMessageBubble,
  ChatMessageAvatar,
} from '@/registry/components/chat'
import type { RegistryChatUIMessage } from './types'
import { SearchTool } from './search-tool'
import { ThinkingRow } from './thinking-row'

const AGENT_AVATAR = '/static/c/scrap.webp'

export function AiSdkChatDemo() {
  const [input, setInput] = React.useState('')
  const { messages, sendMessage, status, stop, error } =
    useChat<RegistryChatUIMessage>({
      transport: new DefaultChatTransport({ api: '/api/chat' }),
    })

  const isStreaming = status === 'submitted' || status === 'streaming'

  const lastMessage = messages[messages.length - 1]
  const assistantStarted =
    lastMessage?.role === 'assistant' &&
    lastMessage.parts.some(
      (part) =>
        (part.type === 'text' && part.text.trim() !== '') ||
        part.type === 'tool-searchComponents'
    )
  const showThinking = isStreaming && !assistantStarted

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
            <ChatMessageRow variant="peer">
              <ChatMessageAvatar
                src={AGENT_AVATAR}
                alt="JOYCO assistant"
                fallback="J"
              />
              <ChatMessageBubble>
                Hi! I&apos;m the registry assistant. Tell me what you&apos;re
                building and I&apos;ll find components for you.
              </ChatMessageBubble>
            </ChatMessageRow>
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
                        {message.role !== 'user' && (
                          <ChatMessageAvatar
                            src={AGENT_AVATAR}
                            alt="JOYCO assistant"
                            fallback="J"
                          />
                        )}
                        <ChatMessageBubble>
                          {message.role === 'user' ? (
                            part.text
                          ) : (
                            <Streamdown>{part.text}</Streamdown>
                          )}
                        </ChatMessageBubble>
                      </ChatMessageRow>
                    ) : null
                  }

                  if (part.type === 'tool-searchComponents') {
                    return (
                      <SearchTool
                        key={key}
                        part={part}
                        avatarSrc={AGENT_AVATAR}
                      />
                    )
                  }

                  return null
                })}
              </React.Fragment>
            ))}
            {showThinking && <ThinkingRow avatarSrc={AGENT_AVATAR} />}
            {status === 'error' && error && (
              <div aria-live="polite" className="px-3 py-2">
                <p className="text-destructive text-sm">
                  Something went wrong. Try sending that again.
                </p>
              </div>
            )}
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
