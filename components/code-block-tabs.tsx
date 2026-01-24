'use client'

import * as React from 'react'

import { CopyButton } from '@/components/copy-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export type CodeTab = {
  filename: string
  highlightedCode: string
  rawCode: string
}

type CodeBlockTabsProps = {
  tabs: CodeTab[]
  defaultTab?: string
  maxHeight?: number
  className?: string
}

export function CodeBlockTabs({
  tabs,
  defaultTab,
  maxHeight = 400,
  className,
}: CodeBlockTabsProps) {
  const [currentTab, setCurrentTab] = React.useState(
    () => defaultTab ?? tabs[0]?.filename ?? ''
  )

  if (tabs.length === 0) return null

  return (
    <figure
      data-rehype-pretty-code-figure=""
      data-slot="code-block-tabs"
      className={cn('not-prose', className)}
    >
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <figcaption
          data-rehype-pretty-code-title=""
          className="flex items-center bg-muted gap-1"
        >
          <TabsList className="h-auto gap-0 rounded-none p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.filename}
                value={tab.filename}
                className="text-muted-foreground data-[state=active]:text-code-foreground rounded-none border-b-2 border-b-transparent px-3 py-1.5 text-xs data-[state=active]:border-b-current data-[state=active]:bg-code"
              >
                {tab.filename}
              </TabsTrigger>
            ))}
          </TabsList>
        </figcaption>

        {tabs.map((tab) => (
          <TabsContent key={tab.filename} value={tab.filename} className="mt-0">
            <div className="group/code relative">
              {tab.rawCode && <CopyButton value={tab.rawCode} />}
              <div
                style={
                  {
                    '--pre-max-height': maxHeight ? `${maxHeight}px` : 'unset',
                  } as React.CSSProperties
                }
                className={cn('[&>pre]:max-h-(--pre-max-height)')}
                dangerouslySetInnerHTML={{ __html: tab.highlightedCode }}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </figure>
  )
}
