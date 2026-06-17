'use client'

import { PreviewCard } from '@/components/cards'
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
    <div className="my-4 ml-2" data-slot="ai-sdk-chat-results">
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
          <PreviewCard
            key={result.name}
            data-card
            name={result.name}
            title={result.title}
            type="component"
            href={result.href}
            showBadge={false}
            target="_blank"
            rel="noopener noreferrer"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </CardLinkGrid>
    </div>
  )
}
