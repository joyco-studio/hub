'use client'

import * as React from 'react'
import { ArrowUpIcon, Loader2Icon } from 'lucide-react'
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useUserInterruption } from '@/hooks/use-interruption'

type ChatMessageVariant = 'self' | 'peer' | 'system'

/* -------------------------------------------------------------------------------------------------
 * Chat Context
 * -------------------------------------------------------------------------------------------------*/

type ChatContextValue = {
  viewportRef: React.RefObject<HTMLDivElement | null>
  scrollToBottom: (behavior?: ScrollBehavior) => void
  onSubmit?: (message: string) => void
  onViewportHeightChange: (height: number) => void
  onInputHeightChange: (height: number) => void
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
  onSubmit?: (message: string) => void
  bottomThreshold?: number
  children: React.ReactNode
}

export function Chat({ onSubmit, bottomThreshold = 24, children }: ChatProps) {
  const [isAtBottom, setIsAtBottom] = React.useState(true)
  const { interruptedRef, interrupt } = useUserInterruption(200)
  const viewportRef = React.useRef<HTMLDivElement>(null)

  const isAtBottomRef = React.useRef(true)
  const isScrollingToBottomRef = React.useRef(false)
  const prevViewportHeightRef = React.useRef(0)
  const prevInputHeightRef = React.useRef(0)

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

    return () => {
      viewport.removeEventListener('scroll', handleScroll)
      viewport.removeEventListener('wheel', handleUserInterrupt)
      viewport.removeEventListener('touchstart', handleUserInterrupt)
    }
  }, [bottomThreshold, interrupt, checkIfAtBottom])

  const onViewportHeightChange = React.useCallback(
    (height: number) => {
      if (!isAtBottomRef.current) return

      const viewportHeightChange = height - prevViewportHeightRef.current

      if (viewportHeightChange > 0) {
        scrollToBottom()
      }

      prevViewportHeightRef.current = height
    },
    [scrollToBottom]
  )

  const onInputHeightChange = React.useCallback(
    (height: number) => {
      if (!isAtBottomRef.current) return

      const inputHeightChange = height - prevInputHeightRef.current

      if (inputHeightChange > 0) {
        scrollToBottom()
      }

      prevInputHeightRef.current = height
    },
    [scrollToBottom]
  )

  const contextValue = React.useMemo<ChatContextValue>(
    () => ({
      viewportRef,
      scrollToBottom,
      onSubmit,
      onViewportHeightChange,
      onInputHeightChange,
    }),
    [scrollToBottom, onSubmit, onViewportHeightChange, onInputHeightChange]
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
        'bg-muted/40 border-border flex flex-col overflow-y-auto rounded-xl border px-4',
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
        'group/message-row my-4 grid items-center',
        variant === 'self'
          ? 'grid-cols-[minmax(0,1fr)_auto] justify-items-end [grid-template-areas:"message_avatar""addon_none"]'
          : 'grid-cols-[auto_minmax(0,1fr)] justify-items-start [grid-template-areas:"avatar_message""none_addon"]',
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * ChatMessageAvatar
 * -------------------------------------------------------------------------------------------------*/

type ChatMessageAvatarProps = React.ComponentProps<typeof Avatar> & {
  src?: string
  alt?: string
  fallback?: React.ReactNode
}

export function ChatMessageAvatar({
  className,
  src,
  alt,
  fallback,
  children,
  ...props
}: ChatMessageAvatarProps) {
  return (
    <Avatar
      className={cn(
        'size-8 shrink-0 self-end [grid-area:avatar] group-not-data-[variant=self]/message-row:mr-2 group-data-[variant=self]/message-row:ml-2',
        className
      )}
      title={alt}
      {...props}
    >
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback>{fallback ?? children}</AvatarFallback>
    </Avatar>
  )
}

/* -------------------------------------------------------------------------------------------------
 * ChatMessageBubble
 * -------------------------------------------------------------------------------------------------*/

type ChatMessageBubbleProps = React.ComponentProps<'div'>

export function ChatMessageBubble({
  className,
  ...props
}: ChatMessageBubbleProps) {
  return (
    <div
      className={cn(
        'w-fit max-w-96 min-w-0 rounded-2xl text-sm wrap-break-word whitespace-pre-wrap [grid-area:message] group-not-data-[variant=system]/message-row:px-4 group-not-data-[variant=system]/message-row:py-2',
        /* Self */
        'group-data-[variant=self]/message-row:bg-primary group-data-[variant=self]/message-row:text-primary-foreground',
        /* Peer */
        'group-data-[variant=peer]/message-row:bg-muted group-data-[variant=peer]/message-row:text-foreground',
        /* System */
        'group-data-[variant=system]/message-row:text-muted-foreground group-data-[variant=system]/message-row:px-1',
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
  dateTime,
  children,
  ...props
}: Omit<React.ComponentProps<'time'>, 'dateTime'> & { dateTime: Date }) {
  return (
    <time
      className={cn(
        'text-muted-foreground mt-2 text-xs [grid-area:addon]',
        className
      )}
      dateTime={dateTime.toISOString()}
      {...props}
    >
      {children ??
        dateTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
    </time>
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
  const {
    onSubmit: onSubmitContext,
    scrollToBottom,
    onInputHeightChange,
  } = useChatContext()
  const [inputRef, { height }] = useMeasure()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const message = formData.get('message')?.toString()

    if (!message) return

    onSubmitContext?.(message)

    React.startTransition(() => {
      scrollToBottom('smooth')
    })
  }

  React.useEffect(() => {
    onInputHeightChange(height)
  }, [height, onInputHeightChange])

  return (
    <form className="contents" onSubmit={handleSubmit} {...props}>
      <InputGroup
        className={cn('h-auto items-end rounded-3xl', className)}
        ref={inputRef}
      >
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

  return <InputGroupTextarea name="message" ref={textareaRef} {...props} />
}

function ChatSinglelineInput({
  ...props
}: React.ComponentProps<typeof InputGroupInput>) {
  return <InputGroupInput name="message" {...props} />
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
  loading,
  disabled,
  ...props
}: React.ComponentProps<typeof InputGroupButton> & { loading?: boolean }) {
  return (
    <InputGroupAddon align="inline-end" className={className}>
      <InputGroupButton
        variant="default"
        type="submit"
        className="rounded-full"
        size="icon-sm"
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2Icon className="animate-spin" /> : <ArrowUpIcon />}
        <span className="sr-only">Send</span>
      </InputGroupButton>
    </InputGroupAddon>
  )
}
