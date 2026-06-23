'use client'

import { Typewriter } from '@/registry/components/typewriter'

export default function TypewriterDemo() {
  return (
    <div className="flex min-h-[120px] items-center justify-center bg-[blue] px-6 py-12">
      <span className="min-w-0 font-mono text-sm leading-6 whitespace-pre text-white">
        we make{' '}
        <Typewriter
          msPerChar={55}
          pauseMs={650}
          deleteMsPerChar={40}
          gapMs={180}
          texts={['landing pages', 'experiences', 'the web .)']}
          className='**:data-[slot="caret"]:[animation:pulse_0.75s_ease-in-out_infinite] **:data-[slot="caret"]:opacity-0'
        />
      </span>
    </div>
  )
}
