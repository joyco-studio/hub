'use client'

import { SpaceInvaders } from '@/registry/components/games/space-invaders'

function SpaceInvadersDemo() {
  return (
    <div className="flex w-full items-center justify-center p-4">
      <SpaceInvaders className="w-full max-w-sm" />
    </div>
  )
}

export default SpaceInvadersDemo
