import FileIcon from '@/components/icons/file'
import CubeIcon from '@/components/icons/3d-cube'
import { TerminalWithCursorIcon } from '@/components/icons'

export type ItemType = 'component' | 'toolbox' | 'log'

export const itemTypeConfig: Record<
  ItemType,
  { label: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }
> = {
  component: { label: 'COMPONENT', Icon: CubeIcon },
  toolbox: { label: 'TOOLBOX', Icon: TerminalWithCursorIcon },
  log: { label: 'LOG', Icon: FileIcon },
}
