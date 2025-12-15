import Link from 'next/link'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function CardLinkGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
}

export function CardLink({
  href,
  title,
  description,
}: {
  href: string
  title: React.ReactNode
  description: React.ReactNode
}) {
  return (
    <Card className="group/card-title hocus:bg-accent/50 hocus:border-primary/20 transition-colors" asChild>
      <Link className="not-prose contents" href={href}>
        <CardHeader>
          <CardTitle className="flex items-center gap-1 [&>svg]:size-4 [&>svg]:stroke-3">
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Link>
    </Card>
  )
}
