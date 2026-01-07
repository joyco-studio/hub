import * as React from 'react'
import { SVGProps } from 'react'

const TabletIcon = (props: SVGProps<SVGSVGElement>) => (
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
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20 22H4V2H20V22ZM8 17V19H16V17H8Z"
    />
  </svg>
)
export default TabletIcon

