import * as React from 'react'
import { SVGProps } from 'react'
const TerminalWithCursorIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <g fill="currentColor">
      <path d="M22.004 4h-20v17h10v-2h-8V6h16v6h2V4Z" />
      <path d="m13.493 13.488 10.69 3.29-4.933 2.466-2.468 4.934-3.289-10.69ZM5.505 8.75a1.25 1.25 0 1 0 2.5 0 1.25 1.25 0 0 0-2.5 0ZM9.002 8.75a1.25 1.25 0 1 0 2.5 0 1.25 1.25 0 0 0-2.5 0ZM12.504 8.75a1.25 1.25 0 1 0 2.5 0 1.25 1.25 0 0 0-2.5 0Z" />
    </g>
  </svg>
)
export default TerminalWithCursorIcon
