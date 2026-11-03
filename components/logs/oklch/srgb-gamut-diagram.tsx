import { ColorDemoFrame } from './demo-primitives'

const VISIBLE_GAMUT_PATH =
  'M 106 24 C 68 22 54 91 55 171 C 57 319 109 502 168 553 L 520 391 C 427 229 220 57 106 24 Z'
const SRGB_GAMUT_PATH = 'M 251 166 L 459 350 L 153 511 Z'

export function SrgbGamutDiagram() {
  return (
    <ColorDemoFrame>
      <figure data-slot="srgb-gamut-diagram">
        <div
          data-slot="gamut-plot"
          className="grid place-items-center bg-black p-2 min-[42rem]:p-4"
        >
          <svg
            role="img"
            aria-labelledby="srgb-gamut-title srgb-gamut-description"
            viewBox="0 0 600 600"
            className="h-auto w-full max-w-md"
          >
            <title id="srgb-gamut-title">
              sRGB inside the visible color gamut
            </title>
            <desc id="srgb-gamut-description">
              A saturated map of the visible color gamut with a white triangle
              showing the smaller range of colors covered by sRGB.
            </desc>

            <defs>
              <clipPath id="visible-gamut-shape">
                <path d={VISIBLE_GAMUT_PATH} />
              </clipPath>
              <filter id="gamut-saturation">
                <feColorMatrix type="saturate" values="1.35" />
              </filter>
              <radialGradient id="gamut-red" cx="84%" cy="63%" r="65%">
                <stop offset="0" stopColor="#ff001f" />
                <stop offset="1" stopColor="#ff001f" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="gamut-green" cx="30%" cy="11%" r="68%">
                <stop offset="0" stopColor="#00ff30" />
                <stop offset="1" stopColor="#00ff30" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="gamut-blue" cx="22%" cy="83%" r="62%">
                <stop offset="0" stopColor="#082dff" />
                <stop offset="1" stopColor="#082dff" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="gamut-cyan" cx="12%" cy="45%" r="58%">
                <stop offset="0" stopColor="#00edff" />
                <stop offset="1" stopColor="#00edff" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="gamut-yellow" cx="61%" cy="32%" r="52%">
                <stop offset="0" stopColor="#fff500" />
                <stop offset="1" stopColor="#fff500" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="gamut-magenta" cx="53%" cy="79%" r="61%">
                <stop offset="0" stopColor="#ff00e6" />
                <stop offset="1" stopColor="#ff00e6" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="gamut-white" cx="47%" cy="56%" r="22%">
                <stop offset="0" stopColor="white" stopOpacity="0.96" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>

            <SpectrumFill />

            <path
              d={SRGB_GAMUT_PATH}
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <text
              aria-hidden="true"
              x="285"
              y="348"
              fill="#080808"
              textAnchor="middle"
              className="font-mono text-[15px] font-medium tracking-[0.16em]"
              opacity="0.72"
            >
              sRGB
            </text>
          </svg>
        </div>
      </figure>
    </ColorDemoFrame>
  )
}

function SpectrumFill() {
  return (
    <g clipPath="url(#visible-gamut-shape)" filter="url(#gamut-saturation)">
      <rect width="600" height="600" fill="#020202" />
      <rect
        width="600"
        height="600"
        fill="url(#gamut-red)"
        className="mix-blend-screen"
      />
      <rect
        width="600"
        height="600"
        fill="url(#gamut-green)"
        className="mix-blend-screen"
      />
      <rect
        width="600"
        height="600"
        fill="url(#gamut-blue)"
        className="mix-blend-screen"
      />
      <rect
        width="600"
        height="600"
        fill="url(#gamut-cyan)"
        className="mix-blend-screen"
      />
      <rect
        width="600"
        height="600"
        fill="url(#gamut-yellow)"
        className="mix-blend-screen"
      />
      <rect
        width="600"
        height="600"
        fill="url(#gamut-magenta)"
        className="mix-blend-screen"
      />
      <rect
        width="600"
        height="600"
        fill="url(#gamut-white)"
        className="mix-blend-screen"
      />
    </g>
  )
}
