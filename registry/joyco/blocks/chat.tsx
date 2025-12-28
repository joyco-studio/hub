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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useUserInterruption } from '@/hooks/use-interruption'
import { useComposedRefs } from '@/lib/compose-refs'

type ChatMessageVariant = 'self' | 'peer' | 'system'

/* -------------------------------------------------------------------------------------------------
 * ChatSubmitEvent
 * -------------------------------------------------------------------------------------------------*/

export class ChatSubmitEvent {
  readonly form: HTMLFormElement
  readonly input: HTMLInputElement | HTMLTextAreaElement | null
  readonly message: string
  defaultPrevented = false

  constructor(data: {
    form: HTMLFormElement
    input: HTMLInputElement | HTMLTextAreaElement | null
    message: string
  }) {
    this.form = data.form
    this.input = data.input
    this.message = data.message
  }

  preventDefault() {
    this.defaultPrevented = true
  }
}

/* -------------------------------------------------------------------------------------------------
 * Chat Context
 * -------------------------------------------------------------------------------------------------*/

type ChatContextValue = {
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
  viewportRef: React.RefObject<HTMLDivElement | null>
  scrollToBottom: (behavior?: ScrollBehavior) => void
  onSubmit?: (event: ChatSubmitEvent) => void
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
  onSubmit?: (event: ChatSubmitEvent) => void
  bottomThreshold?: number
  children: React.ReactNode
}

export function Chat({ onSubmit, bottomThreshold = 24, children }: ChatProps) {
  const [isAtBottom, setIsAtBottom] = React.useState(true)
  const { interruptedRef, interrupt } = useUserInterruption(200)
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null)

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
      inputRef,
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
        'bg-card border-border flex flex-col overflow-y-auto rounded-xl border px-4',
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
          ? 'grid-cols-[1fr_auto_auto] justify-items-end [grid-template-areas:"addon-inline_message_avatar""addon-block_addon-block_none"]'
          : 'grid-cols-[auto_auto_1fr] justify-items-start [grid-template-areas:"avatar_message_addon-inline""none_addon-block_addon-block"]',
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
        'w-fit max-w-96 min-w-0 rounded-xl text-sm wrap-break-word whitespace-pre-wrap [grid-area:message] group-not-data-[variant=system]/message-row:px-4 group-not-data-[variant=system]/message-row:py-2',
        /* Self */
        'group-data-[variant=self]/message-row:bg-primary group-data-[variant=self]/message-row:text-primary-foreground',
        /* Peer */
        'group-data-[variant=peer]/message-row:bg-primary/10 group-data-[variant=peer]/message-row:text-foreground',
        /* System */
        'group-data-[variant=system]/message-row:text-muted-foreground group-data-[variant=system]/message-row:px-1',
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * ChatMessageAddon
 * -------------------------------------------------------------------------------------------------*/
type ChatMessageAddonProps = React.ComponentProps<'div'> & {
  align?: 'inline' | 'block'
}

