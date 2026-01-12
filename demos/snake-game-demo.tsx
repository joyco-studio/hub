'use client'

import { SnakeGame } from '@/registry/joyco/blocks/snake-game'

function SnakeGameDemo() {
  return (
    <div className="flex w-full items-center justify-center p-4">
      <SnakeGame className="w-full max-w-xs" />
    </div>
  )
}

export default SnakeGameDemo

