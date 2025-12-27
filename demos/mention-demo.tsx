'use client'

import * as React from 'react'
import {
  Mention,
  MentionInput,
  MentionList,
  MentionItem,
  MentionItemIndicator,
  MentionItemText,
} from '@/components/ui/mention'

const USERS = [
  { id: '1', name: 'Matias Perez', username: 'matiasperz', avatar: '/static/matiasperz.jpg' },
  { id: '2', name: 'Joyco', username: 'joyco', avatar: '/static/joyco.jpg' },
  { id: '3', name: 'Joyboy', username: 'joyboy', avatar: '/static/joyboy.jpg' },
  { id: '4', name: 'Fabroos', username: 'fabroos', avatar: '/static/fabroos.jpg' },
]

export function MentionDemo() {
  const [value, setValue] = React.useState('')

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 p-10">
      <div className="space-y-2">
        <label htmlFor="mention-input" className="text-sm font-medium">
          Mention someone
        </label>
        <Mention
          value={value}
          onValueChange={setValue}
          trigger="@"
        >
          <MentionInput
            id="mention-input"
            placeholder="Type @ to mention someone..."
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <MentionList className="bg-popover text-popover-foreground z-50 max-h-60 w-64 overflow-auto rounded-md border p-1 shadow-md">
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
                  <MentionItemText className="font-medium">{user.name}</MentionItemText>
                  <span className="text-muted-foreground text-xs">@{user.username}</span>
                </div>
                <MentionItemIndicator className="ml-auto" />
              </MentionItem>
            ))}
          </MentionList>
        </Mention>
      </div>
      {value && (
        <p className="text-muted-foreground text-sm">
          Value: <code className="bg-muted rounded px-1 py-0.5">{value}</code>
        </p>
      )}
    </div>
  )
}

export default MentionDemo
