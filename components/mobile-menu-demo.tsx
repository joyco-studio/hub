"use client"

import { Card } from "@/components/ui/card"
import { ResizableIframe } from "@/components/resizable-iframe"

import { useEffect } from "react"
import { Menu, X, Home, User, Settings, Mail } from "lucide-react"
import {
  MobileMenu,
  MobileMenuTrigger,
  MobileMenuContent,
  MobileMenuClose,
  MobileMenuNav,
  MobileMenuLink,
} from "@/registry/joyco/blocks/mobile-menu"

export function DemoPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] w-full text-white font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#0a0a0a] z-40">
        <div className="font-bold text-xl tracking-tight">Acme Inc</div>

        {/* Desktop nav - visible on md+ */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
            Home
          </a>
          <a href="#" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
            About
          </a>
          <a href="#" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
            Services
          </a>
          <a href="#" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
            Contact
          </a>
        </nav>

        {/* Mobile menu - visible on < md */}
        <div className="md:hidden">
          <MobileMenu>
            <MobileMenuTrigger className="text-white hover:bg-white/5">
              <Menu className="h-6 w-6" />
            </MobileMenuTrigger>

            <MobileMenuContent>
              <MobileMenuNav>
                <MobileMenuLink href="#">
                  <Home className="h-5 w-5 opacity-70" />
                  Home
                </MobileMenuLink>
                <MobileMenuLink href="#">
                  <User className="h-5 w-5 opacity-70" />
                  Profile
                </MobileMenuLink>
                <MobileMenuLink href="#">
                  <Settings className="h-5 w-5 opacity-70" />
                  Settings
                </MobileMenuLink>
                <MobileMenuLink href="#">
                  <Mail className="h-5 w-5 opacity-70" />
                  Contact
                </MobileMenuLink>
              </MobileMenuNav>
            </MobileMenuContent>
          </MobileMenu>
        </div>
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
