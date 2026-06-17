'use client'

import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CardLinkGrid } from '@/components/card-link'
import type { RegistryComponentResult } from '@/lib/registry-search'

export function ResultCards({
  results,
}: {
  results: RegistryComponentResult[]
}) {
  if (results.length === 0) {
    return (
      <p className="text-muted-foreground my-4 ml-2 text-sm">
        No matching components found.
      </p>
    )
  }

  return (
    <div className="my-4 mr-10 ml-2" data-slot="ai-sdk-chat-results">
      <style>{
        /* css */ `
          @keyframes ai-chat-card-in {
            from { opacity: 0; transform: translateY(8px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          [data-slot='ai-sdk-chat-results'] [data-card] {
            opacity: 0;
            animation: ai-chat-card-in 220ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
          }
          @media (prefers-reduced-motion: reduce) {
            @keyframes ai-chat-card-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          }
        `
      }</style>
      <CardLinkGrid>
        {results.map((result, i) => (
          <Link
            key={result.name}
            data-card
            href={result.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ animationDelay: `${i * 50}ms` }}
            className="not-prose group/card-title block h-full"
          >
            <Card className="hocus:bg-accent/50 hocus:border-accent h-full transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-1 [&>svg]:size-4 [&>svg]:stroke-3">
                  {result.title}
                  <ArrowRightIcon className="group-hocus/card-title:translate-x-1 transition-transform" />
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {result.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </CardLinkGrid>
    </div>
  )
}
