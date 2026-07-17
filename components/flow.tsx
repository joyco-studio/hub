import 'server-only'
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
  type FlowGraph,
  type SequenceGraph,
  type BlockGraph,
  type CommitGraph,
} from '@joycostudio/trazo'
import { Graph } from '@joycostudio/trazo/react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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
  textCase: 'none',
  tokens: {
    ...joycoTheme.tokens,
    bg: 'var(--card)',
    'neutral-foreground': 'var(--muted)',
    success: 'var(--color-mint-green)',
    warning: 'var(--color-mustard-yellow)',
    code: 'oklch(1 0 0 / 0.16)',
    'code-foreground': 'inherit',
  },
}

// Git branches map onto lane-1, lane-2, … in commit order. This app's --chart-*
// palette is all one blue family, so trazo's default lane pair (lane-1 → --primary,
// lane-2 → --chart-1) reads as nearly the same color and the branches blur together.
// Give the git timeline its own lane pair, separated in lightness AND hue so `main`
// and a feature branch are unmistakably distinct.
const gitTheme: TrazoTheme = {
  ...graphTheme,
  tokens: {
    ...graphTheme.tokens,
    'lane-1': 'var(--primary)',
    'lane-2': 'var(--chart-2)',
  },
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

// A trazo graph a `<Diagram>` can render — either authored as a string DSL and
// parsed here, or handed in already-parsed from a `flow`/`seq`/`git`/`block`
// tagged-template call (which validates the DSL at build time).
export type DiagramGraph = FlowGraph | SequenceGraph | BlockGraph | CommitGraph

// The commit graph is the only trazo graph without a `kind` discriminator — it
// carries `commits`/`refs` instead — so it's identified by the absence of `kind`.
function isCommitGraph(graph: DiagramGraph): graph is CommitGraph {
  return !('kind' in graph)
}

function themeFor(graph: DiagramGraph): TrazoTheme {
  return isCommitGraph(graph) ? gitTheme : graphTheme
}

// Lay out an already-parsed graph. Both entry points (string DSL and the
// tagged-template graphs) funnel through here so the git/flow rules stay in one
// place.
function layoutParsed(graph: DiagramGraph, theme: TrazoTheme): PositionedGraph {
  if (isCommitGraph(graph)) {
    // Horizontal orientation reads like a real `git log --graph` timeline
    // (commits left→right, branches as rows) instead of trazo's default
    // vertical lane, which crams every commit label into one narrow column.
    // labelSide 'left' places commit labels ABOVE the lane in a horizontal chart.
    return layoutGit(
      graph,
      themeGitOptions(theme, { orientation: 'horizontal', labelSide: 'left' })
    )
  }
  switch (graph.kind) {
    case 'sequence':
      return layoutSequence(graph)
    case 'block':
      return layoutBlock(graph)
    default: {
      // House rule (see CLAUDE.md "Diagram conventions"): connectors are never
      // colored — an arrow/lane always renders in the neutral accent color, never
      // a source node's role color. Neutralize trazo's per-edge `colored` flag
      // here so a colored token (`===`/`==>`/`<==`/`<==>`) anywhere in the DSL
      // can't reintroduce a colored lane. Only node fills carry role color.
      for (const edge of graph.edges) edge.colored = false
      return layoutFlow(graph, themeFlowOptions(theme))
    }
  }
}

// Parse a string DSL to a graph, dispatching on the detected language. Parse
// errors are surfaced with the offending line.
function parseSource(lang: DiagramLang, source: string): DiagramGraph {
  switch (lang) {
    case 'sequence': {
      const { graph, error } = parseSequence(source)
      if (error)
        throw new Error(
          `trazo sequence DSL line ${error.line}: ${error.message}`
        )
      return graph
    }
    case 'block': {
      const { graph, error } = parseBlock(source)
      if (error)
        throw new Error(`trazo block DSL line ${error.line}: ${error.message}`)
      return graph
    }
    case 'git': {
      const { graph, error } = parseGit(source)
      if (error)
        throw new Error(`trazo git DSL line ${error.line}: ${error.message}`)
      return graph
    }
    default: {
      const { graph, error } = parseFlow(source)
      if (error)
        throw new Error(`trazo flow DSL line ${error.line}: ${error.message}`)
      return graph
    }
  }
}

export function Diagram({
  children,
  title,
  index,
  articleNumber,
  className,
  ascii = false,
}: {
  // A string DSL (parsed here) or a graph from a `flow`/`seq`/`git`/`block`
  // tagged-template call (parsed at the call site, so the DSL is validated at
  // build time). `ascii` mode requires a string.
  children: string | DiagramGraph
  title?: string
  index?: number
  articleNumber?: string
  className?: string
  // Render the children verbatim as a monospace ASCII figure instead of a trazo
  // graph. Used where a hand-drawn text diagram reads clearer than a rendered
  // one — e.g. git commit graphs whose commits the prose refers to by letter.
  ascii?: boolean
}) {
  // ASCII mode always takes a raw string and renders it verbatim.
  const asciiSource =
    ascii && typeof children === 'string' ? children.trim() : null

  // Resolve the theme (needed for both layout and the <Graph> paint pass) and
  // lay out, from whichever form `children` arrived in.
  let theme = graphTheme
  let graph: PositionedGraph | null = null
  if (!ascii) {
    if (typeof children === 'string') {
      const source = children.trim()
      const parsed = parseSource(detectLang(source), source)
      theme = themeFor(parsed)
      graph = layoutParsed(parsed, theme)
    } else {
      theme = themeFor(children)
      graph = layoutParsed(children, theme)
    }
  }

  // The corner tag reads `N{article}-{illustration}` (e.g. N07-01): the log's
  // number, injected per-page, paired with this diagram's order in the article.
  const tag =
    articleNumber && index != null
      ? `N${articleNumber}-${String(index).padStart(2, '0')}`
      : undefined

  return (
    <figure className="not-prose border-border bg-card relative my-8 w-full overflow-hidden border">
      {/* figcaption must be the first or last child of <figure> per the HTML content
          model, so the caption Badge leads; the remaining overlays are absolutely
          positioned, so DOM order doesn't affect the visual stacking. */}
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, color-mix(in oklab, var(--foreground) 4%, transparent) 0 1px, transparent 1px 8px)',
        }}
      />
      {tag && (
        <Badge
          variant="accent"
          size="sm"
          className="absolute top-2 right-2 z-10 h-6 font-normal tabular-nums"
        >
          {tag}
        </Badge>
      )}
      {graph ? (
        <div className="relative flex justify-center px-6 py-12 [&_svg]:max-w-full">
          <Graph
            graph={graph}
            title={title}
            className={className}
            theme={theme}
          />
        </div>
      ) : (
        <div className="relative overflow-x-auto px-6 py-12">
          <pre
            className={cn(
              'text-foreground/90 w-fit min-w-full font-mono text-[13px] leading-relaxed whitespace-pre',
              className
            )}
          >
            {asciiSource}
          </pre>
        </div>
      )}
    </figure>
  )
}
