import { source } from '@/lib/source'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { baseOptions } from '@/lib/layout.shared'
import { RegistrySidebar } from '@/components/layout/registry-sidebar'

// Optional: Define item metadata for badges/dots
const itemMeta: Record<
  string,
  { badge?: 'new' | 'updated'; dot?: 'red' | 'blue' | 'green' | 'yellow' }
> = {
  // Example:
  // '/components/scroll-area': { badge: 'new' },
  // '/components/infinite-list': { badge: 'updated' },
}

// Empty tree to prevent fumadocs from rendering its default sidebar tree
const emptyTree = { name: '', children: [] }

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-screen">
      {/* Custom sidebar - fully controlled */}
      <aside className="w-sidebar-width sticky top-0 hidden h-screen shrink-0 flex-col md:flex">
        <RegistrySidebar tree={source.pageTree} itemMeta={itemMeta} />
      </aside>

      {/* Main content area using DocsLayout for DocsPage context */}
      <DocsLayout
        {...baseOptions()}
        tree={emptyTree}
        sidebar={{ enabled: false }}
        nav={{ enabled: false }}
        containerProps={{ className: 'flex-1' }}
      >
        {children}
      </DocsLayout>
    </div>
  )
}
