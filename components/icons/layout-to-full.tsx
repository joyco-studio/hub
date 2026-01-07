import * as React from 'react'
import { SVGProps } from 'react'

const LayoutToFullIcon = (props: SVGProps<SVGSVGElement>) => (
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
      d="M5 3V21H3V3H5ZM11.0996 12L14.6348 15.5352L16.0488 14.1211L14.9277 13H17.7568V11H14.9277L16.0488 9.87793L14.6348 8.46387L11.0996 12ZM21 21H9V3H21V21Z"
    />
  </svg>
)
export default LayoutToFullIcon

