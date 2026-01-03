import Link from 'next/link'

import { ArrowUpRight, BookOpenText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DocLink {
  label: string
  href: string
}

export function DocsLinks({
  links,
  className,
}: {
  links: DocLink[]
  className?: string
}) {
  if (links.length === 0) return null

  return (
    <div
      data-slot="doc-links"
      className={cn('not-prose my-0 flex flex-wrap gap-x-2 gap-y-1', className)}
    >
      {links.map((link) => (
        <Button variant="outline" size="sm" key={link.href} asChild>
          <Link href={link.href} target="_blank" rel="noopener noreferrer">
            <BookOpenText className="size-4" />
            {link.label}
            <ArrowUpRight className="size-3.5" />
          </Link>
        </Button>
      ))}
    </div>
  )
}
