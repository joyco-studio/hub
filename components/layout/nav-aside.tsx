'use client'

import { sitemap } from '@/lib/sitemap'
import Link from 'next/link'
import React, { SVGProps } from 'react'
import { Logo } from '../logos'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { Button } from '../ui/button'
import { ThemeToggle } from './theme-toggle'
import { LayoutToggle } from './layout-toggle'
import { Slot } from '@radix-ui/react-slot'

export const NavAside = () => {
  const pathname = usePathname()

  return (
    <div className="w-aside-width flex h-screen shrink-0 flex-col gap-1 self-start max-md:hidden">
      <Link
        href="/"
        className="size-aside-width bg-primary text-primary-foreground flex items-center justify-center"
      >
        <Logo />
      </Link>
      {sitemap.map((item) => (
        <AsideButton
          key={item.href}
          icon={item.icon}
          label={item.label}
          active={pathname.startsWith(item.href)}
          asChild
        >
          <Link href={item.href} />
        </AsideButton>
      ))}
      <div className="bg-muted flex-1" />
      <LayoutToggle />
      <ThemeToggle />
    </div>
  )
}

export type AsideButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  'variant' | 'size'
> & {
  icon?: React.ComponentType<SVGProps<SVGSVGElement>>
  label?: string
  active?: boolean
}

export const AsideButton = ({
  icon: Icon,
  label,
  active = false,
  className,
  children,
  asChild,
  ...props
}: AsideButtonProps) => {
  // If icon/label provided, use structured content; otherwise use children directly
  const content =
    Icon && label ? (
      <>
        <Icon className={cn('size-5', active && 'rotate-90')} />
        <span className={cn('text-sm 2xl:text-base', !active && 'sr-only')}>
          {label}
        </span>
      </>
    ) : (
      children
    )

  const buttonClassName = cn(
    'bg-muted text-muted-foreground w-aside-width flex items-center justify-center gap-2 font-mono font-medium tracking-wide uppercase transition-colors',
    active
      ? 'bg-accent hover:bg-accent text-accent-foreground h-auto rotate-180 px-6 [writing-mode:vertical-rl]'
      : 'h-aside-width size-aside-width hover:bg-accent/50',
    className
  )

  if (asChild && React.isValidElement(children)) {
    return (
      <Slot className={buttonClassName} {...props}>
        {React.cloneElement(
          children as React.ReactElement<{ children?: React.ReactNode }>,
          { children: Icon && label ? content : undefined }
        )}
      </Slot>
    )
  }

  return (
    <Button variant="muted" size="icon" className={buttonClassName} {...props}>
      {content}
    </Button>
  )
}
