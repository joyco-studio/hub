'use client'

import * as React from 'react'
import {
  ChatMessageRow,
  ChatMessageBubble,
  ChatMessageAvatar,
} from '@/registry/components/chat'
import type { RegistryChatUIMessage } from './types'
import { ShimmerRow } from './shimmer-row'
import { ResultCards } from './result-cards'

type SearchToolPart = Extract<
  RegistryChatUIMessage['parts'][number],
  { type: 'tool-searchComponents' }
>

const MIN_SHIMMER_MS = 900

export function SearchTool({
  part,
  avatarSrc,
}: {
  part: SearchToolPart
  avatarSrc: string
}) {
  const startRef = React.useRef(Date.now())
  const [minElapsed, setMinElapsed] = React.useState(false)

  React.useEffect(() => {
    const remaining = MIN_SHIMMER_MS - (Date.now() - startRef.current)
    if (remaining <= 0) {
      setMinElapsed(true)
      return
    }
    const id = setTimeout(() => setMinElapsed(true), remaining)
    return () => clearTimeout(id)
  }, [])

  if (part.state === 'output-error') {
    return (
      <ChatMessageRow variant="peer">
        <ChatMessageAvatar src={avatarSrc} alt="JOYCO assistant" fallback="J" />
        <ChatMessageBubble>
          Couldn&apos;t search the registry just now. Try again?
        </ChatMessageBubble>
      </ChatMessageRow>
    )
  }

  if (part.state === 'output-available' && minElapsed) {
    return <ResultCards results={part.output.results} />
  }

  return <ShimmerRow label="Searching the registry…" />
}
