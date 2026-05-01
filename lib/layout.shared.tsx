import { Logo } from '@/components/logos'
import type { BaseLayoutProps } from '@/components/layout/shared'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground group/logo block h-6 w-6">
            <Logo className="h-full w-full" />
          </span>{' '}
          JOYCO Registry
        </div>
      ),
    },
  }
}
