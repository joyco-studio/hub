import * as React from 'react'
import { SVGProps } from 'react'

const CopyIcon = (props: SVGProps<SVGSVGElement>) => (
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
      d="M22 2H8V8H2V22H16V16H22V2ZM16 14H20V4H10V8H16V14Z"
    />
  </svg>
)
export default CopyIcon

