import * as fs from 'fs/promises'
import * as path from 'path'
import {
  highlightCode,
  getLanguageFromExtension,
  stripFrontmatter,
} from '@/lib/shiki'
import { CodeBlock } from '@/components/code-block'
import { DownloadFileButton } from './download-button'
import { Separator } from './ui/separator'

export async function FileCodeblock({
  filePath,
  title,
  language,
}: {
  filePath: string
  title?: string
  language?: string
}) {
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
    <div className="relative">
      <div className="absolute top-2 right-12 z-10 flex items-center gap-2">
        <DownloadFileButton value={content} fileName={displayTitle} />
        <Separator className="h-5!" orientation="vertical" />
      </div>

      <CodeBlock
        rawCode={content}
        language={lang}
        highlightedCode={highlightedCode}
        title={displayTitle}
      />
    </div>
  )
}
