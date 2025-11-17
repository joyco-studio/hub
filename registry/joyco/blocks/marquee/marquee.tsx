'use client';

import { Marquee as MarqueeComponent, ReactMarqueeConfigProps, useMarquee as useMarqueeHook } from '@joycostudio/marquee/react';

export const useMarquee = useMarqueeHook;

export function Marquee({ children, speed = 100, direction = 1, ...props }: ReactMarqueeConfigProps) {
  return (
    <MarqueeComponent speed={speed} direction={direction} {...props}>
      {children}
    </MarqueeComponent>
  );
}
