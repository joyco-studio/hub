import * as React from 'react'
import { SVGProps } from 'react'
const SearchIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path fill="currentColor" d="M11 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M11 3a8 8 0 1 0 4.906 14.32L20 21.414 21.414 20l-4.094-4.094A8 8 0 0 0 11 3Zm-6 8a6 6 0 1 1 12 0 6 6 0 0 1-12 0Z"
      clipRule="evenodd"
    />
  </svg>
)
export default SearchIcon
