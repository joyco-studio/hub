import * as React from 'react'
import { SVGProps } from 'react'

const TextScanIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path fill="currentColor" d="M5 19H9V21H3V15H5V19Z" />
    <path fill="currentColor" d="M21 21H15V19H19V15H21V21Z" />
    <path fill="currentColor" d="M14 15H8V13H14V15Z" />
    <path fill="currentColor" d="M16 11H8V9H16V11Z" />
    <path fill="currentColor" d="M9 5H5V9H3V3H9V5Z" />
    <path fill="currentColor" d="M21 9H19V5H15V3H21V9Z" />
  </svg>
)
export default TextScanIcon

