import { Logo } from '@/components/ui/logo'
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className="flex items-center gap-2">
          <div className="bg-background rounded-sm border">
            <Logo className="h-6 w-6" />
          </div>{' '}
          JOYCO Registry
        </div>
      ),
    },
  }
}
