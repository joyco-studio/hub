import { InfiniteScrollDemo } from '@/registry/joyco/blocks/infinite-scroll/infinite-scroll-demo-server';
import * as React from 'react';

// This page displays items from the custom registry.
// You are free to implement this with your own design as needed.

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
      <InfiniteScrollDemo />
    </div>
  );
}
