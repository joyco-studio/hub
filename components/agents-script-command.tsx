'use client'

import * as React from 'react'

import { CodeBlockCommand, type CommandTab } from '@/components/code-block-cmd'
import { useConfig } from '@/hooks/use-config'

type AgentsScriptCommandProps = {
  cursor?: string
  codex?: string
  claude?: string
}

export function AgentsScriptCommand({
  cursor,
  codex,
  claude,
}: AgentsScriptCommandProps) {
  const [config, setConfig] = useConfig()

  const tabs = React.useMemo(() => {
    const result: CommandTab[] = []
    if (cursor) result.push({ label: 'cursor', content: cursor })
    if (codex) result.push({ label: 'codex', content: codex })
    if (claude) result.push({ label: 'claude', content: claude })
    return result
  }, [cursor, codex, claude])

  const handleTabChange = (tab: string) => {
    setConfig({
      ...config,
      agentsTarget: tab as 'cursor' | 'codex' | 'claude',
    })
  }

  return (
    <CodeBlockCommand
      tabs={tabs}
      activeTab={config.agentsTarget}
      onTabChange={handleTabChange}
    />
  )
}

