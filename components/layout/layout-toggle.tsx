'use client'

import { useLayout } from '@/hooks/use-layout'
import { AsideButton } from './nav-aside'
import LayoutToFullIcon from '@/components/icons/layout-to-full'
import LayoutToFixedIcon from '@/components/icons/layout-to-fixed'

/* -------------------------------------------------------------------------------------------------
 * LayoutToggle - Toggles between fixed (contained) and full (wide) layout
 * -------------------------------------------------------------------------------------------------*/

export function LayoutToggle() {
  const { layout, setLayout } = useLayout()

  const toggleLayout = () => {
    setLayout((prev) => (prev === 'fixed' ? 'full' : 'fixed'))
  }

  return (
    <AsideButton onClick={toggleLayout} className="max-2xl:hidden">
      {layout === 'fixed' ? (
        <LayoutToFullIcon className="size-5" />
      ) : (
        <LayoutToFixedIcon className="size-5" />
      )}
      <span className="sr-only">
        {layout === 'fixed'
          ? 'Switch to full width'
          : 'Switch to contained width'}
      </span>
    </AsideButton>
  )
}
