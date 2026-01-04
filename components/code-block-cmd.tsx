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
      className={cn('not-prose bg-card overflow-x-auto rounded-lg', className)}
    >
      <Tabs
        value={currentTab}
        className="gap-0"
        onValueChange={handleTabChange}
      >
        <div
          data-slot="command-header"
          className="border-border flex items-center gap-2 border-b px-3 py-2"
        >
          <TabsList
            data-slot="command-tabs"
            className="h-auto rounded-none bg-transparent p-0"
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.label}
                value={tab.label}
                className="data-[state=active]:bg-accent data-[state=active]:border-border h-7 border border-transparent pt-0.5 data-[state=active]:shadow-none"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div
          data-slot="command-content"
          className="no-scrollbar overflow-x-auto bg-white dark:bg-black"
        >
          {tabs.map((tab) => (
            <TabsContent
              key={tab.label}
              value={tab.label}
              className="mt-0 w-max px-4 py-3.5"
            >
              <pre>
                <code
                  className="relative font-mono text-sm leading-none text-green-500 dark:text-green-300"
                  data-language="bash"
                >
                  {tab.content}
                </code>
              </pre>
            </TabsContent>
          ))}
        </div>
      </Tabs>
      {currentContent && (
        <CopyButton value={currentContent} className="top-2" forceVisible />
      )}
    </div>
  )
}
