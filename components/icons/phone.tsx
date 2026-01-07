import * as React from 'react'
import { SVGProps } from 'react'

const PhoneIcon = (props: SVGProps<SVGSVGElement>) => (
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
      d="M5 23V1H19V23H5ZM9 18V20H15V18H9Z"
    />
  </svg>
)
export default PhoneIcon

