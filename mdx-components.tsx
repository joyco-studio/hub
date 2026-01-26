import * as React from 'react'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { CodeTabs } from '@/components/code-tabs'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from './lib/utils'
import { FileCodeblock } from './components/code-source'
import { CopyButton } from './components/copy-button'
import { codeClasses } from './lib/shiki'
import Image from 'next/image'
import { ImageCols } from '@/components/image-cols'
import { PackageManagerCommand } from './components/package-manager-command'
import { AgentsScriptCommand } from './components/agents-script-command'

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    CodeTabs: CodeTabs,
    FileCodeblock: FileCodeblock,
    Image: ({
      className,
      alt,
      ...props
    }: React.ComponentProps<typeof Image>) => (
      <Image className={cn('rounded-lg', className)} alt={alt} {...props} />
    ),
    ImageCols: ({
      className,
      ...props
    }: React.ComponentProps<typeof ImageCols>) => (
      <ImageCols className={className} {...props} />
    ),
    Figure: ({
      src,
      alt,
      caption,
      className,
      ...props
    }: {
      src: string
      alt: string
      caption?: string
    } & Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>) => (
      <figure className={cn('my-6', className)}>
        <Image src={src} alt={alt} className="rounded-lg" {...props} />
        {(caption || alt) && (
          <figcaption className="text-muted-foreground mt-2 text-center text-sm">
            {caption || alt}
          </figcaption>
        )}
      </figure>
    ),
    Tabs: ({ className, ...props }: React.ComponentProps<typeof Tabs>) => {
      return <Tabs className={cn('relative w-full', className)} {...props} />
    },
    TabsList: ({
      className,
      ...props
    }: React.ComponentProps<typeof TabsList>) => (
      <TabsList
        className={cn(
          'justify-start gap-4 rounded-none bg-transparent px-0',
          className
        )}
        {...props}
      />
    ),
    TabsTrigger: ({
      className,
      ...props
    }: React.ComponentProps<typeof TabsTrigger>) => (
      <TabsTrigger
        className={cn(
          'text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-primary dark:data-[state=active]:border-primary hover:text-primary rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 text-base data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent',
          className
        )}
        {...props}
      />
    ),
    TabsContent: ({
      className,
      ...props
    }: React.ComponentProps<typeof TabsContent>) => (
      <TabsContent
        className={cn(
          'relative [&_h3.font-heading]:text-base [&_h3.font-heading]:font-medium *:[figure]:first:mt-0',
          className
        )}
        {...props}
      />
    ),
    Tab: ({ className, ...props }: React.ComponentProps<'div'>) => (
      <div className={cn(className)} {...props} />
    ),
    code: ({
      className,
      __npm__,
      __yarn__,
      __pnpm__,
      __bun__,
      __cursor__,
      __codex__,
      __claude__,
      ...props
    }: React.ComponentProps<'code'> & {
      __raw__?: string
      __src__?: string
      __npm__?: string
      __yarn__?: string
      __pnpm__?: string
      __bun__?: string
      __cursor__?: string
      __codex__?: string
      __claude__?: string
    }) => {
      // Inline Code.
      if (typeof props.children === 'string') {
        return (
          <code
            className={cn(
              'bg-muted relative rounded-md px-[0.3rem] py-[0.2rem] font-mono text-[0.8rem] wrap-break-word outline-none',
              className
            )}
            {...props}
          />
        )
      }

      // Agents script command.
      const isAgentsCommand = __cursor__ && __codex__ && __claude__
      if (isAgentsCommand) {
        return (
          <AgentsScriptCommand
            cursor={__cursor__}
            codex={__codex__}
            claude={__claude__}
          />
        )
      }

      // Package manager command.
      const isPackageManagerCommand = __npm__ && __yarn__ && __pnpm__ && __bun__
      if (isPackageManagerCommand) {
        return (
          <PackageManagerCommand
            npm={__npm__}
            yarn={__yarn__}
            pnpm={__pnpm__}
            bun={__bun__}
          />
        )
      }

      return <code className="not-prose" {...props} />
    },
    figure: ({ className, ...props }: React.ComponentProps<'figure'>) => {
      return <figure className={cn(className)} {...props} />
    },
    pre: ({
      className,
      __raw__,
      children,
      ...props
    }: React.ComponentProps<'pre'> & {
      __raw__?: string
      children: React.ReactNode
    }) => {
      return (
        <div className={cn("group/code relative", className)}>
          {__raw__ && <CopyButton value={__raw__} />}
          <pre className={codeClasses.pre} {...props}>
            {children}
          </pre>
        </div>
      )
    },
    ...components,
  }
}
