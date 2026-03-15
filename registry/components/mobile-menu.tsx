'use client'

import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { RemoveScroll } from 'react-remove-scroll'
import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'

const Root = ({
  children,
  modal = false,
  ...props
}: React.ComponentProps<typeof Dialog.Root>) => (
  <Dialog.Root modal={modal} {...props}>
    {children}
  </Dialog.Root>
)

const Trigger = React.forwardRef<
  React.ComponentRef<typeof Dialog.Trigger>,
  React.ComponentPropsWithoutRef<typeof Dialog.Trigger>
>(({ className, children, ...props }, ref) => (
  <Dialog.Trigger
    ref={ref}
    className={cn(
      'group/menu-trigger hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring z-20 transform-gpu rounded-md p-2 transition-colors focus-visible:ring-2 focus-visible:outline-none md:hidden',
      className
    )}
    {...props}
  >
    {children}
  </Dialog.Trigger>
))
Trigger.displayName = 'Trigger'

const Close = React.forwardRef<
  React.ComponentRef<typeof Dialog.Close>,
  React.ComponentPropsWithoutRef<typeof Dialog.Close>
>(({ className, children, ...props }, ref) => (
  <Dialog.Close
    ref={ref}
    className={cn(
      'focus-visible:ring-ring inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none',
      className
    )}
    {...props}
  >
    {children}
  </Dialog.Close>
))
Close.displayName = 'Close'

const Content = React.forwardRef<
  React.ComponentRef<typeof Dialog.Content>,
  React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className, children, ...props }, ref) => (
  <RemoveScroll as={Slot}>
    <Dialog.Content
      ref={ref}
      className={cn(
        'pt-heading-height bg-background focus-visible:ring-ring data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-4 data-[state=open]:slide-in-from-top-4 fixed inset-0 z-10 flex flex-col overflow-y-auto focus-visible:ring-2 focus-visible:outline-none md:hidden',
        className
      )}
      {...props}
    >
      <Dialog.Title className="sr-only">Menu</Dialog.Title>
      {children}
    </Dialog.Content>
  </RemoveScroll>
))
Content.displayName = 'Content'

const Navigation = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn('flex flex-1 flex-col gap-1 p-4', className)}
    {...props}
  />
))
Navigation.displayName = 'Navigation'

const Item = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a'

  return (
    <Dialog.Close asChild>
      <Comp
        ref={ref}
        className={cn(
          'group text-foreground focus-visible:ring-ring flex items-center gap-3 rounded-lg px-2 py-3 text-lg focus-visible:ring-2 focus-visible:outline-none',
          className
        )}
        {...props}
      />
    </Dialog.Close>
  )
})
Item.displayName = 'Item'

const Footer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('mt-auto p-6', className)} {...props} />
))
Footer.displayName = 'Footer'

export { Root, Trigger, Content, Close, Navigation, Item, Footer }
