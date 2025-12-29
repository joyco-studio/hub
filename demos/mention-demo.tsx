'use client'

import * as React from 'react'
import {
  Mention,
  MentionInput,
  MentionContent,
  MentionItem,
  MentionLabel,
} from '@/components/ui/mention'

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
export function MentionDemo() {
  const [value, setValue] = React.useState<string[]>([])

  return (
    <Mention className="not-prose mx-auto w-full max-w-[400px] px-4 py-6">
      <MentionLabel>Mention someone</MentionLabel>
      <Mention trigger="@" value={value} onValueChange={setValue}>
        <MentionInput placeholder="Type @ to mention someone..." asChild>
          <textarea className="mt-2 min-h-[60px]" />
        </MentionInput>
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
    </Mention>
  )
} 

export default MentionDemo
