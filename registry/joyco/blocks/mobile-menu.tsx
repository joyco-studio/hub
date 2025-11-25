"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

const MobileMenu = ({ children, ...props }: React.ComponentProps<typeof Dialog.Root>) => (
  <Dialog.Root modal={false} {...props}>
    {children}
  </Dialog.Root>
)

const MobileMenuTrigger = React.forwardRef<
  React.ComponentRef<typeof Dialog.Trigger>,
  React.ComponentPropsWithoutRef<typeof Dialog.Trigger>
>(({ className, children, ...props }, ref) => (
  <Dialog.Trigger
    ref={ref}
    className={cn(
      "inline-flex group/menu-trigger items-center z-10 justify-center gap-2 rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      className
    )}
    {...props}
  >
    {children}
  </Dialog.Trigger>
))
MobileMenuTrigger.displayName = "MobileMenuTrigger"

const MobileMenuClose = React.forwardRef<
  React.ComponentRef<typeof Dialog.Close>,
  React.ComponentPropsWithoutRef<typeof Dialog.Close>
>(({ className, children, ...props }, ref) => (
  <Dialog.Close
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      className
    )}
    {...props}
  >
    {children}
  </Dialog.Close>
))
MobileMenuClose.displayName = "MobileMenuClose"

const MobileMenuContent = React.forwardRef<
  React.ComponentRef<typeof Dialog.Content>,
  React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className, children, ...props }, ref) => (
  <Dialog.Content
    ref={ref}
    className={cn(
      "fixed inset-0 pt-heading-height bg-background flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-4 data-[state=open]:slide-in-from-top-4",
      className
    )}
    {...props}
  >
    {children}
  </Dialog.Content>
))
MobileMenuContent.displayName = "MobileMenuContent"

const MobileMenuNav = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn("flex flex-1 flex-col gap-1 p-4 overflow-y-auto", className)}
    {...props}
  />
))
MobileMenuNav.displayName = "MobileMenuNav"

const MobileMenuLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Dialog.Close asChild>
      <Comp
        ref={ref}
        className={cn(
          "group flex items-center gap-3 rounded-lg py-3 px-2 text-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
        {...props}
      />
    </Dialog.Close>
  )
})
MobileMenuLink.displayName = "MobileMenuLink"

const MobileMenuFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-auto p-6",
      className
    )}
    {...props}
  />
))
MobileMenuFooter.displayName = "MobileMenuFooter"

export {
  MobileMenu,
  MobileMenuTrigger,
  MobileMenuContent,
  MobileMenuClose,
  MobileMenuNav,
  MobileMenuLink,
  MobileMenuFooter,
}

