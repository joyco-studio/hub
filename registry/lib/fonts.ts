import { Public_Sans, Roboto_Mono } from 'next/font/google'

/**
 * JOYCO brand fonts.
 *
 * Apply the CSS variable classes to your root `<html>` element:
 *
 * ```tsx
 * // app/layout.tsx
 * import { publicSans, robotoMono } from '@/lib/fonts'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html className={`${publicSans.variable} ${robotoMono.variable}`}>
 *       <body>{children}</body>
 *     </html>
 *   )
 * }
 * ```
 *
 * Then reference them in your Tailwind CSS:
 *
 * ```css
 * @theme inline {
 *   --font-sans: var(--font-public-sans);
 *   --font-mono: var(--font-roboto-mono);
 *   --default-font-family: var(--font-sans);
 *   --default-font-family-mono: var(--font-mono);
 * }
 * ```
 */
export const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
})

export const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
})
