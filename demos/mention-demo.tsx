'use client'

import * as React from 'react'
import {
  Mention,
  MentionInput,
  MentionContent,
  MentionItem,
  MentionLabel,
} from '@/components/ui/mention'

const users = [
  { id: '1', name: 'Matias Perez', username: 'matiasperz' },
  { id: '2', name: 'Joyco', username: 'joyco' },
  { id: '3', name: 'Joyboy', username: 'joyboy' },
  { id: '4', name: 'Fabroos', username: 'fabroos' },
]

export function MentionDemo() {
  const [value, setValue] = React.useState<string[]>([])

  return (
    <Mention className="not-prose w-full py-6 px-4 mx-auto max-w-[400px]">
      <MentionLabel>Mention someone</MentionLabel>
      <Mention trigger="@" value={value} onValueChange={setValue}>
        <MentionInput placeholder="Type @ to mention someone..." asChild>
          <textarea className="mt-2 min-h-[60px]" />
        </MentionInput>
        <MentionContent>
          {users.map((user) => (
            <MentionItem key={user.id} value={user.username}>
              <div className="flex flex-col">
                <span>{user.name}</span>
                <span className="text-muted-foreground text-xs">
                  @{user.username}
                </span>
              </div>
            </MentionItem>
          ))}
        </MentionContent>
      </Mention>
    </Mention>
  )
}

export default MentionDemo
