import './styles/globals.css'
import { Metadata, Viewport } from 'next'
import { Public_Sans, Roboto_Mono } from 'next/font/google'
import { RootProvider } from 'fumadocs-ui/provider/next'
import { Analytics } from '@vercel/analytics/next'
import { cn } from '@/lib/utils'

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
})

export const metadata: Metadata = {
  title: {
    template: '%s | JOYCO Registry',
    default: 'JOYCO Registry',
  },
  icons: {
    icon: [
      // SVG with embedded CSS handles dark/light automatically via prefers-color-scheme
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
      },
      // PNG fallbacks for browsers without SVG favicon support
      {
        url: '/icon-32x32.png',
        type: 'image/png',
        sizes: '32x32',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon-light.png',
        type: 'image/png',
        sizes: '32x32',
        media: '(prefers-color-scheme: light)',
      },
    ],
  },
}

export const viewport: Viewport = {
  maximumScale: 1, // handle zoom on mobile
}

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={cn(publicSans.variable, robotoMono.variable)}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.layout) {
                  document.documentElement.classList.add('layout-' + localStorage.layout)
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body>
        <RootProvider
          search={{
            enabled: false,
          }}
          theme={{
            themes: ['light', 'dark', 'radio', 'terminal'],
            defaultTheme: 'dark',
          }}
        >
          {children}
        </RootProvider>
        <Analytics />
      </body>
    </html>
  )
}
