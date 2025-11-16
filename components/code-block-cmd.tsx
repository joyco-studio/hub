"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

import { useConfig } from "@/hooks/use-config"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export function CodeBlockCommand({
  __npm__,
  __yarn__,
  __pnpm__,
  __bun__,
}: React.ComponentProps<"pre"> & {
  __npm__?: string
  __yarn__?: string
  __pnpm__?: string
  __bun__?: string
}) {
  const [config, setConfig] = useConfig()
  const [hasCopied, setHasCopied] = React.useState(false)

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [hasCopied])

  const packageManager = config.packageManager || "pnpm"
  const tabs = React.useMemo(() => {
    return {
      pnpm: __pnpm__,
      npm: __npm__,
      yarn: __yarn__,
      bun: __bun__,
    }
  }, [__npm__, __pnpm__, __yarn__, __bun__])

  const copyCommand = React.useCallback(() => {
    const command = tabs[packageManager]

    if (!command) {
      return
    }

    navigator.clipboard.writeText(command)
    setHasCopied(true)
  }, [packageManager, tabs])

  return (
    <div className="not-prose overflow-x-auto bg-fd-card rounded-lg border border-fd-border">
      <Tabs
        value={packageManager}
        className="gap-0"
        onValueChange={(value) => {
          setConfig({
            ...config,
            packageManager: value as "pnpm" | "npm" | "yarn" | "bun",
          })
        }}
      >
        <div className="border-fd-border flex items-center gap-2 border-b px-3 py-1">
          <TabsList className="rounded-none bg-transparent p-0">
            {Object.entries(tabs).map(([key]) => {
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="data-[state=active]:bg-fd-accent data-[state=active]:border-fd-border h-7 border border-transparent pt-0.5 data-[state=active]:shadow-none"
                >
                  {key}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>
        <div className="no-scrollbar overflow-x-auto">
          {Object.entries(tabs).map(([key, value]) => {
            return (
              <TabsContent key={key} value={key} className="mt-0 px-4 py-3.5">
                <pre>
                  <code
                    className="relative font-mono text-sm leading-none text-green-300"
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
      <Button
          data-slot="copy-button"
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 z-10 size-7 opacity-70 hover:opacity-100 focus-visible:opacity-100"
          onClick={copyCommand}
        >
          {hasCopied ? "Copied!" : "Copy"}
        </Button>
    </div>
  )
}