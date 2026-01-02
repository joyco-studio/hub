export const ElevenLabsLogo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="none"
    className={className}
  >
    <g fill="currentColor" clipPath="url(#elevenlabs-clip)">
      <path d="M8 0H4v20h4V0ZM16 0h-4v20h4V0Z" />
    </g>
    <defs>
      <clipPath id="elevenlabs-clip">
        <path fill="#fff" d="M4 0h12v20H4z" />
      </clipPath>
    </defs>
  </svg>
)
