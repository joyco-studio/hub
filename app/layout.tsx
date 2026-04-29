import './styles/globals.css'
import { Metadata, Viewport } from 'next'
import { Public_Sans, Roboto_Mono } from 'next/font/google'
import { RootProvider } from 'fumadocs-ui/provider/next'
import { Analytics } from '@vercel/analytics/next'
import { cn } from '@/lib/utils'
import { APP_BASE_URL } from '@/lib/constants'

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL(APP_BASE_URL),
  title: {
    template: '%s | JOYCO Hub',
    default: 'JOYCO Hub',
  },
  description:
    'Open-source UI components, tools, and experiments by JOYCO Studio.',
  openGraph: {
    siteName: 'JOYCO Hub',
  },
  twitter: {
    card: 'summary_large_image',
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
                var themes = ['light', 'dark', 'radio', 'terminal']
                var stored = localStorage.theme
                var theme
                if (stored === 'system') {
                  theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                } else if (themes.indexOf(stored) !== -1) {
                  theme = stored
                } else {
                  theme = 'dark'
                }
                document.documentElement.classList.add(theme)
                document.documentElement.style.colorScheme = theme === 'light' || theme === 'radio' ? 'light' : 'dark'
                if (localStorage.layout) {
                  document.documentElement.classList.add('layout-' + localStorage.layout)
                }
              } catch (_) {
                document.documentElement.classList.add('dark')
              }
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
            // If you change `themes` or `defaultTheme`, also update the
            // anti-flash script in <head> above so SSR and the script agree.
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
