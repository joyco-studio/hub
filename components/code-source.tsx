import * as fs from 'fs/promises'
import * as path from 'path'
import {
  highlightCode,
  getLanguageFromExtension,
  stripFrontmatter,
} from '@/lib/shiki'
import { CodeBlock } from '@/components/code-block'

export async function FileCodeblock({
  filePath,
  title,
  language,
  ...rest
}: {
  filePath: string
} & Omit<
  React.ComponentProps<typeof CodeBlock>,
  'rawCode' | 'highlightedCode'
>) {
  let content: string
  const publicPath = path.join(process.cwd(), filePath)
  const fileName = path.basename(filePath)
  const isGuideline = filePath.includes('/public/guidelines')

  try {
    content = await fs.readFile(publicPath, 'utf-8')

    if (isGuideline) {
      content = stripFrontmatter(content)
    }
  } catch {
    return (
      <div className="text-destructive rounded-lg border border-red-500/20 bg-red-500/10 p-4">
        Failed to read file: {filePath}
      </div>
    )
  }

  const ext = path.extname(fileName).slice(1)
  const lang = language || getLanguageFromExtension(ext)
  const highlightedCode = await highlightCode(content, lang)
  const displayTitle = title ?? fileName

  return (
    <CodeBlock
      rawCode={content}
      language={lang}
      highlightedCode={highlightedCode}
      title={displayTitle}
      {...rest}
    />
  )
}
