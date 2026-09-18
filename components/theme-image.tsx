'use client'

import { useSyncExternalStore, type ComponentProps } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'

const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

type ImageVariant = Pick<ComponentProps<typeof Image>, 'src' | 'alt'>
type ThemeImageProps = Omit<ComponentProps<typeof Image>, 'src' | 'alt'> & {
  light: ImageVariant
  dark: ImageVariant
}

/** Match the image to the site's light or dark palette, including custom themes. */
export function ThemeImage({ light, dark, ...props }: ThemeImageProps) {
  const { resolvedTheme } = useTheme()
  const hydrated = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot
  )
  const theme = hydrated ? (resolvedTheme ?? 'dark') : 'dark'
  const variant = theme === 'dark' || theme === 'terminal' ? dark : light

  return <Image {...props} src={variant.src} alt={variant.alt} />
}
