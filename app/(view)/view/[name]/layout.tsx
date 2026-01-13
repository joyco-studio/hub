import { cn } from '@/lib/utils'

export default function ViewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      data-slot="preview"
      className={cn(
        'flex flex-1 flex-col items-center justify-center',
        'dark:override-shadcn-default-dark radio:override-shadcn-default-light light:override-shadcn-default-light terminal:override-shadcn-default-radio'
      )}
    >
      <style>{`
        body,
        html {
          background-color: transparent !important;
        }
      `}</style>
      {children}
    </div>
  )
}
