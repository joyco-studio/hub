'use client'

import { Card } from '@/components/ui/card'
import { ResizableIframe } from '@/components/resizable-iframe'

import { Menu, X } from 'lucide-react'
import * as MobileMenu from '@/registry/joyco/blocks/mobile-menu'

export function DemoPage() {
  return (
    <div className="bg-background text-foreground min-h-svh w-full font-sans">
      <header className="h-heading-height border-border bg-background sticky top-0 z-40 flex items-center justify-between border-b px-6">
        <div className="relative z-20 text-xl font-bold tracking-tight">
          NOT JOYCO
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#" className="text-foreground text-sm font-medium">
            Home
          </a>
          <a href="#" className="text-foreground text-sm font-medium">
            About
          </a>
          <a href="#" className="text-foreground text-sm font-medium">
            Services
          </a>
          <a href="#" className="text-foreground text-sm font-medium">
            Contact
          </a>
        </nav>

        <MobileMenu.Root>
          <MobileMenu.Trigger>
            <Menu className="h-6 w-6 group-data-[state=open]/menu-trigger:hidden" />
            <X className="h-6 w-6 group-data-[state=closed]/menu-trigger:hidden" />
          </MobileMenu.Trigger>

          <MobileMenu.Content>
            <MobileMenu.Navigation>
              <MobileMenu.Item href="#">Home</MobileMenu.Item>
              <MobileMenu.Item href="#">Profile</MobileMenu.Item>
              <MobileMenu.Item href="#">Settings</MobileMenu.Item>
              <MobileMenu.Item href="#">Contact</MobileMenu.Item>
            </MobileMenu.Navigation>
            <MobileMenu.Footer>
              <p className="text-muted-foreground text-sm">
                © 2025 Defenitely Not Joyco Inc.
              </p>
            </MobileMenu.Footer>
          </MobileMenu.Content>
        </MobileMenu.Root>
      </header>
    </div>
  )
}

export function MobileMenuDemo() {
  return (
    <div className="not-prose">
      <Card className="bg-card border-border overflow-hidden py-0">
        <ResizableIframe
          src="/demos/mobile-menu"
          defaultWidth={400}
          minWidth={280}
          height={600}
          title="mobile-menu demo page"
        />
      </Card>

      <p className="text-muted-foreground mt-3 text-center text-sm">
        Drag the right edge to resize. Menu button appears below 768px.
      </p>
    </div>
  )
}
