import 'server-only'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { importExcalidraw } from '@joycostudio/trazo'
import type { ComponentProps } from 'react'
import { Diagram } from '@/components/flow'

// Keep these as filesystem paths: Turbopack rewrites `new URL(..., import.meta.url)`
// to a public asset URL, which `readFileSync` cannot open during static rendering.
const frameExplanation = importExcalidraw(
  readFileSync(
    join(
      process.cwd(),
      'components/log-diagrams/image-decoding-at-frame-speed/frame-explanation.excalidraw'
    ),
    'utf8'
  )
)

const decodedBuffer = importExcalidraw(
  readFileSync(
    join(
      process.cwd(),
      'components/log-diagrams/image-decoding-at-frame-speed/decoded-buffer.excalidraw'
    ),
    'utf8'
  )
)

type ImportedDiagramProps = Omit<ComponentProps<typeof Diagram>, 'children'>

export function FrameExplanationDiagram(props: ImportedDiagramProps) {
  return <Diagram {...props}>{frameExplanation}</Diagram>
}

export function DecodedBufferDiagram(props: ImportedDiagramProps) {
  return <Diagram {...props}>{decodedBuffer}</Diagram>
}
