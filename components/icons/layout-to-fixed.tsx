import * as React from 'react'
import { SVGProps } from 'react'

const LayoutToFixedIcon = (props: SVGProps<SVGSVGElement>) => (
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
      d="M21 21H3V3H21V21ZM6 7V18H8V7H6ZM13.8086 9.87793L14.9297 11H12.1016V13H14.9297L13.8086 14.1211L15.2227 15.5352L18.7578 12L15.2227 8.46387L13.8086 9.87793Z"
    />
  </svg>
)
export default LayoutToFixedIcon

