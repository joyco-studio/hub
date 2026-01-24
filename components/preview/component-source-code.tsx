import * as React from 'react'
import path from 'path'
import { getRegistryExampleComponentFile } from '@/lib/registry-examples'
import { CodeBlock } from '../code-block'
import { CodeBlockTabs, type CodeTab } from '../code-block-tabs'
import { highlightCode } from '@/lib/shiki'

function getLanguageFromPath(filePath: string): string {
  const ext = path.extname(filePath).slice(1)
  const languageMap: Record<string, string> = {
    ts: 'tsx',
    tsx: 'tsx',
    js: 'javascript',
    jsx: 'jsx',
  }
  return languageMap[ext] ?? 'tsx'
}

export async function ComponentSource({
  name,
  title,
  language = 'tsx',
  maxHeight = 400,
}: {
  name?: string
  maxHeight?: number
} & Omit<React.ComponentProps<typeof CodeBlock>, 'rawCode' | 'highlightedCode'>) {
  if (!name) {
    return null
  }

  const files = await getRegistryExampleComponentFile(name)

  if (!files || files.length === 0) {
    return null
  }

  // Single file: use the existing CodeBlock
  if (files.length === 1) {
    const code = files[0].content
    if (!code) return null

    const highlightedCode = await highlightCode(code, language)

    return (
      <CodeBlock
        highlightedCode={highlightedCode}
        language={language}
        title={title}
        rawCode={code}
        maxHeight={maxHeight}
      />
    )
  }

  // Multiple files: use CodeBlockTabs
  const tabs: CodeTab[] = await Promise.all(
    files.map(async (file) => {
      const filename = path.basename(file.path)
      const lang = getLanguageFromPath(file.path)
      const highlightedCode = await highlightCode(file.content, lang)

      return {
        filename,
        highlightedCode,
        rawCode: file.content,
      }
    })
  )

  return <CodeBlockTabs tabs={tabs} maxHeight={maxHeight} />
}
