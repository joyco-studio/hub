'use client'

import { BrickBreaker } from '@/registry/components/games/brick-breaker'

function BrickBreakerDemo() {
  return (
    <div className="flex w-full items-center justify-center p-4">
      <BrickBreaker className="w-full max-w-md" />
    </div>
  )
}

export default BrickBreakerDemo

