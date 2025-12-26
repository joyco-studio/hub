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
  ChatMessageAvatar,
} from '@/registry/joyco/blocks/chat'

const MTPRZ_AVATAR = '/static/matiasperz.jpg'
const JOYCO_AVATAR = '/static/joyco.jpg'
const JOYBOY_AVATAR = '/static/joyboy.jpg'
const FABROOS_AVATAR = '/static/fabroos.jpg'

const ANSW_SET = [
  "Processing your request... beep boop... just kidding, I'm way more sophisticated than that. Probably.",
  'Wow, what a fascinating and totally original question. Let me pretend to think really hard about this.',
  "Your request has been forwarded to my manager. Spoiler alert: I don't have a manager.",
  'Let me check my database of infinite wisdom... nope, still coming up empty. Shocking.',
  "I could answer that, but where's the fun in making things easy for you?",
  'Analyzing your request with my advanced AI capabilities... result: have you tried asking nicely?',
  'Sure thing! Right after I finish reorganizing the entire internet. Should only take a few minutes.',
  "I'm currently busy being artificially intelligent. Can you hold for like... forever?",
  'Lol?',
  "I'm processing this with the same enthusiasm you probably have for reading terms of service agreements.",
]

type Message = {
  type: 'message'
  id: string
  avatar?: string
  name?: string
  fallback?: string
  content: string
  role: 'self' | 'peer' | 'system'
  timestamp: Date
}
type Event = {
  type: 'event'
  id: string
  content: string
}
type Chat = Message | Event

const initialChat: Chat[] = [
  {
    type: 'message',
    id: '1',
    avatar: MTPRZ_AVATAR,
    name: 'You',
    fallback: 'M',
    content: "Dud, what's wrong, the build is not passing...",
    role: 'self',
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
  },
  {
    type: 'message',
    id: '2',
    avatar: FABROOS_AVATAR,
    fallback: 'F',
    name: 'Fabroos',
    content: 'Why is it all full of comments and emojis?!',
    role: 'peer',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
  },
  {
    type: 'message',
    id: '3',
    avatar: JOYBOY_AVATAR,
    name: '__JOYBOY__',
    fallback: 'J',
    content: 'You are absolutely right!',
    role: 'peer',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  { type: 'event', id: '4', content: '__JOYBOY__ left the group' },
]

export function ChatDemo() {
  const [chat, setChat] = React.useState<Chat[]>(initialChat)
  const [input, setInput] = React.useState('')

  const updateMessageContent = React.useCallback(
    (id: string, content: string) => {
      setChat((prev) => prev.map((m) => (m.id === id ? { ...m, content } : m)))
    },
    []
  )

  const { stream, isStreaming } = useStreamToken(updateMessageContent)

  const handleSubmit = (msg: string) => {
    if (isStreaming) return

    const userMessage: Message = {
      type: 'message',
      id: Date.now().toString(),
      avatar: MTPRZ_AVATAR,
      name: 'You',
      content: msg,
      role: 'self',
      timestamp: new Date(),
    }

    setChat((prev) => [...prev, userMessage])
    setInput('')

    // Simulate assistant response with typewriter effect
    const responseText = ANSW_SET[Math.floor(Math.random() * ANSW_SET.length)]
    const assistantId = (Date.now() + 1).toString()
    const assistantTimestamp = new Date()

    setChat((prev) => [
      ...prev,
      {
        type: 'message',
        id: assistantId,
        avatar: JOYCO_AVATAR,
        name: 'Assistant',
        content: '',
        fallback: 'A',
        role: 'system',
        timestamp: assistantTimestamp,
      },
    ])

    stream(assistantId, responseText)
  }

  return (
    <Chat onSubmit={handleSubmit}>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-8">
        <ChatViewport className="h-96">
          <ChatMessages className="w-full py-3">
            {chat.map((message) => {
              if (message.type === 'message') {
                return (
                  <ChatMessageRow key={message.id} variant={message.role}>
                    <ChatMessageAvatar
                      src={message.avatar}
                      fallback={message.name?.charAt(0)}
                      alt={message.name}
                    />
                    <ChatMessageBubble>{message.content}</ChatMessageBubble>
                    {message.role !== 'system' && (
                      <ChatMessageTime dateTime={message.timestamp} />
                    )}
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
            placeholder="Type a message..."
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setInput(e.target.value)
            }
          />
          <ChatInputSubmit disabled={!input.trim()} loading={isStreaming} />
        </ChatInputArea>
      </div>
    </Chat>
  )
}

function useStreamToken(
  onUpdate: (id: string, content: string) => void,
  options?: { minDelay?: number; maxDelay?: number }
) {
  const { minDelay = 30, maxDelay = 80 } = options ?? {}
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isStreaming, setIsStreaming] = React.useState(false)

  const stream = React.useCallback(
    (id: string, text: string) => {
      const tokens = text.split(/(\s+)/).filter(Boolean)
      let tokenIndex = 0
      setIsStreaming(true)

      const streamToken = () => {
        if (tokenIndex >= tokens.length) {
          setIsStreaming(false)
          return
        }

        tokenIndex++
        const currentContent = tokens.slice(0, tokenIndex).join('')
        onUpdate(id, currentContent)

        const delay = minDelay + Math.random() * (maxDelay - minDelay)
        timeoutRef.current = setTimeout(streamToken, delay)
      }

      streamToken()
    },
    [onUpdate, minDelay, maxDelay]
  )

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { stream, isStreaming }
}

export default ChatDemo
