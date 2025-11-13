'use client';

import Image from 'next/image';
import * as React from 'react';

import { InfiniteScroll, useInfiniteScrollState } from './infinite-scroll';
import type { Pokemon } from './infinite-scroll-demo-server';

export function InfiniteScrollDemoContent() {
  const { visibleItems, loading, error, hasMore, retry } = useInfiniteScrollState<Pokemon>();

  return (
    <InfiniteScroll.Root className="flex flex-col gap-6">
      <InfiniteScroll.Viewport className="grid gap-4 md:grid-cols-2">
        {visibleItems.map((item, index) => (
          <InfiniteScroll.Item key={item.id} index={index} asChild>
            <article className="flex gap-4 rounded-lg border p-4 shadow-sm transition hover:shadow-md">
              <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-muted">
                <Image src={item.sprite} alt={item.name} width={80} height={80} className="h-20 w-20 object-contain" />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="text-base font-medium capitalize">{item.name}</h3>
                  <p className="text-muted-foreground mt-1 text-xs uppercase tracking-wide">
                    #{item.id.toString().padStart(4, '0')}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.types.length ? item.types.map((type) => type.toUpperCase()).join(' • ') : 'Unknown type'}
                </div>
              </div>
            </article>
          </InfiniteScroll.Item>
        ))}
      </InfiniteScroll.Viewport>

      {loading ? (
        <InfiniteScroll.Viewport className="grid gap-4 md:grid-cols-2" data-state="loading">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-lg border bg-muted/60" />
          ))}
        </InfiniteScroll.Viewport>
      ) : null}

      {!visibleItems.length && !loading && !error ? (
        <div className="text-center text-sm text-muted-foreground">No Pokémon found.</div>
      ) : null}

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <span>Couldn&apos;t load more items: {error}</span>
          <button
            type="button"
            onClick={retry}
            className="rounded border border-destructive px-2 py-1 text-destructive"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!hasMore && !loading ? (
        <div className="text-center text-sm text-muted-foreground">You&apos;ve seen all available Pokémon!</div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          Showing {visibleItems.length}
          {hasMore ? '+' : ''} Pokémon
        </span>
        <InfiniteScroll.Trigger className="rounded border px-3 py-2 text-sm font-medium">
          Load next page
        </InfiniteScroll.Trigger>
      </div>

      <InfiniteScroll.Sentinel className="h-px w-full" />

      <InfiniteScroll.Debug placement="floating" />
    </InfiniteScroll.Root>
  );
}
