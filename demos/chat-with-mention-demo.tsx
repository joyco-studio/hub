'use client'

import * as React from 'react'
import {
  Chat,
  ChatInputArea,
  ChatInputSubmit,
  ChatViewport,
  ChatMessages,
  ChatMessageRow,
  ChatMessageBubble,
  ChatMessageTime,
  ChatMessageAvatar,
  ChatInputField,
  type ChatSubmitEvent,
} from '@/registry/joyco/blocks/chat'
import { Mention, MentionContent, MentionItem } from '@/components/ui/mention'
import * as MentionPrimitive from '@diceui/mention'
import { ArrowUpIcon } from 'lucide-react'

const MTPRZ_AVATAR = '/static/matiasperz.jpg'
const JOYCO_AVATAR = '/static/joyco.jpg'
const JOYBOY_AVATAR = '/static/joyboy.jpg'
const FABROOS_AVATAR = '/static/fabroos.jpg'

const users = [
  {
    id: '1',
    name: 'Matias Perez',
    username: 'matiasperz',
    avatar: MTPRZ_AVATAR,
  },
  { id: '2', name: 'Joyco', username: 'joyco', avatar: JOYCO_AVATAR },
  { id: '3', name: 'Joyboy', username: 'joyboy', avatar: JOYBOY_AVATAR },
  { id: '4', name: 'Fabroos', username: 'fabroos', avatar: FABROOS_AVATAR },
]

type Message = {
  id: string
  avatar?: string
  name?: string
  fallback?: string
  content: string
  role: 'self' | 'peer'
  timestamp: Date
}

const initialChat: Message[] = [
  {
    id: '1',
    avatar: FABROOS_AVATAR,
    name: 'Fabroos',
    fallback: 'F',
    content: 'Hey @matiasperz, did you see the new component?',
    role: 'peer',
    timestamp: new Date('2025-12-26T01:00:00.000Z'),
  },
  {
    id: '2',
    avatar: MTPRZ_AVATAR,
    name: 'You',
    fallback: 'M',
    content: 'Yes! @joyboy and @joyco helped with the design',
    role: 'self',
    timestamp: new Date('2025-12-26T01:01:00.000Z'),
  },
  {
    id: '3',
    avatar: JOYBOY_AVATAR,
    name: 'Joyboy',
    fallback: 'J',
    content: "It's looking great! 🎉",
    role: 'peer',
    timestamp: new Date('2025-12-26T01:02:00.000Z'),
  },
]

function MentionHighlight({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  const parts = children.split(/(@\w+)/g)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('@')) {
          return (
            <span
              key={index}
              className="rounded bg-blue-200 px-0.5 py-px text-blue-950 dark:bg-blue-800 dark:text-blue-50"
            >
              {part}
            </span>
          )
        }
        return part
      })}
    </span>
  )
}

export function ChatWithMentionDemo() {
  const [chat, setChat] = React.useState<Message[]>(initialChat)
  const [mentions, setMentions] = React.useState<string[]>([])
  const [input, setInput] = React.useState('')

  const handleSubmit = (e: ChatSubmitEvent) => {
    e.preventDefault()
    const userMessage: Message = {
      id: Date.now().toString(),
      avatar: MTPRZ_AVATAR,
      name: 'You',
      fallback: 'M',
      content: e.message,
      role: 'self',
      timestamp: new Date(),
    }

    setChat((prev) => [...prev, userMessage])
    setMentions([])
    setInput('')
  }

  return (
    <Chat onSubmit={handleSubmit}>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
        <ChatViewport className="h-96">
          <ChatMessages className="w-full py-3">
            {chat.map((message) => (
              <ChatMessageRow key={message.id} variant={message.role}>
                <ChatMessageAvatar
                  src={message.avatar}
                  fallback={message.fallback}
                  alt={message.name}
                />
                <ChatMessageBubble>
                  <MentionHighlight>{message.content}</MentionHighlight>
                </ChatMessageBubble>
                <ChatMessageTime dateTime={message.timestamp} />
              </ChatMessageRow>
            ))}
          </ChatMessages>
        </ChatViewport>

        <ChatInputArea>
          <Mention
            trigger="@"
            inputValue={input}
            onInputValueChange={setInput}
            value={mentions}
            onValueChange={setMentions}
          >
            <MentionPrimitive.Input asChild>
              <ChatInputField
                placeholder="Type @ to mention someone..."
                multiline
              />
            </MentionPrimitive.Input>
            <MentionContent>
              {users.map((user) => (
                <MentionItem key={user.id} value={user.username}>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="size-6 rounded-full"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-muted-foreground text-xs">
                      @{user.username}
                    </span>
                  </div>
                </MentionItem>
              ))}
            </MentionContent>
          </Mention>
          <ChatInputSubmit disabled={input.length === 0}>
            <ArrowUpIcon className="size-[1.2em]" />
            <span className="sr-only">Send</span>
          </ChatInputSubmit>
        </ChatInputArea>
      </div>
      <style>{
        /* css */ `
        @layer utilities {
          .safe-field-sizing-content {
            height: 0;
          }

          @supports (field-sizing: content) {
            .safe-field-sizing-content {
              field-sizing: content;
              height: auto;
            }
          }
        }
      `
      }</style>
    </Chat>
  )
}

export default ChatWithMentionDemo
