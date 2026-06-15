import { SVGProps } from 'react'

export default function MetriIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 240 240" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M150.001 0H91.001V240H150.001V0ZM240.001 0H240V51H178.001V240H240.001V0ZM63.001 0H63V117H0V240H63.001V0Z"
      />
      <circle
        cx="9"
        cy="9"
        r="9"
        transform="matrix(1 0 0 -1 0.000427246 18)"
      />
    </svg>
  )
}
