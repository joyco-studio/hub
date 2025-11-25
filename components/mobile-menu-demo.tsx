"use client"

import { Card } from "@/components/ui/card"
import { ResizableIframe } from "@/components/resizable-iframe"

import { Menu, X } from "lucide-react"
import * as MobileMenu from "@/registry/joyco/blocks/mobile-menu"

export function DemoPage() {
  return (
    <div className="min-h-svh bg-background w-full text-foreground font-sans">
      <header className="flex items-center justify-between px-6 h-heading-height border-b border-border sticky top-0 bg-background z-40">
        <div className="font-bold text-xl tracking-tight z-20 relative">NOT JOYCO</div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-foreground">
            Home
          </a>
          <a href="#" className="text-sm font-medium text-foreground">
            About
          </a>
          <a href="#" className="text-sm font-medium text-foreground">
            Services
          </a>
          <a href="#" className="text-sm font-medium text-foreground">
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
              <MobileMenu.Item href="#">
                Home
              </MobileMenu.Item>
              <MobileMenu.Item href="#">
                Profile
              </MobileMenu.Item>
              <MobileMenu.Item href="#">
                Settings
              </MobileMenu.Item>
              <MobileMenu.Item href="#">
                Contact
              </MobileMenu.Item>
            </MobileMenu.Navigation>
            <MobileMenu.Footer>
              <p className="text-sm text-muted-foreground">© 2025 Defenitely Not Joyco Inc.</p>
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
      <Card className="overflow-hidden py-0 bg-card border-border">
        <ResizableIframe
          src="/demos/mobile-menu"
          defaultWidth={400}
          minWidth={280}
          height={600}
          title="mobile-menu demo page"
        />
      </Card>

      <p className="text-sm text-muted-foreground mt-3 text-center">
        Drag the right edge to resize. Menu button appears below 768px.
      </p>
    </div>
  )
}