export function ChatMessageAddon({
  className,
  align = 'block',
  ...props
}: ChatMessageAddonProps) {
  return (
    <div
      data-slot="chat-message-addon"
      data-align={align}
      className={cn(
        'flex items-center gap-2',
        align === 'inline'
          ? '[grid-area:addon-inline] group-not-data-[variant=self]/message-row:ml-2 group-data-[variant=self]/message-row:mr-2'
          : 'mt-2 [grid-area:addon-block]',
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
        'text-muted-foreground text-xs',
        /* Only place it at addon-block position if it's not being wrapped by an addon already */
        '[&:not([data-slot="chat-message-addon"]_*)]:mt-2 [&:not([data-slot="chat-message-addon"]_*)]:[grid-area:addon-block]',
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
    inputRef,
    scrollToBottom,
    onInputHeightChange,
  } = useChatContext()
  const [areaRef, { height }] = useMeasure()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.currentTarget
    const input = inputRef.current
    const message = input?.value.trim()

    console.log('message', message)
    console.log('input', input)
    console.log('form', form)

    if (!message || !input) return

    const event = new ChatSubmitEvent({
      form,
      input,
      message,
    })

    onSubmitContext?.(event)

    if (!event.defaultPrevented) {
      form.reset()
    }

    requestAnimationFrame(() => {
      scrollToBottom('smooth')
    })
  }

  React.useEffect(() => {
    onInputHeightChange(height)
  }, [height, onInputHeightChange])

  return (
    <form className="contents" onSubmit={handleSubmit} {...props}>
      <InputGroup
        className={cn(
          'h-auto items-end rounded-3xl text-base leading-normal md:text-sm',
          '**:data-[slot=input-group-control]:py-3 **:data-[slot=input-group-control]:pl-6 **:data-[slot=input-group-control]:[font-size:inherit] **:data-[slot=input-group-control]:leading-[inherit]',
          '[--input-area-height:calc(--spacing(6)+var(--leading-normal)*1em)]',
          className
        )}
        ref={areaRef}
      >
        {children}
      </InputGroup>
    </form>
  )
}

function ChatMultilineInput({
  ref,
  ...props
}: React.ComponentProps<typeof InputGroupTextarea>) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const composedRef = useComposedRefs<HTMLTextAreaElement>(ref, textareaRef)

  React.useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const supportsFieldSizing = CSS.supports('field-sizing', 'content')

    const handleInput = () => {
      if (!supportsFieldSizing) {
        textarea.style.height = '0'
        textarea.style.height = `${textarea.scrollHeight}px`
      }

      textarea.scrollTop = textarea.scrollHeight
    }

    handleInput()

    textarea.addEventListener('input', handleInput)

    return () => {
      textarea.removeEventListener('input', handleInput)
    }
  }, [])

  return <InputGroupTextarea name="message" {...props} ref={composedRef} />
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

type ChatInputProps =
  | ({ multiline: true } & TextareaProps)
  | ({ multiline: false } & InputProps)

export function ChatInputField({ ref, ...rest }: ChatInputProps) {
  const { inputRef } = useChatContext()
  const composedRef = useComposedRefs<HTMLInputElement | HTMLTextAreaElement>(
    ref,
    inputRef
  )

  const submitOnEnter = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.defaultPrevented) {
      e.preventDefault()
      e.currentTarget.form?.requestSubmit()
    }
  }

  if (rest.multiline) {
    const { className, onKeyDown, multiline: _, ..._rest } = rest

    return (
      <>
        <style>{
          /* css */ `
            @layer utilities {
              .safe-field-sizing-content {
                height: 0;
              }

              @supports (field-sizing: content) {
                .safe-field-sizing-content {
                  field-sizing: content;
                  height: auto;
                }
              }
            }
          `
        }</style>
        <ChatMultilineInput
          className={cn(
            'safe-field-sizing-content max-h-32 min-h-(--input-area-height)',
            className
          )}
          onKeyDown={(e) => {
            onKeyDown?.(e)
            submitOnEnter(e)
          }}
          {..._rest}
          ref={composedRef}
        />
      </>
    )
  }

  const { className, onKeyDown, multiline: _, ..._rest } = rest

  return (
    <ChatSinglelineInput
      className={cn('h-(--input-area-height)', className)}
      onKeyDown={(e) => {
        onKeyDown?.(e)
        submitOnEnter(e)
      }}
      {..._rest}
      ref={composedRef}
    />
  )
}

export function ChatInputSubmit({
  className,
  disabled,
  children,
  ...props
}: React.ComponentProps<typeof InputGroupButton>) {
  return (
    <InputGroupAddon
      align="inline-end"
      className={cn('[font-size:inherit] **:[font-size:inherit]', className)}
    >
      <InputGroupButton
        variant="default"
        type="submit"
        className="size-[calc(var(--leading-normal)*1em+var(--spacing)*3)] rounded-full"
        size="icon-sm"
        disabled={disabled}
        {...props}
      >
        {children ?? (
          <>
            <ArrowUpIcon className="size-[1.2em]" />
            <span className="sr-only">Send</span>
          </>
        )}
      </InputGroupButton>
    </InputGroupAddon>
  )
}
