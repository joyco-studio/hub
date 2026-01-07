import { getRegistryExampleComponent } from '@/lib/registry-examples'
import { cn } from '@/lib/utils'
import { ComponentSource } from './component-source-code'
import { ResizableIframe } from './resizable-iframe'
import { lazy } from 'react'

interface ComponentPreviewProps extends React.ComponentProps<'div'> {
  name: string
  defaultWidth?: number
  height?: number | string
  resizable?: boolean
  // if provided, will use the code example from the given file
  codeExampleName?: string
}

export function ComponentPreview({
  name,
  className,
  defaultWidth = 375,
  height = 600,
  resizable = false,
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

  return (
    <div
      className={cn(
        'group not-prose border-border divide-border relative grid overflow-clip',
        '*:data-[slot="code-block"]:mt-0',
        '**:data-[slot="copy-button"]:right-6',
        className
      )}
      {...props}
    >
      <div className="relative flex">
        <div
          title={undefined}
          /* For demos, we want to override project theme to default shadcn themes to favor a consistent appearance for the cloning user */
          className="bg-preview my-0 w-full overflow-hidden rounded-none"
        >
          {resizable ? (
            <ResizableIframe
              src={`/view/${name}`}
              defaultWidth={defaultWidth}
              minWidth={280}
              height={height}
            />
          ) : (
            <LazyComponent name={name} />
          )}
        </div>
      </div>
      <ComponentSource name={codeExampleName ?? name} language="tsx" />
    </div>
  )
}

const LazyComponent = ({ name }: { name: string }) => {
  const Component = lazy(() => import(`@/demos/${name}`))
  return (
    <div className="dark:override-shadcn-default-dark radio:override-shadcn-default-light light:override-shadcn-default-light terminal:override-shadcn-default-radio contents">
      <Component />
    </div>
  )
}
