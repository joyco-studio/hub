import * as React from 'react'
import { SVGProps } from 'react'
const CubeIcon = (props: SVGProps<SVGSVGElement>) => (
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
      d="M11 12.578v10l-8.66-5v-10l8.66 5ZM21.66 17.578l-8.66 5v-10l8.66-5v10ZM20.655 5.845l-8.659 5-8.66-5 8.66-5 8.66 5Z"
    />
  </svg>
)
export default CubeIcon
