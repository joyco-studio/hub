'use client'

import * as React from 'react'
import { ArrowUpIcon } from 'lucide-react'
import debounce from 'debounce'
import useMeasure from 'react-use-measure'

import { cn } from '@/lib/utils'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { useUserInterruption } from '@/hooks/use-interruption'

type ChatMessageVariant = 'self' | 'peer' | 'system'

/* -------------------------------------------------------------------------------------------------
 * Chat Context
 * -------------------------------------------------------------------------------------------------*/

type ChatContextValue = {
  viewportRef: React.RefObject<HTMLDivElement | null>
  scrollToBottom: (behavior?: ScrollBehavior) => void
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  onViewportHeightChange: (height: number) => void
}

const ChatContext = React.createContext<ChatContextValue | null>(null)

function useChatContext() {
  const context = React.useContext(ChatContext)
  if (!context) {
    throw new Error('Chat components must be used within a <Chat /> component')
  }
  return context
}

/* -------------------------------------------------------------------------------------------------
 * Chat
 * -------------------------------------------------------------------------------------------------*/

type ChatProps = {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  bottomThreshold?: number
  children: React.ReactNode
}

export function Chat({ onSubmit, bottomThreshold = 24, children }: ChatProps) {
  const [isAtBottom, setIsAtBottom] = React.useState(true)
  const { interruptedRef, interrupt } = useUserInterruption(200)
  const viewportRef = React.useRef<HTMLDivElement>(null)

  const isAtBottomRef = React.useRef(true)
  const isScrollingToBottomRef = React.useRef(false)
  const prevMessageContainerHeightRef = React.useRef(0)

  React.useEffect(() => {
    isAtBottomRef.current = isAtBottom
  }, [isAtBottom])

  const scrollToBottom = React.useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      const viewport = viewportRef.current

      if (!viewport || interruptedRef.current) return

      isScrollingToBottomRef.current = true

      viewport.scrollTo({ top: viewport.scrollHeight, behavior })
    },
    [interruptedRef]
  )

  const checkIfAtBottom = React.useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return false

    const { scrollTop, scrollHeight, clientHeight } = viewport
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    return distanceFromBottom <= bottomThreshold
  }, [bottomThreshold])

  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const handleScroll = debounce(() => {
      const actuallyAtBottom = checkIfAtBottom()

      if (isScrollingToBottomRef.current) {
        if (actuallyAtBottom) {
          isScrollingToBottomRef.current = false
        }
        setIsAtBottom(true)
        return
      }

      setIsAtBottom(actuallyAtBottom)
    }, 100)

    const handleUserInterrupt = () => {
      if (isScrollingToBottomRef.current) {
        isScrollingToBottomRef.current = false
        setIsAtBottom(checkIfAtBottom())
      }
      interrupt()
    }

    viewport.addEventListener('scroll', handleScroll)
    viewport.addEventListener('wheel', handleUserInterrupt, { passive: true })
    viewport.addEventListener('touchstart', handleUserInterrupt, {
      passive: true,
    })
  }, [bottomThreshold, interrupt, checkIfAtBottom])

  const onViewportHeightChange = React.useCallback(
    (height: number) => {
      if (!isAtBottomRef.current) return

      const currentMessageContainerHeight = height || 0

      const messageContainerHeightChange = Math.abs(
        currentMessageContainerHeight - prevMessageContainerHeightRef.current
      )

      if (messageContainerHeightChange > 0) {
        scrollToBottom()
      }

      prevMessageContainerHeightRef.current = currentMessageContainerHeight
    },
    [scrollToBottom]
  )

  const contextValue = React.useMemo<ChatContextValue>(
    () => ({
      viewportRef,
      scrollToBottom,
      onSubmit,
      onViewportHeightChange,
    }),
    [scrollToBottom, onSubmit, onViewportHeightChange]
  )

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  )
}

export { useChatContext }

/* -------------------------------------------------------------------------------------------------
 * ChatViewport
 * -------------------------------------------------------------------------------------------------*/

