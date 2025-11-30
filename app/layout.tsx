import './globals.css'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { RootProvider } from 'fumadocs-ui/provider/next'

const inter = Inter({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    template: '%s | JOYCO Registry',
    default: 'JOYCO Registry',
  },
  icons: {
    icon: [
      {
        url: '/icon.svg',
        href: '/icon.svg',
        type: 'image/svg+xml',
        sizes: '32x32',
      },
      {
        url: '/icon.png',
        href: '/icon.png',
        type: 'image/png',
        sizes: '32x32',
      },
    ],
  },
}

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  )
}
