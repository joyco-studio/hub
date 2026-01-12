'use client'

import { Typewriter } from '@/registry/joyco/blocks/typewriter'

export default function TypewriterDemo() {
  return (
    <div className="flex min-h-screen flex-col gap-8 bg-neutral-950 p-8 text-white">
      <h1 className="text-3xl font-bold">Typewriter</h1>

      <div className="text-2xl">
        <Typewriter texts={['Hello World', 'This is a test', 'Typewriter']} />
      </div>

      <div className="text-4xl">
        <Typewriter texts={['Big text', 'Large']} />
      </div>

      <div className="text-xl">
        <Typewriter texts={['Fast typing']} msPerChar={20} />
      </div>

      <div className="text-xl">
        <Typewriter texts={['No cursor']} caret={false} />
      </div>

      <div className="text-2xl">
        <Typewriter texts={['Emoji 👋', '日本語']} />
      </div>
    </div>
  )
}
