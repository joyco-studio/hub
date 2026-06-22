import {
  layoutFlow,
  layoutSequence,
  layoutBlock,
  layoutGit,
  parseFlow,
  parseSequence,
  parseBlock,
  parseGit,
  type PositionedGraph,
} from '@joycostudio/trazo'
import { Graph } from '@joycostudio/trazo/react'

type DiagramLang = 'flow' | 'sequence' | 'block' | 'git'

// Mirror trazo's own language dispatch: the first non-comment, non-blank line
// chooses the DSL. Anything starting with a git verb is a commit graph; the
// rest are keyed off their leading keyword.
function detectLang(source: string): DiagramLang {
  for (const line of source.split('\n')) {
    const trimmed = line.replace(/#.*$/, '').trim()
    if (trimmed === '') continue
    if (/^sequence(diagram)?\b/i.test(trimmed)) return 'sequence'
    if (/^block(-beta)?\b/i.test(trimmed)) return 'block'
    if (/^(commit|branch|checkout|merge)\b/i.test(trimmed)) return 'git'
    return 'flow'
  }
  return 'flow'
}

function layoutFor(lang: DiagramLang, source: string): PositionedGraph {
  switch (lang) {
    case 'sequence': {
      const { graph, error } = parseSequence(source)
      if (error) throw new Error(`trazo sequence DSL line ${error.line}: ${error.message}`)
      return layoutSequence(graph)
    }
    case 'block': {
      const { graph, error } = parseBlock(source)
      if (error) throw new Error(`trazo block DSL line ${error.line}: ${error.message}`)
      return layoutBlock(graph)
    }
    case 'git': {
      const { graph, error } = parseGit(source)
      if (error) throw new Error(`trazo git DSL line ${error.line}: ${error.message}`)
      return layoutGit(graph)
    }
    default: {
      const { graph, error } = parseFlow(source)
      if (error) throw new Error(`trazo flow DSL line ${error.line}: ${error.message}`)
      return layoutFlow(graph)
    }
  }
}

export function Diagram({
  children,
  title,
  className,
}: {
  children: string
  title?: string
  className?: string
}) {
  const source = String(children).trim()
  const graph = layoutFor(detectLang(source), source)

  return (
    <div className="my-6 flex justify-center [&_svg]:max-w-full">
      <Graph graph={graph} title={title} className={className} />
    </div>
  )
}
