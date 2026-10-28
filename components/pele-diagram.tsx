import 'server-only'
import { useId } from 'react'
import { measure } from '@joycostudio/trazo'
import { PeleError, render, type TextMeasurer } from 'pele'
import { DiagramFrame } from '@/components/flow'

// Pele sizes every node from its measured label, but on the server there is no
// canvas, so it falls back to a generic width table that doesn't match the
// site's Public Sans. Reuse trazo's bundled Public Sans advance table instead so
// boxes hug their labels the same way the trazo diagrams do. Pele's style flags:
// 1 = bold, 2 = italic, 4 = monospace.
const MONO_ADVANCE_EM = 0.6
const BOLD_WIDTH_SCALE = 1.06
const publicSansMeasurer: TextMeasurer = {
  width(text, size, style) {
    if (style & 4) return [...text].length * size * MONO_ADVANCE_EM
    const width = measure(text, { family: 'PublicSans', size })
    return style & 1 ? width * BOLD_WIDTH_SCALE : width
  },
}

const LABEL_FONT_SIZE = 14

function renderSource(source: string, idPrefix: string) {
  try {
    return render(source, {
      idPrefix,
      measurer: publicSansMeasurer,
      fontSize: LABEL_FONT_SIZE,
      // Angular, right-angle connectors to match the square JOYCO look; the
      // default curve reads as hand-drawn next to the squared nodes.
      config: { flowchart: { curve: 'step' } },
    })
  } catch (error) {
    if (!(error instanceof PeleError)) throw error
    throw new Error(
      `pele ${error.type ?? 'diagram'} line ${error.line}: ${error.message}\n${error.snippet}`
    )
  }
}

// A log diagram written in Mermaid syntax and drawn by Pele, rendered to a static
// SVG at build time inside the same frame as the trazo `<Diagram>`. Colors come
// from `app/styles/pele.css`: tag a node with a role class (`:::primary`,
// `:::success`, `:::warning`, `:::info`, `:::error`) to fill it; gantt tasks map
// their built-in tags onto the same roles (see that file).
export function PeleDiagram({
  children,
  title,
  index,
  articleNumber,
}: {
  children: string
  title?: string
  index?: number
  articleNumber?: string
}) {
  // Pele namespaces the SVG's internal ids (title, description, markers) with
  // this prefix so several diagrams on one page don't collide. It only accepts
  // letters, digits, `-` and `_`, so strip the punctuation React puts in ids.
  const idPrefix = `pele${useId().replace(/[^A-Za-z0-9_-]/g, '')}`
  const { svg } = renderSource(children.trim(), idPrefix)

  return (
    <DiagramFrame title={title} index={index} articleNumber={articleNumber}>
      <div
        className="relative flex justify-center px-6 py-12 [&_svg]:max-w-full"
        // The SVG comes from Pele rendering diagram source authored in this repo's
        // MDX, not user input, so it is trusted markup.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </DiagramFrame>
  )
}
