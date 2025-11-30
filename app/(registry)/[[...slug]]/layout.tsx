import { source } from '@/lib/source'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { baseOptions } from '@/lib/layout.shared'

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <DocsLayout
      tree={source.pageTree}
      sidebar={{ defaultOpenLevel: 1 }}
      {...baseOptions()}
    >
      {children}
    </DocsLayout>
  )
}
