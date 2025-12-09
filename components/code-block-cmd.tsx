'use client'

import * as React from 'react'

import { CopyButton } from '@/components/copy-button'
import { useConfig } from '@/hooks/use-config'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function CodeBlockCommand({
  __npm__,
  __yarn__,
  __pnpm__,
  __bun__,
}: React.ComponentProps<'pre'> & {
  __npm__?: string
  __yarn__?: string
  __pnpm__?: string
  __bun__?: string
}) {
  const [config, setConfig] = useConfig()

  const packageManager = config.packageManager || 'pnpm'
  const tabs = React.useMemo(() => {
    return {
      pnpm: __pnpm__,
      npm: __npm__,
      yarn: __yarn__,
      bun: __bun__,
    }
  }, [__npm__, __pnpm__, __yarn__, __bun__])

  const command = tabs[packageManager]

  return (
    <div data-slot="command-block" className="not-prose bg-card overflow-x-auto rounded-lg">
      <Tabs
        value={packageManager}
        className="gap-0"
        onValueChange={(value) => {
          setConfig({
            ...config,
            packageManager: value as 'pnpm' | 'npm' | 'yarn' | 'bun',
          })
        }}
      >
        <div className="border-border flex items-center gap-2 border-b px-3 py-2">
          <TabsList className="rounded-none bg-transparent p-0 h-auto">
            {Object.entries(tabs).map(([key]) => {
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="data-[state=active]:bg-accent data-[state=active]:border-border h-7 border border-transparent pt-0.5 data-[state=active]:shadow-none"
                >
                  {key}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>
        <div className="no-scrollbar overflow-x-auto bg-white dark:bg-black">
          {Object.entries(tabs).map(([key, value]) => {
            return (
              <TabsContent key={key} value={key} className="mt-0 px-4 py-3.5">
                <pre>
                  <code
                    className="relative font-mono text-sm leading-none text-green-500 dark:text-green-300"
                    data-language="bash"
                  >
                    {value}
                  </code>
                </pre>
              </TabsContent>
            )
          })}
        </div>
      </Tabs>
      {command && (
        <CopyButton
          value={command}
          className="top-2"
          forceVisible
        />
      )}
    </div>
  )
}
