import { CircleDotDashed } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function Maintainers({ maintainers }: { maintainers: string[] }) {
  if (maintainers.length === 0) return null

  return (
    <div className="mt-2 flex flex-col">
      <h3 className="text-fd-muted-foreground inline-flex items-center gap-1.5 text-sm">
        <CircleDotDashed className="size-4" />
        Maintainers
      </h3>
      <div className="flex flex-wrap gap-2 py-3">
        {maintainers.map((maintainer) => (
          <a
            key={maintainer}
            href={`https://github.com/${maintainer}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-fd-card text-fd-foreground hover:bg-fd-accent inline-flex items-center gap-2 rounded-full border py-1 pr-2 pl-1 text-sm transition-colors"
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
    </div>
  )
}
