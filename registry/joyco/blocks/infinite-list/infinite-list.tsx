'use client';

import * as React from 'react';
import { Children, type ReactNode } from 'react';

export function useInfiniteList({
  pageSize,
  initialItems,
  initialPage = 1,
}: {
  pageSize: number;
  initialItems?: any[];
  initialPage?: number;
}) {
  const [requestedPage, setRequestedPage] = React.useState(initialPage);

  const bias = React.useMemo(
    () => {
      const bias = Math.max(0, (initialItems?.length ?? 0) - pageSize)
      if (bias !== pageSize && bias !== 0) {
        console.warn(
          `[useInfiniteList] bias (${bias}) differs from pageSize (${pageSize}). ` +
          `This will cause instantly displayed items to be appended with more items when the next page loads.`
        );
      }
      return bias;
    },
    [initialItems?.length, pageSize]
  );

  const displayLimit = requestedPage * pageSize;

  const nextPage = React.useCallback(() => {
    setRequestedPage((current) => current + 1);
  }, []);

  return {
    offset: requestedPage * pageSize + bias,
    displayLimit,
    pageSize,
    bias,
    nextPage
  };
}

export function MaskedList({ 
  children, 
  displayLimit 
}: ReturnType<typeof useInfiniteList> & { children: ReactNode }) {
  const childArray = Children.toArray(children);
  const visibleChildren = childArray.slice(0, displayLimit);
  return <>{visibleChildren}</>;
}