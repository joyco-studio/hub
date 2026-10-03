'use client'

import { useMemo, useRef, useState, type KeyboardEvent } from 'react'

import {
  createChromaGradient,
  createLightnessGradient,
  formatOklch,
  getMaximumChroma,
  toSafeCssColor,
} from './color-utils'
import { ColorDemoFrame, DemoSlider } from './demo-primitives'

const WHEEL_SIZE = 240
const RING_WIDTH = 34
const HUE_STEPS = 72

function createHueRing(lightness: number, chroma: number): string {
  const stops = Array.from({ length: HUE_STEPS + 1 }, (_, index) => {
    const progress = index / HUE_STEPS
    const hue = progress * 360
    return `${toSafeCssColor({ l: lightness, c: chroma, h: hue })} ${progress * 360}deg`
  })

  return `conic-gradient(from 0deg, ${stops.join(', ')})`
}

export function HueWheelDemo() {
  const [hue, setHue] = useState(255)
  const [lightness, setLightness] = useState(0.65)
  const [chroma, setChroma] = useState(0.16)
  const [isDragging, setIsDragging] = useState(false)
  const wheelRef = useRef<HTMLDivElement>(null)

  const ring = useMemo(
    () => createHueRing(lightness, chroma),
    [lightness, chroma]
  )
  const selectedColor = toSafeCssColor({ l: lightness, c: chroma, h: hue })
  const maximumChroma = getMaximumChroma(lightness, hue)
  const angle = (hue * Math.PI) / 180
  const handleRadius = WHEEL_SIZE / 2 - RING_WIDTH / 2
  const handleX = WHEEL_SIZE / 2 + handleRadius * Math.sin(angle)
  const handleY = WHEEL_SIZE / 2 - handleRadius * Math.cos(angle)

  function updateHueFromPointer(clientX: number, clientY: number) {
    const bounds = wheelRef.current?.getBoundingClientRect()
    if (!bounds) return

    const deltaX = clientX - (bounds.left + bounds.width / 2)
    const deltaY = clientY - (bounds.top + bounds.height / 2)
    const degrees = (Math.atan2(deltaX, -deltaY) * 180) / Math.PI
    setHue((degrees + 360) % 360)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const delta = event.shiftKey ? 10 : 1

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault()
        setHue((currentHue) => (currentHue + delta) % 360)
        return
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault()
        setHue((currentHue) => (currentHue - delta + 360) % 360)
        return
      case 'Home':
        event.preventDefault()
        setHue(0)
        return
      case 'End':
        event.preventDefault()
        setHue(360)
    }
  }

  return (
    <ColorDemoFrame>
      <div className="grid justify-items-center gap-4 p-6">
        <div
          ref={wheelRef}
          role="slider"
          tabIndex={0}
          aria-label="Hue"
          aria-valuemin={0}
          aria-valuemax={360}
          aria-valuenow={Math.round(hue)}
          aria-valuetext={`${hue.toFixed(1)} degrees`}
          onKeyDown={handleKeyDown}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            setIsDragging(true)
            updateHueFromPointer(event.clientX, event.clientY)
          }}
          onPointerMove={(event) => {
            if (isDragging) {
              updateHueFromPointer(event.clientX, event.clientY)
            }
          }}
          onPointerUp={() => setIsDragging(false)}
          onPointerCancel={() => setIsDragging(false)}
          onLostPointerCapture={() => setIsDragging(false)}
          className="focus-visible:ring-ring relative touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            width: WHEEL_SIZE,
            height: WHEEL_SIZE,
            background: ring,
          }}
        >
          <div
            aria-hidden="true"
            className="bg-card absolute grid place-items-center rounded-full shadow-inner"
            style={{ inset: RING_WIDTH }}
          >
            <span
              className="size-20 rounded-full border border-black/10 motion-safe:transition-[background-color] motion-safe:duration-150 dark:border-white/10"
              style={{ backgroundColor: selectedColor }}
            />
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute h-7 w-3 rounded-[2px] border-2 border-white shadow-md"
            style={{
              insetInlineStart: handleX,
              top: handleY,
              backgroundColor: selectedColor,
              translate: '-50% -50%',
              rotate: `${hue}deg`,
              scale: isDragging ? '1.25' : '1',
            }}
          />
        </div>
        <code className="text-foreground bg-muted px-2 py-1 font-mono text-xs tabular-nums">
          {formatOklch({ l: lightness, c: chroma, h: hue })}
        </code>
      </div>

      <div className="border-border grid gap-5 border-t p-4 min-[42rem]:grid-cols-2 min-[42rem]:p-6">
        <DemoSlider
          id="hue-wheel-lightness"
          label="Lightness"
          value={lightness}
          min={0.2}
          max={0.95}
          step={0.01}
          onValueChange={setLightness}
          valueLabel={lightness.toFixed(2)}
          track={createLightnessGradient(chroma, hue)}
        />
        <DemoSlider
          id="hue-wheel-chroma"
          label="Chroma"
          value={chroma}
          min={0}
          max={0.3}
          step={0.005}
          onValueChange={setChroma}
          valueLabel={`${chroma.toFixed(3)} / ${maximumChroma.toFixed(3)} max`}
          track={createChromaGradient(lightness, hue)}
        />
      </div>
    </ColorDemoFrame>
  )
}