export function ChatViewport({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { viewportRef, scrollToBottom } = useChatContext()

  React.useLayoutEffect(() => {
    scrollToBottom('instant')
  }, [scrollToBottom])

  return (
    <div
      ref={viewportRef}
      className={cn(
        'bg-muted/40 border-border flex overflow-y-auto rounded-lg border px-4',
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * ChatMessages
 * -------------------------------------------------------------------------------------------------*/

export function ChatMessages({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { onViewportHeightChange } = useChatContext()

  const [ref, { height }] = useMeasure()

  React.useEffect(() => {
    onViewportHeightChange(height)
  }, [height, onViewportHeightChange])

  return <div ref={ref} className={cn('h-max', className)} {...props} />
}

/* -------------------------------------------------------------------------------------------------
 * ChatMessage
 * -------------------------------------------------------------------------------------------------*/

type ChatMessageProps = React.ComponentProps<'div'> & {
  variant?: ChatMessageVariant
}

export function ChatMessageRow({
  className,
  variant = 'self',
  ...props
}: ChatMessageProps) {
  return (
    <div
      data-variant={variant}
      className={cn(
        'my-3 flex flex-col gap-1',
        variant === 'self' ? 'justify-end text-right items-end' : 'justify-start items-start',
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * ChatMessageBubble
 * -------------------------------------------------------------------------------------------------*/

type ChatMessageBubbleProps = React.ComponentProps<'div'> & {
  variant?: ChatMessageVariant
}

export function ChatMessageBubble({
  className,
  variant = 'self',
  ...props
}: ChatMessageBubbleProps) {
  return (
    <div
      data-variant={variant}
      className={cn(
        'w-max max-w-[80%] rounded-2xl px-4 py-2 text-sm wrap-break-word whitespace-pre-wrap',
        variant === 'self'
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-foreground',
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * ChatMessageTime
 * -------------------------------------------------------------------------------------------------*/

export function ChatMessageTime({
  className,
  ...props
}: React.ComponentProps<'time'>) {
  return (
    <time
      className={cn('text-muted-foreground text-xs', className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * ChatInputArea
 * -------------------------------------------------------------------------------------------------*/

type ChatInputAreaProps = Omit<
  React.ComponentProps<'form'>,
  'children' | 'onSubmit'
> &
  Pick<React.ComponentProps<typeof InputGroup>, 'children'>

export function ChatInputArea({
  className,
  children,
  ...props
}: ChatInputAreaProps) {
  const { onSubmit: onSubmitContext, scrollToBottom } = useChatContext()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmitContext?.(e)
    // Defer scroll until after React re-renders with the new message
    requestAnimationFrame(() => {
      scrollToBottom('smooth')
    })
  }

  return (
    <form className="contents" onSubmit={handleSubmit} {...props}>
      <InputGroup className={cn('h-auto items-end rounded-3xl', className)}>
        {children}
      </InputGroup>
    </form>
  )
}

function ChatMultilineInput({
  ...props
}: React.ComponentProps<typeof InputGroupTextarea>) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const scrollToBottom = () => {
      textarea.scrollTop = textarea.scrollHeight
    }

    textarea.addEventListener('input', scrollToBottom)

    return () => {
      textarea.removeEventListener('input', scrollToBottom)
    }
  }, [])

  return <InputGroupTextarea ref={textareaRef} {...props} />
}

function ChatSinglelineInput({
  ...props
}: React.ComponentProps<typeof InputGroupInput>) {
  return <InputGroupInput {...props} />
}

type TextareaProps = Omit<
  React.ComponentProps<typeof InputGroupTextarea>,
  'multiline'
>
type InputProps = Omit<
  React.ComponentProps<typeof InputGroupInput>,
  'multiline'
>

type ChatInputProps = { multiline: boolean } & (TextareaProps | InputProps)

export function ChatInputField({
  className,
  multiline,
  ...rest
}: ChatInputProps) {
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.currentTarget.form?.requestSubmit()
    }
  }

  if (multiline) {
    return (
      <ChatMultilineInput
        className={cn(
          'field-sizing-content max-h-32 min-h-[1em] pl-6 text-base',
          className
        )}
        onKeyDown={handleKeyDown}
        {...(rest as TextareaProps)}
      />
    )
  }

  return (
    <ChatSinglelineInput
      className={cn('h-auto min-h-[1em] py-3 pl-6 text-base', className)}
      onKeyDown={handleKeyDown}
      {...(rest as InputProps)}
    />
  )
}

export function ChatInputSubmit({
  className,
  ...props
}: React.ComponentProps<typeof InputGroupButton>) {
  return (
    <InputGroupAddon align="inline-end" className={className}>
      <InputGroupButton
        variant="default"
        type="submit"
        className="rounded-full"
        size="icon-sm"
        {...props}
      >
        <ArrowUpIcon />
        <span className="sr-only">Send</span>
      </InputGroupButton>
    </InputGroupAddon>
  )
}
