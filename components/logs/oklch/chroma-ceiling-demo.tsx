'use client'

import { useMemo, useState, type PointerEvent } from 'react'

import {
  createChromaGradient,
  createLightnessGradient,
  formatOklch,
  getMaximumChroma,
  toSafeCssColor,
} from './color-utils'
import { ColorDemoFrame, DemoSlider } from './demo-primitives'

const HUE_STEP = 2
const CHART_WIDTH = 720
const CHART_HEIGHT = 260
const PLOT_LEFT = 52
const PLOT_RIGHT = 704
const PLOT_TOP = 16
const PLOT_BOTTOM = 212
const CHROMA_DOMAIN = 0.33
const HUE_TICKS = [0, 90, 180, 270, 360]
const CHROMA_TICKS = [0, 0.1, 0.2, 0.3]

interface CeilingSample {
  hue: number
  ceiling: number
}

function toX(hue: number): number {
  return PLOT_LEFT + (hue / 360) * (PLOT_RIGHT - PLOT_LEFT)
}

function toY(chroma: number): number {
  return PLOT_BOTTOM - (chroma / CHROMA_DOMAIN) * (PLOT_BOTTOM - PLOT_TOP)
}

function buildSamples(lightness: number): CeilingSample[] {
  return Array.from({ length: 360 / HUE_STEP + 1 }, (_, index) => {
    const hue = index * HUE_STEP
    return { hue, ceiling: getMaximumChroma(lightness, hue) }
  })
}

function buildLinePath(samples: CeilingSample[]): string {
  return samples
    .map(
      ({ hue, ceiling }, index) =>
        `${index === 0 ? 'M' : 'L'} ${toX(hue).toFixed(2)} ${toY(ceiling).toFixed(2)}`
    )
    .join(' ')
}

function buildAreaPath(samples: CeilingSample[]): string {
  return `${buildLinePath(samples)} L ${PLOT_RIGHT} ${PLOT_BOTTOM} L ${PLOT_LEFT} ${PLOT_BOTTOM} Z`
}

// One path per contiguous run of hues whose ceiling sits below the requested
// chroma — the slab between the two curves is what the browser has to clip away.
function buildClippedPaths(samples: CeilingSample[], chroma: number): string[] {
  const paths: string[] = []
  let run: CeilingSample[] = []

  function flush() {
    if (run.length < 2) {
      run = []
      return
    }

    const top = run
      .map(
        ({ hue, ceiling }, index) =>
          `${index === 0 ? 'M' : 'L'} ${toX(hue).toFixed(2)} ${toY(ceiling).toFixed(2)}`
      )
      .join(' ')
    const back = [...run]
      .reverse()
      .map(({ hue }) => `L ${toX(hue).toFixed(2)} ${toY(chroma).toFixed(2)}`)
      .join(' ')

    paths.push(`${top} ${back} Z`)
    run = []
  }

  for (const sample of samples) {
    if (sample.ceiling < chroma) {
      run.push(sample)
      continue
    }
    flush()
  }
  flush()

  return paths
}

function buildHueGradientStops(
  lightness: number,
  samples: CeilingSample[]
): { offset: string; color: string }[] {
  return samples
    .filter((_, index) => index % 5 === 0)
    .map(({ hue, ceiling }) => ({
      offset: `${(hue / 360) * 100}%`,
      color: toSafeCssColor({ l: lightness, c: ceiling, h: hue }),
    }))
}

