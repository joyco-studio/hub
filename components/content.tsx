import { Markdown } from 'fumadocs-core/content'
import { getMDXComponents } from '@/mdx-components'
import { rehypePlugins, remarkPlugins } from '@/lib/mdx'

export function MDXContent({ content }: { content: string }) {
  return (
    <Markdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={getMDXComponents()}
    >
      {content}
    </Markdown>
  )
}
