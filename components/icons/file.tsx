import * as React from 'react'
import { SVGProps } from 'react'
const FileIcon = (props: SVGProps<SVGSVGElement>) => (
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
      d="M4 2.001h16v20H4v-20Zm4 4v2h8v-2H8Zm0 4v2h8v-2H8Zm0 4v2h4v-2H8Z"
      clipRule="evenodd"
    />
  </svg>
)
export default FileIcon
