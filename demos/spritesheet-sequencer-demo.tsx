'use client'

import * as React from 'react'
import { Gauge, Pause, Play } from 'lucide-react'
import { SpritesheetSequencer } from '@/registry/joyco/blocks/spritesheet-sequencer'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

const SPRITESHEETS = [
  {
    name: 'Click',
    src: 'https://qfxa88yauvyse9vr.public.blob.vercel-storage.com/spritesheets/click_2x2.png',
    frameCount: 3,
  },
  {
    name: 'Look',
    src: 'https://qfxa88yauvyse9vr.public.blob.vercel-storage.com/spritesheets/look_2x2.png',
    frameCount: 3,
  },
  {
    name: 'Mail',
    src: 'https://qfxa88yauvyse9vr.public.blob.vercel-storage.com/spritesheets/mail_3x3.png',
    frameCount: 8,
  },
  {
    name: 'Pointer',
    src: 'https://qfxa88yauvyse9vr.public.blob.vercel-storage.com/spritesheets/pointer_2x2.png',
    frameCount: 3,
  },
  {
    name: 'Smudge',
    src: 'https://qfxa88yauvyse9vr.public.blob.vercel-storage.com/spritesheets/smudge_2x2.png',
    frameCount: 3,
  },
]

const SPEED_MIN = 50
const SPEED_MAX = 500

export default function SpritesheetSequencerDemo() {
  const [isPlaying, setIsPlaying] = React.useState(true)
  const [speed, setSpeed] = React.useState(480)

  // Invert: higher slider value = faster animation (lower frameDuration)
  const frameDuration = SPEED_MIN + SPEED_MAX - speed

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-6 px-6 py-12">
      {/* Spritesheet grid */}
      <div className="flex flex-wrap items-center justify-center gap-8">
        {SPRITESHEETS.map((sprite) => (
          <div key={sprite.name} className="flex flex-col items-center gap-2">
            <div className="size-16">
              <SpritesheetSequencer
                src={sprite.src}
                frameCount={sprite.frameCount}
                frameDuration={frameDuration}
                isPlaying={isPlaying}
              />
            </div>
            <span className="text-muted-foreground font-mono text-xs">
              {sprite.name}
            </span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="muted"
          size="icon-sm"
          onClick={() => setIsPlaying((p) => !p)}
        >
          {isPlaying ? <Pause /> : <Play />}
        </Button>

        <div className="bg-muted flex items-center gap-3 rounded-md px-3 h-8">
          <Gauge className="text-muted-foreground size-4.5" />
          <Slider
            value={[speed]}
            onValueChange={([value]) => setSpeed(value)}
            min={SPEED_MIN}
            max={SPEED_MAX}
            step={25}
            className="w-32 *:data-[slot='slider-track']:bg-muted-foreground/30"
          />
          <span className="text-muted-foreground min-w-[5ch] font-mono text-xs">
            {frameDuration}ms
          </span>
        </div>
      </div>
    </div>
  )
}
