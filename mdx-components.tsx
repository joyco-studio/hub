import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { CodeTabs } from '@/components/code-tabs';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from './lib/utils';
import { CodeBlockCommand } from './components/code-block-cmd';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    CodeTabs: CodeTabs,
    pre: ({ className, ...props }: React.ComponentProps<'pre'>) => {
      return <pre className={cn("relative w-full", className)} {...props} />
    },
    Tabs: ({ className, ...props }: React.ComponentProps<typeof Tabs>) => {
      return <Tabs className={cn("relative w-full", className)} {...props} />
    },
    TabsList: ({
      className,
      ...props
    }: React.ComponentProps<typeof TabsList>) => (
      <TabsList
        className={cn(
          "justify-start gap-4 rounded-none bg-transparent px-0",
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
          "text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-primary dark:data-[state=active]:border-primary hover:text-primary rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 text-base data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent",
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
          "relative [&_h3.font-heading]:text-base [&_h3.font-heading]:font-medium *:[figure]:first:mt-0",
          className
        )}
        {...props}
      />
    ),
    Tab: ({ className, ...props }: React.ComponentProps<"div">) => (
      <div className={cn(className)} {...props} />
    ),
    code: ({
      className,
      __raw__,
      __src__,
      __npm__,
      __yarn__,
      __pnpm__,
      __bun__,
      ...props
    }: React.ComponentProps<"code"> & {
      __raw__?: string
      __src__?: string
      __npm__?: string
      __yarn__?: string
      __pnpm__?: string
      __bun__?: string
    }) => {
      // Inline Code.
      if (typeof props.children === "string") {
        return (
          <code
            className={cn(
              "bg-muted relative rounded-md px-[0.3rem] py-[0.2rem] font-mono text-[0.8rem] break-words outline-none",
              className
            )}
            {...props}
          />
        )
      }
  
      // npm command.
      const isNpmCommand = __npm__ && __yarn__ && __pnpm__ && __bun__
      if (isNpmCommand) {
        return (
          <CodeBlockCommand
            __npm__={__npm__}
            __yarn__={__yarn__}
            __pnpm__={__pnpm__}
            __bun__={__bun__}
          />
        )
      }
  
      // Default codeblock.
      return (
        <code className={cn("rounded-lg bg-fd-card p-3.5 border border-fd-border", className)} {...props} />
      )
    },
    ...components,
    
  };
}
