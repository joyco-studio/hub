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
  const [minElapsed, setMinElapsed] = React.useState(false)

  React.useEffect(() => {
    const id = setTimeout(() => setMinElapsed(true), MIN_SHIMMER_MS)
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

  const query = part.input?.query
  return (
    <ShimmerRow
      label={query ? `Searching for “${query}”` : 'Searching the registry…'}
    />
  )
}
