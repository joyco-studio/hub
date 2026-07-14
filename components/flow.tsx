import {
  layoutFlow,
  layoutSequence,
  layoutBlock,
  layoutGit,
  parseFlow,
  parseSequence,
  parseBlock,
  parseGit,
  themeFlowOptions,
  themeGitOptions,
  joycoTheme,
  type PositionedGraph,
  type TrazoTheme,
} from '@joycostudio/trazo'
import { Graph } from '@joycostudio/trazo/react'
import { Badge } from '@/components/ui/badge'

// The full-width frame draws its own textured canvas + border, so the graph's
// own canvas backdrop is turned off to avoid a doubled texture rectangle.
//
// With `background: 'none'` trazo skips its chip-lift auto-follow — the step that
// normally keeps the node-box stroke (`--trazo-bg`) equal to the canvas it paints.
// Left unset, that stroke falls back to `--background`, which does NOT match this
// frame's `bg-card` surface, so the boxes would show a mismatched outline ring.
// Pin `--trazo-bg` to the frame's own color (`--card`) so the strokes read as the
// same surface the boxes sit on. Keep this in sync with the frame's `bg-card`.
const graphTheme: TrazoTheme = {
  ...joycoTheme,
  background: 'none',
  tokens: { ...joycoTheme.tokens, bg: 'var(--card)' },
}

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
      return layoutGit(graph, themeGitOptions(joycoTheme))
    }
    default: {
      const { graph, error } = parseFlow(source)
      if (error) throw new Error(`trazo flow DSL line ${error.line}: ${error.message}`)
      return layoutFlow(graph, themeFlowOptions(joycoTheme))
    }
  }
}

export function Diagram({
  children,
  title,
  index,
  articleNumber,
  className,
}: {
  children: string
  title?: string
  index?: number
  articleNumber?: string
  className?: string
}) {
  const source = String(children).trim()
  const graph = layoutFor(detectLang(source), source)

  // The corner tag reads `N{article}-{illustration}` (e.g. N07-01): the log's
  // number, injected per-page, paired with this diagram's order in the article.
  const tag =
    articleNumber && index != null
      ? `N${articleNumber}-${String(index).padStart(2, '0')}`
      : undefined

  return (
    <figure className="not-prose border-border bg-card relative my-8 w-full overflow-hidden border">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, color-mix(in oklab, var(--foreground) 4%, transparent) 0 1px, transparent 1px 8px)',
        }}
      />
      {title && (
        <Badge
          asChild
          variant="accent"
          size="sm"
          className="absolute top-2 left-2 z-10 h-6 max-w-[70%] font-normal"
        >
          <figcaption className="truncate">{title}</figcaption>
        </Badge>
      )}
      {tag && (
        <Badge
          variant="accent"
          size="sm"
          className="absolute top-2 right-2 z-10 h-6 font-normal tabular-nums"
        >
          {tag}
        </Badge>
      )}
      <div className="relative flex justify-center px-6 py-12 [&_svg]:max-w-full">
        <Graph graph={graph} title={title} className={className} theme={graphTheme} />
      </div>
    </figure>
  )
}
