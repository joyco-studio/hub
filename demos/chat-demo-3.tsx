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
  ChatSubmitEvent,
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
    content: 'Buy $JOYCO',
    role: 'peer',
    timestamp: new Date('2025-12-26T03:00:00.000Z'),
  },
  {
    type: 'message',
    id: '2',
    content: 'Wym?',
    role: 'self',
    timestamp: new Date('2025-12-26T03:01:00.000Z'),
  },
  {
    type: 'message',
    id: '3',
    content: 'Thank me later',
    role: 'peer',
    timestamp: new Date('2025-12-26T03:03:00.000Z'),
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
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6 [--primary-foreground:var(--color-white)] [--primary:var(--color-joyco-blue)] [--ring:var(--color-joyco-blue)]">
        <div className="bg-card border-border relative rounded-xl border">
          <MonkyChatLogo className="absolute top-1/2 left-1/2 size-32 -translate-x-1/2 -translate-y-[70%] opacity-5" />

          <ChatViewport className="relative h-96 rounded-none border-none bg-transparent">
            <ChatMessages className="w-full py-3">
              {chat.map((message) => (
                <ChatMessageRow key={message.id} variant={message.role}>
                  <ChatMessageBubble className="rounded-lg group-data-[variant=peer]/message-row:rounded-bl-none group-data-[variant=self]/message-row:rounded-br-none">
                    {message.content}
                  </ChatMessageBubble>
                  <ChatMessageTime dateTime={message.timestamp} />
                </ChatMessageRow>
              ))}
            </ChatMessages>

            <div className="from-card sticky bottom-0 z-10 mt-auto bg-linear-to-t to-transparent pb-4">
              <ChatInputArea className="bg-card dark:bg-card rounded-lg">
                <ChatInputField
                  multiline
                  placeholder="M.O.N.K.Y CHAT..."
                  value={input}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setInput(e.target.value)
                  }
                />
                <ChatInputSubmit
                  className="*:[button]:rounded-sm"
                  disabled={!input.trim()}
                />
              </ChatInputArea>
            </div>
          </ChatViewport>
        </div>
      </div>
    </Chat>
  )
}

function MonkyChatLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <path
        fill="currentColor"
        d="M10 6.559 6.166 8.16l-.22 3.536 1.76 1.587.346 1.729L10 15.42l1.949-.408.345-1.729 1.76-1.587-.22-3.536L10 6.56Zm0-4.039 1.556 1.791 2.326-.691-.833 1.996 2.703 1.131A3.055 3.055 0 0 1 18.8 9.811c0 1.666-1.32 3.018-2.954 3.065l-1.681 1.461-.503 2.42L10 17.48l-3.661-.723-.503-2.42-1.682-1.461C2.52 12.829 1.2 11.477 1.2 9.81A3.055 3.055 0 0 1 4.25 6.747l2.703-1.131-.833-1.996 2.325.691L10 2.52Zm-.597 7.04c0 .754-.566 1.383-1.336 1.383-.785 0-1.367-.629-1.367-1.383h2.703Zm-.597 2.451h2.389L10 13.913 8.806 12.01ZM13.3 9.56c0 .754-.581 1.383-1.367 1.383-.77 0-1.336-.629-1.336-1.383H13.3Zm-10.198.251c0 .519.361.959.832 1.085l.173-2.2A1.111 1.111 0 0 0 3.102 9.81Zm12.964 1.085c.471-.126.833-.566.833-1.085 0-.581-.44-1.052-1.006-1.115l.173 2.2Z"
      ></path>
    </svg>
  )
}

export default ChatDemo
