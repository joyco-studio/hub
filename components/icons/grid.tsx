import * as React from 'react'
import { SVGProps } from 'react'
const GridIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      d="M3 11V3h8v8H3ZM3 13v8h8v-8H3ZM13 21h8v-8h-8v8ZM21 11V3h-8v8h8Z"
    />
  </svg>
)
export default GridIcon
