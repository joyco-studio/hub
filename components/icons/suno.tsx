import { SVGProps } from 'react'

export default function SunoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 240 240" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M240 0L1.04907e-05 0.000966072L79.5 -7.01568e-06L6.99378e-06 80.001L4.02136e-06 148.002L133 148.002L133 127.001L161 127.001L161 197.001L133 197.001L133 176.002L2.79744e-06 176.002L0 240L161 240L240 160.503L240 89.002L102 89.0019L102 112.001L74 112.001L74 42.001L102 42.001L102 61.0019L240 61.002L240 0Z"
      />
      <circle cx="9" cy="9" r="9" transform="matrix(1 0 0 -1 222 240)" />
    </svg>
  )
}
