'use client'

import { sitemap } from '@/lib/sitemap'
import Link from 'next/link'
import React, { SVGProps } from 'react'
import { Logo } from '../logos'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { Button } from '../ui/button'
import { ThemeToggle } from './theme-toggle'

export const NavAside = () => {
  const pathname = usePathname()

  return (
    <div className="sticky top-0 flex h-screen flex-col gap-1 self-start max-md:hidden">
      <div className="size-aside-width bg-primary text-primary-foreground flex items-center justify-center">
        <Logo />
      </div>
      {sitemap.map((item) => (
        <AsideButton
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          active={pathname.startsWith(item.href)}
        />
      ))}
      <div className="bg-muted flex-1" />
      <ThemeToggle />
    </div>
  )
}

export type AsideButtonProps = {
  icon: React.ComponentType<SVGProps<SVGSVGElement>>
  label: string
  active?: boolean
} & ({ href: string; onClick?: never } | { href?: never; onClick: () => void })

export const AsideButton = ({
  icon: Icon,
  label,
  active = false,
  href,
  onClick,
}: AsideButtonProps) => {
  const content = (
    <>
      <Icon className={cn('size-5', active ? 'rotate-90' : '')} />
      <span className={cn('text-sm 2xl:text-base', active ? '' : 'sr-only')}>
        {label}
      </span>
    </>
  )

  return (
    <Button
      variant="muted"
      size="icon"
      className={cn(
        'bg-muted w-aside-width flex items-center justify-center gap-2 font-mono font-medium tracking-wide uppercase transition-none',
        active
          ? 'bg-accent text-accent-foreground h-auto rotate-180 px-6 [writing-mode:vertical-rl]'
          : 'h-aside-width size-aside-width hover:brightness-95'
      )}
      asChild={!!href}
      onClick={onClick}
    >
      {href ? <Link href={href}>{content}</Link> : content}
    </Button>
  )
}
