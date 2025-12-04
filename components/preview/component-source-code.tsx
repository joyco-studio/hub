import * as React from 'react'
import { BundledLanguage } from 'shiki'
import { getRegistryExampleComponentFile } from '@/lib/registry-examples'
import { ComponentCode } from './component-code'
import { highlightCode } from '@/lib/plugins'

export async function ComponentSource({
  name,
  title,
  language = 'tsx',
}: React.ComponentProps<'div'> & {
  name?: string

  title?: string
  language: BundledLanguage
}) {
  if (!name) {
    return null
  }

  let code: string | undefined

  // from the name we should remove all from <name><-demo...>.<file-extension>
  // we should remove all from -demo

  if (name) {
    const files = await getRegistryExampleComponentFile(name)
    code = files?.[0]?.content
  }

  if (!code) {
    return null
  }

  const highlightedCode = await highlightCode(code, language)

  return (
    <ComponentCode
      highlightedCode={highlightedCode}
      language={language}
      title={title}
    />
  )
}
