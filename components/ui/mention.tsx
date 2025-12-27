'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

interface MentionContextValue {
  trigger: string
  value: string
  onValueChange: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  filteredQuery: string
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
  highlightedIndex: number
  setHighlightedIndex: (index: number) => void
  items: string[]
  registerItem: (value: string) => void
  unregisterItem: (value: string) => void
  selectItem: (value: string) => void
}

const MentionContext = React.createContext<MentionContextValue | null>(null)

function useMentionContext() {
  const context = React.useContext(MentionContext)
  if (!context) {
    throw new Error('Mention components must be used within a Mention provider')
  }
  return context
}

/* -------------------------------------------------------------------------------------------------
 * Mention
 * -----------------------------------------------------------------------------------------------*/

interface MentionProps {
  children: React.ReactNode
  value: string
  onValueChange: (value: string) => void
  trigger?: string
}

function Mention({
  children,
  value,
  onValueChange,
  trigger = '@',
}: MentionProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [filteredQuery, setFilteredQuery] = React.useState('')
  const [highlightedIndex, setHighlightedIndex] = React.useState(0)
  const [items, setItems] = React.useState<string[]>([])
  const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  const triggerPositionRef = React.useRef<number>(-1)

  const registerItem = React.useCallback((itemValue: string) => {
    setItems((prev) => [...prev, itemValue])
  }, [])

  const unregisterItem = React.useCallback((itemValue: string) => {
    setItems((prev) => prev.filter((v) => v !== itemValue))
  }, [])

  const selectItem = React.useCallback(
    (itemValue: string) => {
      if (triggerPositionRef.current >= 0) {
        const beforeTrigger = value.slice(0, triggerPositionRef.current)
        const afterQuery = value.slice(
          triggerPositionRef.current + filteredQuery.length + 1
        )
        const newValue = `${beforeTrigger}@${itemValue} ${afterQuery}`
        onValueChange(newValue)
        triggerPositionRef.current = -1
        setIsOpen(false)
        setFilteredQuery('')
        inputRef.current?.focus()
      }
    },
    [value, filteredQuery, onValueChange]
  )

  // Detect trigger and filter
  React.useEffect(() => {
    const lastTriggerIndex = value.lastIndexOf(trigger)
    if (lastTriggerIndex >= 0) {
      const afterTrigger = value.slice(lastTriggerIndex + 1)
      // Check if there's a space after the trigger (mention completed)
      if (!afterTrigger.includes(' ')) {
        triggerPositionRef.current = lastTriggerIndex
        setFilteredQuery(afterTrigger.toLowerCase())
        setIsOpen(true)
        setHighlightedIndex(0)
        return
      }
    }
    setIsOpen(false)
    setFilteredQuery('')
    triggerPositionRef.current = -1
  }, [value, trigger])

  const contextValue = React.useMemo(
    () => ({
      trigger,
      value,
      onValueChange,
      isOpen,
      setIsOpen,
      filteredQuery,
      inputRef,
      highlightedIndex,
      setHighlightedIndex,
      items,
      registerItem,
      unregisterItem,
      selectItem,
    }),
    [
      trigger,
      value,
      onValueChange,
      isOpen,
      filteredQuery,
      highlightedIndex,
      items,
      registerItem,
      unregisterItem,
      selectItem,
    ]
  )

  return (
    <MentionContext.Provider value={contextValue}>
      <div className="relative">{children}</div>
    </MentionContext.Provider>
  )
}

/* -------------------------------------------------------------------------------------------------
 * MentionInput
 * -----------------------------------------------------------------------------------------------*/

interface MentionInputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  asChild?: boolean
}

