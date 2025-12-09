import * as React from 'react'
import { BundledLanguage } from 'shiki'
import { getRegistryExampleComponentFile } from '@/lib/registry-examples'
import { CodeBlock } from '../code-block'
import { highlightCode } from '@/lib/shiki'

export async function ComponentSource({
  name,
  title,
  language = 'tsx',
  maxHeight = 400,
}: React.ComponentProps<'div'> & {
  name?: string
  maxHeight?: number
  title?: string
  language: BundledLanguage
}) {
  if (!name) {
    return null
  }

  let code: string | undefined

  if (name) {
    const files = await getRegistryExampleComponentFile(name)
    code = files?.[0]?.content
  }

  if (!code) {
    return null
  }

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
