'use client'

import { Logo } from '@/components/logos'
import * as Magnetic from '@/registry/joyco/blocks/magnetic'

function MagneticDemo() {
  return (
    <div className="flex min-h-40 w-full items-center justify-center gap-10 p-8">
      {/* Strong pull */}
      <Magnetic.Root className="inline-flex">
        <Magnetic.Inner className="bg-primary text-primary-foreground inline-flex size-24 items-center justify-center rounded-full text-sm font-medium select-none">
          <Logo className="size-16" />
        </Magnetic.Inner>
      </Magnetic.Root>
    </div>
  )
}

export default MagneticDemo
