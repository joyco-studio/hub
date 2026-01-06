import { CircleDotDashed } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type MaintainersProps = {
  maintainers: string[]
  lastModified?: Date
}

export function Maintainers({ maintainers, lastModified }: MaintainersProps) {
  if (maintainers.length === 0) return null

  return (
    <div className="bg-muted flex flex-col">
      <div className="text-foreground flex items-center gap-2 p-2">
        <CircleDotDashed className="size-3" />
        <span className="font-mono text-xs font-medium tracking-wide uppercase">
          Maintainers
        </span>
      </div>
      <div className="flex flex-col">
        {maintainers.map((maintainer) => (
          <a
            key={maintainer}
            href={`https://github.com/${maintainer}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-2 px-2.5 py-1.5 font-mono text-sm uppercase transition-colors"
          >
            <Avatar className="size-5">
              <AvatarImage
                src={`https://github.com/${maintainer}.png`}
                alt={maintainer}
                width={20}
                height={20}
              />
              <AvatarFallback className="text-xs">
                {maintainer.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {maintainer}
          </a>
        ))}
      </div>

      {lastModified && (
        <span className="text-muted-foreground/60 my-1 px-2 py-1 font-mono text-xs">
          {lastModified.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
          })}
        </span>
      )}
    </div>
  )
}
