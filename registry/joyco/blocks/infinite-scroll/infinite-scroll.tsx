'use client';

import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from 'react';

import { useInfiniteScroll, type UseInfiniteScrollOptions, type UseInfiniteScrollResult } from './use-infinite-scroll';

type DebugPlacement = 'inline' | 'floating';

type DebugConfig = {
  enabled?: boolean;
  placement?: DebugPlacement;
};

type InfiniteScrollContextValue<TItem> = UseInfiniteScrollResult<TItem> & {
  debugEnabled: boolean;
  debugPlacement: DebugPlacement;
};

type AnyInfiniteScrollState = InfiniteScrollContextValue<unknown>;

const InfiniteScrollContext = createContext<AnyInfiniteScrollState | null>(null);

export function useInfiniteScrollState<TItem>(): InfiniteScrollContextValue<TItem> {
  const context = useContext(InfiniteScrollContext);

  if (!context) {
    throw new Error('InfiniteScroll components must be used within `InfiniteScroll.Provider`.');
  }

  return context as InfiniteScrollContextValue<TItem>;
}

type ProviderProps<TItem> = {
  children: ReactNode;
  debug?: boolean | DebugConfig;
} & UseInfiniteScrollOptions<TItem>;

export function InfiniteScrollProvider<TItem>({ children, debug = false, ...options }: ProviderProps<TItem>) {
  const state = useInfiniteScroll<TItem>(options);

  const debugConfig: DebugConfig =
    typeof debug === 'boolean'
      ? {
          enabled: debug,
        }
      : debug ?? { enabled: false };

  const debugEnabled = debugConfig.enabled ?? (typeof debug === 'boolean' ? debug : true);
  const debugPlacement: DebugPlacement = debugConfig.placement ?? (debugEnabled ? 'floating' : 'inline');

  const value = useMemo(
    () =>
      ({
        ...state,
        debugEnabled,
        debugPlacement,
      } as InfiniteScrollContextValue<TItem>),
    [state, debugEnabled, debugPlacement]
  );

  return (
    <InfiniteScrollContext.Provider value={value as AnyInfiniteScrollState}>{children}</InfiniteScrollContext.Provider>
  );
}

type RootProps = HTMLAttributes<HTMLDivElement>;

function InfiniteScrollRoot({ children, ...rest }: RootProps) {
  return <div {...rest}>{children}</div>;
}

type ViewportProps = HTMLAttributes<HTMLDivElement> & { ref?: React.RefObject<HTMLDivElement | null> };

function InfiniteScrollViewport({ children, ...rest }: ViewportProps) {
  return <div {...rest}>{children}</div>;
}

interface ItemProps extends HTMLAttributes<HTMLDivElement> {
  index: number;
  asChild?: boolean;
  children: ReactNode;
}

function InfiniteScrollItem({ index, asChild = false, children, ...rest }: ItemProps) {
  const { visibleCount } = useInfiniteScrollState<unknown>();

  const baseProps = {
    ...rest,
    'data-index': index,
    'data-visible': index < visibleCount ? '' : undefined,
  };

  if (asChild && isValidElement(children)) {
    return cloneElement(children as ReactElement, baseProps);
  }

  return <div {...baseProps}>{children}</div>;
}

interface TriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: ReactNode;
}

function InfiniteScrollTrigger({ asChild = false, children, disabled, onClick, type, ...rest }: TriggerProps) {
  const { loadMore, loading, hasMore } = useInfiniteScrollState<unknown>();

  const isDisabled = disabled ?? (!hasMore || loading);

  const runClickPipeline = (event: MouseEvent<HTMLElement>) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event as unknown as MouseEvent<HTMLButtonElement>);
    loadMore();
  };

  const handleButtonClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    runClickPipeline(event);
  };

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;

    return cloneElement(child, {
      ...(rest as Record<string, unknown>),
      disabled: isDisabled,
      'data-loading': loading ? '' : undefined,
      'data-has-more': hasMore ? '' : undefined,
      onClick: (event: MouseEvent<HTMLElement>) => {
        const childOnClick = child.props?.onClick;
        if (typeof childOnClick === 'function') {
          childOnClick(event);
        }
        runClickPipeline(event);
      },
    });
  }

  return (
    <button
      type={type ?? 'button'}
      disabled={isDisabled}
      onClick={handleButtonClick}
      data-loading={loading ? '' : undefined}
      data-has-more={hasMore ? '' : undefined}
      {...rest}
    >
      {children}
    </button>
  );
}

type SentinelProps = HTMLAttributes<HTMLDivElement>;

function InfiniteScrollSentinel({ children, ...rest }: SentinelProps) {
  const { sentinelRef } = useInfiniteScrollState<unknown>();

  return (
    <div ref={sentinelRef} {...rest}>
      {children}
    </div>
  );
}

