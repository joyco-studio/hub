import CubeIcon from '@/components/icons/3d-cube'
import FileIcon from '@/components/icons/file'
import GridIcon from '@/components/icons/grid'
import TerminalWithCursorIcon from '@/components/icons/terminal-w-cursor'
import { SVGProps } from 'react'

export type SitemapItem = {
  label: string
  href: string
  icon: React.ComponentType<SVGProps<SVGSVGElement>>
}

export const sitemap: SitemapItem[] = [
  {
    label: 'Components',
    href: '/components',
    icon: CubeIcon,
  },
  {
    label: 'Toolbox',
    href: '/toolbox',
    icon: TerminalWithCursorIcon,
  },
  {
    label: 'Logs',
    href: '/logs',
    icon: FileIcon,
  },
]
