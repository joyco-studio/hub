'use client'

import * as React from 'react'

import { CodeBlockCommand, type CommandTab } from '@/components/code-block-cmd'
import { useConfig } from '@/hooks/use-config'

type PackageManagerCommandProps = {
  npm?: string
  yarn?: string
  pnpm?: string
  bun?: string
}

export function PackageManagerCommand({
  npm,
  yarn,
  pnpm,
  bun,
}: PackageManagerCommandProps) {
  const [config, setConfig] = useConfig()

  const tabs = React.useMemo(() => {
    const result: CommandTab[] = []
    if (pnpm) result.push({ label: 'pnpm', content: pnpm })
    if (npm) result.push({ label: 'npm', content: npm })
    if (yarn) result.push({ label: 'yarn', content: yarn })
    if (bun) result.push({ label: 'bun', content: bun })
    return result
  }, [npm, yarn, pnpm, bun])

  const handleTabChange = (tab: string) => {
    setConfig({
      ...config,
      packageManager: tab as 'pnpm' | 'npm' | 'yarn' | 'bun',
    })
  }

  return (
    <CodeBlockCommand
      tabs={tabs}
      activeTab={config.packageManager}
      onTabChange={handleTabChange}
    />
  )
}