type Tone = 'blue' | 'green' | 'amber' | 'slate' | 'rose';

const toneBadgeClass: Record<Tone, string> = {
  blue: 'bg-blue-500 text-white',
  green: 'bg-emerald-500 text-white',
  amber: 'bg-amber-500 text-white',
  slate: 'bg-slate-600 text-white',
  rose: 'bg-rose-500 text-white',
};

interface DebugStatProps {
  label: string;
  value: ReactNode;
  tone: Tone;
}

function DebugStat({ label, value, tone }: DebugStatProps) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border/60 bg-background/70 p-3">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span
        className={`inline-flex min-h-[1.5rem] items-center justify-center rounded-full px-2 text-xs ${toneBadgeClass[tone]}`}
      >
        {value}
      </span>
    </div>
  );
}

interface DebugProps extends HTMLAttributes<HTMLDivElement> {
  enabled?: boolean;
  placement?: DebugPlacement;
}

function InfiniteScrollDebug({ className, enabled, placement, ...rest }: DebugProps) {
  const {
    debugEnabled,
    debugPlacement,
    requestedPage,
    pageSize,
    bias,
    visibleItems,
    visibleCount,
    items,
    hasMore,
    loading,
    error,
    totalCount,
  } = useInfiniteScrollState<unknown>();

  const isEnabled = enabled ?? debugEnabled;
  const resolvedPlacement = placement ?? debugPlacement;

  if (!isEnabled) {
    return null;
  }

  const baseClass =
    'space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-xs shadow-sm backdrop-blur-sm md:max-w-sm';

  const placementClass =
    resolvedPlacement === 'floating'
      ? 'pointer-events-auto fixed bottom-6 right-6 z-50 w-[min(22rem,calc(100vw-3rem))] max-w-sm'
      : '';

  const containerClass = [baseClass, placementClass, className].filter(Boolean).join(' ');

  return (
    <div className={containerClass} {...rest}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">Infinite Scroll Debug</span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            loading ? toneBadgeClass.rose : toneBadgeClass.green
          }`}
        >
          {loading ? 'Loading…' : 'Idle'}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <DebugStat label="Requested Page" value={`#${requestedPage}`} tone="blue" />
        <DebugStat label="Page Size" value={pageSize} tone="slate" />
        <DebugStat label="Bias" value={bias} tone="amber" />
        <DebugStat label="Visible Count" value={visibleCount} tone="green" />
        <DebugStat label="Loaded Count" value={items.length} tone="amber" />
        <DebugStat label="Has More" value={hasMore ? 'Yes' : 'No'} tone={hasMore ? 'blue' : 'rose'} />
      </div>

      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Visible Item IDs</div>
        <div className="flex flex-wrap gap-1">
          {visibleItems.length ? (
            visibleItems.slice(0, 12).map((item, index) => {
              const identifier = getItemIdentifier(item);
              return (
                <span
                  key={`${identifier}-${index}`}
                  className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-1 text-[11px] font-medium text-blue-700"
                >
                  {identifier}
                </span>
              );
            })
          ) : (
            <span className="text-[11px] text-muted-foreground">None visible</span>
          )}
          {visibleItems.length > 12 ? (
            <span className="inline-flex items-center rounded-md bg-slate-500/10 px-2 py-1 text-[11px] text-slate-600">
              +{visibleItems.length - 12} more
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Total Count</span>
        <span>{typeof totalCount === 'number' ? totalCount : 'Unknown'}</span>
      </div>

      {error ? (
        <div className="rounded-md border border-rose-400/40 bg-rose-500/10 p-2 text-[11px] text-rose-600">
          Error: {String(error)}
        </div>
      ) : null}
    </div>
  );
}

function getItemIdentifier(item: unknown): string {
  if (item === null || typeof item === 'undefined') {
    return '—';
  }

  if (typeof item === 'object') {
    const record = item as Record<string, unknown>;
    if (typeof record.id === 'string' || typeof record.id === 'number') {
      return String(record.id);
    }
  }

  if (typeof item === 'string' || typeof item === 'number') {
    return String(item);
  }

  return '—';
}

export const InfiniteScroll = {
  Provider: InfiniteScrollProvider,
  Root: InfiniteScrollRoot,
  Viewport: InfiniteScrollViewport,
  Item: InfiniteScrollItem,
  Trigger: InfiniteScrollTrigger,
  Sentinel: InfiniteScrollSentinel,
  Debug: InfiniteScrollDebug,
} as const;

export type { UseInfiniteScrollOptions, UseInfiniteScrollResult } from './use-infinite-scroll';
