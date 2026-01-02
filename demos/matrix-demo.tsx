'use client'

import { Matrix, wave } from '@/components/ui/matrix'

export function MatrixDemo() {
  return (
    <div className="flex items-center justify-center p-10">
      <Matrix
        rows={7}
        cols={7}
        frames={wave}
        fps={24}
        loop
        autoplay
        size={12}
        gap={3}
        palette={{
          on: '#ffffff',
          off: 'var(--muted-foreground)',
        }}
      />
    </div>
  )
}

export default MatrixDemo
