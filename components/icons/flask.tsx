import { SVGProps } from 'react'

const FlaskIcon = (props: SVGProps<SVGSVGElement>) => (
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
      d="M9 2v2h1v5.53L4.39 18.2A2 2 0 0 0 6.1 21h11.8a2 2 0 0 0 1.71-2.8L14 9.53V4h1V2H9Zm3 7.53 5.44 8.17a.25.25 0 0 1-.21.3H6.77a.25.25 0 0 1-.22-.3L12 9.53Z"
    />
  </svg>
)

export default FlaskIcon
