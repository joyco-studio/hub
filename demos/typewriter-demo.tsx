'use client'

import { Typewriter } from '@/registry/joyco/blocks/typewriter'

export default function TypewriterDemo() {
  return (
    <div className="flex min-h-[240px] items-center justify-center px-6 py-12">
      <div className="bg-background/50 w-full max-w-xl overflow-hidden rounded-lg border">
        <div className="bg-muted/50 flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-red-500/70" />
            <span className="size-2 rounded-full bg-yellow-500/70" />
            <span className="size-2 rounded-full bg-green-500/70" />
          </div>
          <span className="text-muted-foreground font-mono text-xs">
            joyco-terminal
          </span>
          <span />
        </div>

        <div className="cctv-backdrop bg-[#0b0f14] px-4 py-6">
          <div className="font-mono text-sm leading-6 text-[#a7f3d0]">
            <div className="flex items-baseline gap-3">
              <span className="w-4 shrink-0 text-right text-[#7dd3fc]">$</span>
              <span className="min-w-0 whitespace-pre">
                npx shadcn@latest add{' '}
                <Typewriter
                  className="text-[#a7f3d0]"
                  msPerChar={55}
                  pauseMs={650}
                  deleteMsPerChar={40}
                  gapMs={180}
                  texts={['joyco/mobile-menu', 'joyco/typewriter', 'joyco/chat']}
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

