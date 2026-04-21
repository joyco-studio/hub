import { getRegistryExampleComponent } from '@/lib/registry-examples'
import { cn } from '@/lib/utils'
import { ComponentSource } from './component-source-code'
import { ResizableIframe } from './resizable-iframe'
import { lazy } from 'react'

interface ComponentPreviewProps extends React.ComponentProps<'div'> {
  name: string
  height?: number | string
  iframe?: boolean
  resizable?: { defaultWidth?: number }
  codeExampleName?: string
}

export function ComponentPreview({
  name,
  className,
  height = 600,
  iframe,
  resizable,
  codeExampleName,
  ...props
}: ComponentPreviewProps) {
  const Component = getRegistryExampleComponent(name)

  if (!Component) {
    return (
      <p className="text-muted-foreground mt-6 text-sm">
        Component{' '}
        <code className="bg-muted relative px-[0.3rem] py-[0.2rem] font-mono text-sm">
          {name}
        </code>{' '}
        not found in registry.
      </p>
    )
  }

  const heightStyle = typeof height === 'number' ? `${height}px` : height

  function renderPreview() {
    if (iframe) {
      return (
        <iframe
          src={`/view/${name}`}
          className="border-0"
          style={{ width: '100%', height: heightStyle }}
          title={`${name} preview`}
        />
      )
    }
    if (resizable) {
      return (
        <div className="w-full">
          <ResizableIframe
            src={`/view/${name}`}
            defaultWidth={resizable?.defaultWidth ?? 375}
            minWidth={280}
            height={height}
          />
        </div>
      )
    }
    return (
      <div
        data-slot="preview"
        className="dark:override-shadcn-default-dark radio:override-shadcn-default-light light:override-shadcn-default-light terminal:override-shadcn-default-radio bg-preview h-full w-full"
      >
        <LazyComponent name={name} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group not-prose border-border divide-border relative grid overflow-clip',
        '*:data-[slot="code-block"]:mt-0',
        className
      )}
      {...props}
    >
      <div className="relative my-0 flex w-full overflow-hidden rounded-none">
        {renderPreview()}
      </div>
      <ComponentSource name={codeExampleName ?? name} language="tsx" />
    </div>
  )
}

const LazyComponent = ({ name }: { name: string }) => {
  const Component = lazy(() => import(`@/demos/${name}`))
  return <Component />
}
