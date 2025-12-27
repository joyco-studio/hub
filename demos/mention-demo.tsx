'use client'

import * as React from 'react'
import {
  Mention,
  MentionInput,
  MentionList,
  MentionItem,
  MentionItemText,
  MentionHighlight,
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
          <div className="relative">
            {/* Highlight overlay - matches input styling exactly */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex h-9 w-full items-center overflow-hidden px-3 py-1 text-base md:text-sm"
            >
              <MentionHighlight
                mentionClassName="bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded px-0.5 font-medium"
              >
                {value}
              </MentionHighlight>
            </div>
            {/* Actual input - text is transparent, only caret shows */}
            <MentionInput
              id="mention-input"
              placeholder="Type @ to mention someone..."
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-base text-transparent caret-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>
          <MentionList className="bg-popover text-popover-foreground absolute z-50 mt-1 max-h-60 w-64 overflow-auto rounded-md border p-1 shadow-md">
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
              </MentionItem>
            ))}
          </MentionList>
        </Mention>
      </div>
    </div>
  )
}

export default MentionDemo
