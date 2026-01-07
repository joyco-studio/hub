'use client'

import * as React from 'react'

import { CopyButton } from '@/components/copy-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export type CommandTab = {
  label: string
  content: string
}

type CodeBlockCommandProps = {
  tabs: CommandTab[]
  defaultTab?: string
  activeTab?: string
  onTabChange?: (tab: string) => void
  className?: string
}

export function CodeBlockCommand({
  tabs,
  defaultTab,
  activeTab,
  onTabChange,
  className,
}: CodeBlockCommandProps) {
  const [internalTab, setInternalTab] = React.useState(
    () => defaultTab ?? tabs[0]?.label ?? ''
  )

  const currentTab = activeTab ?? internalTab
  const currentContent =
    tabs.find((tab) => tab.label === currentTab)?.content ?? ''

  const handleTabChange = (value: string) => {
    if (!activeTab) {
      setInternalTab(value)
    }
    onTabChange?.(value)
  }

  if (tabs.length === 0) return null

  return (
    <div
      data-slot="command-block"
      className={cn(
        'not-prose bg-background relative flex flex-col overflow-hidden',
        className
      )}
    >
      <Tabs
        className="grid gap-y-1"
        value={currentTab}
        onValueChange={handleTabChange}
      >
        {/* Header row with tabs and copy button */}
        <div className="flex gap-1">
          <TabsList className="bg-transparent">
            {tabs.map((tab) => (
              <TabsTrigger
                className="data-[state=active]:bg-accent hover:bg-muted/50"
                key={tab.label}
                value={tab.label}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {/* Flex filler */}
          <div className="bg-muted flex-1 self-stretch" />
          {/* Copy button */}
          {currentContent && (
            <CopyButton
              value={currentContent}
              variant="ghost"
              absolute={false}
              forceVisible
              className="bg-muted size-9 opacity-100"
            />
          )}
        </div>

        {/* Command content */}
        <div className="bg-code !scrollbar-none relative overflow-x-auto overscroll-x-none overscroll-y-none">
          {tabs.map((tab) => (
            <TabsContent
              key={tab.label}
              value={tab.label}
              className="no-scrollbar bg-accent/80 mt-0"
            >
              <pre className="m-0">
                <code
                  className="text-code-foreground no-scrollbar block w-fit px-4 py-3 font-mono text-sm"
                  data-language="bash"
                >
                  {tab.content}
                </code>
              </pre>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )
}
