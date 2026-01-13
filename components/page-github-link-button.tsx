import Link from 'next/link'
import { Button } from './ui/button'
import { GithubIcon } from './icons'
import { getGitHubBlobUrl } from '@/lib/github'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PageGithubLinkButton({
  path,
  className,
}: {
  path: string
  className?: string
}) {
  return (
    <Button
      asChild
      variant="secondary"
      size="sm"
      className={cn('font-mono tracking-wide uppercase', className)}
    >
      <Link
        href={getGitHubBlobUrl(`content/${path}`)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <GithubIcon className="size-4" />
        See on GitHub
        <ArrowUpRight className="size-3" />
      </Link>
    </Button>
  )
}
