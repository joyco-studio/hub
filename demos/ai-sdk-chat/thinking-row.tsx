'use client'

import {
  ChatMessageRow,
  ChatMessageAvatar,
  ChatMessageBubble,
} from '@/registry/components/chat'

export function ThinkingRow({ avatarSrc }: { avatarSrc: string }) {
  return (
    <ChatMessageRow variant="peer" data-slot="ai-sdk-chat-thinking">
      <ChatMessageAvatar src={avatarSrc} alt="JOYCO assistant" fallback="J" />
      <ChatMessageBubble>
        <style>{
          /* css */ `
            @keyframes ai-chat-think {
              0%, 70%, 100% { opacity: 0.25; transform: translateY(0); }
              35% { opacity: 1; transform: translateY(-3px); }
            }
            [data-slot='ai-sdk-chat-thinking'] [data-dot] {
              animation: ai-chat-think 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
            [data-slot='ai-sdk-chat-thinking'] [data-dot]:nth-child(2) {
              animation-delay: 0.16s;
            }
            [data-slot='ai-sdk-chat-thinking'] [data-dot]:nth-child(3) {
              animation-delay: 0.32s;
            }
            @media (prefers-reduced-motion: reduce) {
              @keyframes ai-chat-think {
                0%, 100% { opacity: 0.4; transform: none; }
                50% { opacity: 1; transform: none; }
              }
            }
          `
        }</style>
        <span
          className="flex items-center gap-1 py-1"
          role="status"
          aria-label="Thinking"
        >
          <span data-dot className="size-1.5 rounded-full bg-current" />
          <span data-dot className="size-1.5 rounded-full bg-current" />
          <span data-dot className="size-1.5 rounded-full bg-current" />
        </span>
      </ChatMessageBubble>
    </ChatMessageRow>
  )
}
