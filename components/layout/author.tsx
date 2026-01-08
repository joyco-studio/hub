import { CircleDotDashed } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type AuthorProps = {
  author?: string
}

export function Author({ author }: AuthorProps) {
  if (!author) return null

  return (
    <div className="bg-muted flex flex-col gap-4 py-6 pb-4">
      <div className="text-foreground flex items-center gap-2 px-6">
        <CircleDotDashed className="size-3" />
        <span className="font-mono text-xs font-medium tracking-wide uppercase">
          Author
        </span>
      </div>
      <div className="flex flex-col">
        <a
          href={`https://github.com/${author}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-2 px-5.5 py-1.5 font-mono text-sm uppercase transition-colors"
        >
          <Avatar className="size-5">
            <AvatarImage
              src={`https://github.com/${author}.png`}
              alt={author}
              width={20}
              height={20}
            />
            <AvatarFallback className="text-xs">
              {author.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {author}
        </a>
      </div>
    </div>
  )
}