export function ChromaCeilingDemo() {
  const [lightness, setLightness] = useState(0.65)
  const [chroma, setChroma] = useState(0.16)
  const [hoveredHue, setHoveredHue] = useState<number | null>(null)

  const samples = useMemo(() => buildSamples(lightness), [lightness])
  const clippedCount = samples.filter(
    (sample) => sample.ceiling < chroma
  ).length
  const clippedShare = Math.round((clippedCount / samples.length) * 100)
  const widest = samples.reduce((best, sample) =>
    sample.ceiling > best.ceiling ? sample : best
  )
  const narrowest = samples.reduce((worst, sample) =>
    sample.ceiling < worst.ceiling ? sample : worst
  )
  const hovered =
    hoveredHue === null
      ? null
      : (samples[Math.round(hoveredHue / HUE_STEP)] ?? null)

  function updateHoveredHue(event: PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - bounds.left) / bounds.width
    const hue =
      ((ratio * CHART_WIDTH - PLOT_LEFT) / (PLOT_RIGHT - PLOT_LEFT)) * 360

    if (hue < 0 || hue > 360) {
      setHoveredHue(null)
      return
    }

    setHoveredHue(hue)
  }

  return (
    <ColorDemoFrame>
      <div className="relative p-4 min-[42rem]:p-6">
        <p className="text-muted-foreground mb-3 text-sm">
          Maximum sRGB chroma at every hue, lightness held still
        </p>
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          role="img"
          aria-label={`Maximum sRGB chroma for every hue at lightness ${lightness.toFixed(2)}. The ceiling peaks at ${widest.ceiling.toFixed(3)} near hue ${Math.round(widest.hue)} degrees and bottoms out at ${narrowest.ceiling.toFixed(3)} near hue ${Math.round(narrowest.hue)} degrees. At chroma ${chroma.toFixed(3)}, ${clippedShare} percent of hues fall outside sRGB.`}
          className="h-auto w-full touch-none"
          onPointerMove={updateHoveredHue}
          onPointerLeave={() => setHoveredHue(null)}
        >
          <defs>
            <linearGradient
              id="chroma-ceiling-fill"
              x1={PLOT_LEFT}
              x2={PLOT_RIGHT}
              gradientUnits="userSpaceOnUse"
            >
              {buildHueGradientStops(lightness, samples).map((stop) => (
                <stop
                  key={stop.offset}
                  offset={stop.offset}
                  stopColor={stop.color}
                />
              ))}
            </linearGradient>
            <pattern
              id="chroma-ceiling-clip"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="8"
                className="stroke-muted-foreground"
                strokeWidth="2"
                opacity="0.5"
              />
            </pattern>
          </defs>

          {CHROMA_TICKS.map((tick) => (
            <g key={tick}>
              <line
                x1={PLOT_LEFT}
                x2={PLOT_RIGHT}
                y1={toY(tick)}
                y2={toY(tick)}
                className="stroke-border"
                strokeWidth="1"
              />
              <text
                x={PLOT_LEFT - 10}
                y={toY(tick) + 4}
                textAnchor="end"
                className="fill-muted-foreground font-mono text-[11px] tabular-nums"
              >
                {tick.toFixed(2)}
              </text>
            </g>
          ))}

          <path d={buildAreaPath(samples)} fill="url(#chroma-ceiling-fill)" />

          {buildClippedPaths(samples, chroma).map((path) => (
            <path
              key={path.slice(0, 24)}
              d={path}
              fill="url(#chroma-ceiling-clip)"
            />
          ))}

          <path
            d={buildLinePath(samples)}
            fill="none"
            className="stroke-foreground"
            strokeWidth="2"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          <line
            x1={PLOT_LEFT}
            x2={PLOT_RIGHT}
            y1={toY(chroma)}
            y2={toY(chroma)}
            className="stroke-foreground"
            strokeWidth="2"
            strokeDasharray="6 5"
            vectorEffect="non-scaling-stroke"
          />
          <g
            transform={`translate(${PLOT_LEFT + 8}, ${Math.max(PLOT_TOP + 2, toY(chroma) - 24)})`}
          >
            <rect
              width="74"
              height="20"
              className="fill-card stroke-border"
              strokeWidth="1"
            />
            <text
              x="8"
              y="14"
              className="fill-foreground font-mono text-[11px] tabular-nums"
            >
              C {chroma.toFixed(3)}
            </text>
          </g>

          {hovered ? (
            <g aria-hidden="true">
              <line
                x1={toX(hovered.hue)}
                x2={toX(hovered.hue)}
                y1={PLOT_TOP}
                y2={PLOT_BOTTOM}
                className="stroke-foreground"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={toX(hovered.hue)}
                cy={toY(hovered.ceiling)}
                r="5"
                className="fill-foreground stroke-card"
                strokeWidth="2"
              />
            </g>
          ) : null}

          <line
            x1={PLOT_LEFT}
            x2={PLOT_RIGHT}
            y1={PLOT_BOTTOM}
            y2={PLOT_BOTTOM}
            className="stroke-border"
            strokeWidth="1"
          />

          {HUE_TICKS.map((tick) => (
            <text
              key={tick}
              x={toX(tick)}
              y={PLOT_BOTTOM + 22}
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-[11px] tabular-nums"
            >
              {tick}°
            </text>
          ))}

          <text
            x={PLOT_LEFT}
            y={CHART_HEIGHT - 8}
            className="fill-muted-foreground font-mono text-[11px]"
          >
            hue
          </text>
        </svg>

        {hovered ? (
          <div
            aria-hidden="true"
            className="bg-card border-border text-foreground pointer-events-none absolute flex -translate-x-1/2 -translate-y-full items-center gap-2 border px-2 py-1 font-mono text-xs tabular-nums"
            style={{
              left: `calc(${(toX(hovered.hue) / CHART_WIDTH) * 100}% )`,
              top: `calc(${(toY(hovered.ceiling) / CHART_HEIGHT) * 100}% - 0.5rem)`,
            }}
          >
            <span
              className="size-3 shrink-0 border border-black/10 dark:border-white/10"
              style={{
                backgroundColor: toSafeCssColor({
                  l: lightness,
                  c: hovered.ceiling,
                  h: hovered.hue,
                }),
              }}
            />
            {formatOklch({
              l: lightness,
              c: hovered.ceiling,
              h: hovered.hue,
            })}
          </div>
        ) : null}
      </div>

      <div className="border-border grid gap-5 border-t p-4 min-[42rem]:grid-cols-2 min-[42rem]:p-6">
        <DemoSlider
          id="chroma-ceiling-lightness"
          label="Lightness"
          value={lightness}
          min={0.15}
          max={0.95}
          step={0.01}
          onValueChange={setLightness}
          valueLabel={lightness.toFixed(2)}
          track={createLightnessGradient(0, 0)}
        />
        <DemoSlider
          id="chroma-ceiling-chroma"
          label="Requested chroma"
          value={chroma}
          min={0}
          max={0.3}
          step={0.005}
          onValueChange={setChroma}
          valueLabel={chroma.toFixed(3)}
          track={createChromaGradient(lightness, widest.hue)}
        />
      </div>

      <div className="border-border text-muted-foreground border-t px-4 py-3 text-sm min-[42rem]:px-6">
        At this lightness the ceiling runs from{' '}
        <span className="text-foreground font-mono tabular-nums">
          {narrowest.ceiling.toFixed(3)}
        </span>{' '}
        to{' '}
        <span className="text-foreground font-mono tabular-nums">
          {widest.ceiling.toFixed(3)}
        </span>
        , so one flat chroma of{' '}
        <span className="text-foreground font-mono tabular-nums">
          {chroma.toFixed(3)}
        </span>{' '}
        leaves sRGB on{' '}
        <span className="text-foreground font-mono tabular-nums">
          {clippedShare}%
        </span>{' '}
        of the wheel.
      </div>
    </ColorDemoFrame>
  )
}
