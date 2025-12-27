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
import {
  Mention,
  MentionInput,
  MentionList,
  MentionItem,
  MentionItemText,
  MentionHighlight,
} from '@/components/ui/mention'
import { ArrowUpIcon } from 'lucide-react'

const MTPRZ_AVATAR = '/static/matiasperz.jpg'
const JOYCO_AVATAR = '/static/joyco.jpg'
const JOYBOY_AVATAR = '/static/joyboy.jpg'
const FABROOS_AVATAR = '/static/fabroos.jpg'

const USERS = [
  { id: '1', name: 'Matias Perez', username: 'matiasperz', avatar: MTPRZ_AVATAR },
  { id: '2', name: 'Joyco', username: 'joyco', avatar: JOYCO_AVATAR },
  { id: '3', name: 'Joyboy', username: 'joyboy', avatar: JOYBOY_AVATAR },
  { id: '4', name: 'Fabroos', username: 'fabroos', avatar: FABROOS_AVATAR },
]

type Message = {
  id: string
  avatar: string
  name: string
  content: string
  role: 'self' | 'peer'
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: '1',
    avatar: FABROOS_AVATAR,
    name: 'Fabroos',
    content: 'Hey team! Who should I assign this task to?',
    role: 'peer',
    timestamp: new Date('2025-12-26T10:00:00.000Z'),
  },
  {
    id: '2',
    avatar: JOYBOY_AVATAR,
    name: 'Joyboy',
    content: '@matiasperz would be perfect for this!',
    role: 'peer',
    timestamp: new Date('2025-12-26T10:01:00.000Z'),
  },
]

export function ChatWithMentionDemo() {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [input, setInput] = React.useState('')

  const handleSubmit = (msg: string) => {
    if (!msg.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      avatar: MTPRZ_AVATAR,
      name: 'You',
      content: msg,
      role: 'self',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
  }

  return (
    <Chat onSubmit={handleSubmit}>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
        <ChatViewport className="h-80">
          <ChatMessages className="w-full py-3">
            {messages.map((message) => (
              <ChatMessageRow key={message.id} variant={message.role}>
                <ChatMessageAvatar
                  src={message.avatar}
                  fallback={message.name.charAt(0)}
                  alt={message.name}
                />
                <ChatMessageBubble>
                  <MentionHighlight
                    mentionClassName="bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded px-0.5 font-medium"
                  >
                    {message.content}
                  </MentionHighlight>
                </ChatMessageBubble>
                <ChatMessageTime dateTime={message.timestamp} />
              </ChatMessageRow>
            ))}
          </ChatMessages>
        </ChatViewport>

        <div className="relative">
          <Mention
            value={input}
            onValueChange={setInput}
            trigger="@"
          >
            <ChatInputArea>
              <div className="relative flex-1">
                {/* Highlight overlay */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 flex items-center overflow-hidden px-3 py-2 text-sm"
                >
                  <MentionHighlight
                    mentionClassName="bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded px-0.5 font-medium"
                  >
                    {input}
                  </MentionHighlight>
                </div>
                {/* Actual input with asChild to use ChatInputField */}
                <MentionInput asChild>
                  <ChatInputField
                    multiline
                    placeholder="Type @ to mention someone..."
                    value={input}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setInput(e.target.value)
                    }
                    className="text-transparent caret-foreground"
                  />
                </MentionInput>
              </div>
              <ChatInputSubmit disabled={!input.trim()}>
                <ArrowUpIcon className="size-[1.2em]" />
                <span className="sr-only">Send</span>
              </ChatInputSubmit>
            </ChatInputArea>
            <MentionList className="bg-popover text-popover-foreground absolute bottom-full left-0 z-50 mb-2 max-h-48 w-64 overflow-auto rounded-md border p-1 shadow-md">
              {USERS.map((user) => (
                <MentionItem
                  key={user.id}
                  value={user.username}
                  className="hover:bg-accent hover:text-accent-foreground relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-6 w-6 rounded-full"
                  />
                  <div className="flex flex-col">
                    <MentionItemText className="font-medium">
                      {user.name}
                    </MentionItemText>
                    <span className="text-muted-foreground text-xs">
                      @{user.username}
                    </span>
                  </div>
                </MentionItem>
              ))}
            </MentionList>
          </Mention>
        </div>
      </div>
    </Chat>
  )
}

export default ChatWithMentionDemo