const MentionInput = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  MentionInputProps
>(({ className, asChild, children, ...props }, forwardedRef) => {
  const context = useMentionContext()
  const composedRef = React.useCallback(
    (node: HTMLInputElement | HTMLTextAreaElement | null) => {
      context.inputRef.current = node
      if (typeof forwardedRef === 'function') {
        forwardedRef(node)
      } else if (forwardedRef) {
        forwardedRef.current = node
      }
    },
    [forwardedRef, context.inputRef]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!context.isOpen) return

    const filteredItems = context.items.filter((item) =>
      item.toLowerCase().includes(context.filteredQuery)
    )

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        context.setHighlightedIndex(
          Math.min(context.highlightedIndex + 1, filteredItems.length - 1)
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        context.setHighlightedIndex(Math.max(context.highlightedIndex - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filteredItems[context.highlightedIndex]) {
          context.selectItem(filteredItems[context.highlightedIndex])
        }
        break
      case 'Escape':
        context.setIsOpen(false)
        break
    }
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<React.ComponentProps<'input'>>, {
      ref: composedRef,
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
        handleKeyDown(e)
        ;(children.props as React.InputHTMLAttributes<HTMLInputElement>).onKeyDown?.(e)
      },
    })
  }

  return (
    <input
      ref={composedRef as React.Ref<HTMLInputElement>}
      className={className}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
})
MentionInput.displayName = 'MentionInput'

/* -------------------------------------------------------------------------------------------------
 * MentionList
 * -----------------------------------------------------------------------------------------------*/

interface MentionListProps extends React.HTMLAttributes<HTMLDivElement> {}

const MentionList = React.forwardRef<HTMLDivElement, MentionListProps>(
  ({ className, children, ...props }, ref) => {
    const context = useMentionContext()

    if (!context.isOpen) return null

    return (
      <div
        ref={ref}
        role="listbox"
        className={cn(className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MentionList.displayName = 'MentionList'

/* -------------------------------------------------------------------------------------------------
 * MentionItem
 * -----------------------------------------------------------------------------------------------*/

interface MentionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const MentionItem = React.forwardRef<HTMLDivElement, MentionItemProps>(
  ({ className, value, children, onClick, ...props }, ref) => {
    const context = useMentionContext()

    React.useEffect(() => {
      context.registerItem(value)
      return () => context.unregisterItem(value)
    }, [value, context.registerItem, context.unregisterItem])

    // Filter based on query
    if (
      context.filteredQuery &&
      !value.toLowerCase().includes(context.filteredQuery)
    ) {
      return null
    }

    const filteredItems = context.items.filter((item) =>
      item.toLowerCase().includes(context.filteredQuery)
    )
    const index = filteredItems.indexOf(value)
    const isHighlighted = index === context.highlightedIndex

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isHighlighted}
        data-highlighted={isHighlighted ? '' : undefined}
        className={cn(className)}
        onClick={(e) => {
          context.selectItem(value)
          onClick?.(e)
        }}
        onMouseEnter={() => context.setHighlightedIndex(index)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MentionItem.displayName = 'MentionItem'

/* -------------------------------------------------------------------------------------------------
 * MentionItemText
 * -----------------------------------------------------------------------------------------------*/

interface MentionItemTextProps extends React.HTMLAttributes<HTMLSpanElement> {}

const MentionItemText = React.forwardRef<HTMLSpanElement, MentionItemTextProps>(
  ({ className, ...props }, ref) => {
    return <span ref={ref} className={cn(className)} {...props} />
  }
)
MentionItemText.displayName = 'MentionItemText'

/* -------------------------------------------------------------------------------------------------
 * MentionItemIndicator
 * -----------------------------------------------------------------------------------------------*/

interface MentionItemIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

const MentionItemIndicator = React.forwardRef<
  HTMLSpanElement,
  MentionItemIndicatorProps
>(({ className, ...props }, ref) => {
  return <span ref={ref} className={cn(className)} {...props} />
})
MentionItemIndicator.displayName = 'MentionItemIndicator'

export {
  Mention,
  MentionInput,
  MentionList,
  MentionItem,
  MentionItemText,
  MentionItemIndicator,
}
