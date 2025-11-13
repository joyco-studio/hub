'use client';
import { InfiniteScroll, useInfiniteScrollState } from '@/registry/joyco/blocks/infinite-scroll/infinite-scroll';
import { LoadPageFn } from '@/registry/joyco/blocks/infinite-scroll/use-infinite-scroll';
import { Card, CardHeader, CardTitle } from '@/registry/joyco/ui/card';
import * as React from 'react';

const ITEMS = Array.from({ length: 100 }, (_, index) => index);
const loadPage: LoadPageFn<number> = async ({ offset, limit }) => {
  return { items: ITEMS.slice(offset, offset + limit), totalCount: ITEMS.length + 100 };
};

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
      <h1>Joyco Registry</h1>
      <InfiniteScroll.Provider debug loadPage={loadPage} autoAdvance bias={10} initialPage={1} pageSize={10}>
        <InfiniteScrollDemo />
      </InfiniteScroll.Provider>
    </div>
  );
}

const InfiniteScrollDemo = () => {
  const { visibleItems } = useInfiniteScrollState<number>();
  return (
    <InfiniteScroll.Root className="max-h-96 overflow-y-auto w-full rounded-2xl border border-border p-4">
      <InfiniteScroll.Viewport className="flex flex-col gap-4">
        {visibleItems.map((item) => (
          <InfiniteScroll.Item key={item} index={item}>
            <Card className="p-4">
              <CardHeader>
                <CardTitle>Item {item}</CardTitle>
              </CardHeader>
            </Card>
          </InfiniteScroll.Item>
        ))}
      </InfiniteScroll.Viewport>
      <InfiniteScroll.Sentinel />
      <InfiniteScroll.Debug placement="floating" />
    </InfiniteScroll.Root>
  );
};
