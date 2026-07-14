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
  tokens: { ...joycoTheme.tokens, bg: 'var(--card)' },
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

function layoutFor(lang: DiagramLang, source: string, theme: TrazoTheme): PositionedGraph {
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
      // Horizontal orientation reads like a real `git log --graph` timeline
      // (commits left→right, branches as rows) instead of trazo's default
      // vertical lane, which crams every commit label into one narrow column.
      // labelSide 'left' places commit labels ABOVE the lane in a horizontal chart.
      return layoutGit(
        graph,
        themeGitOptions(theme, { orientation: 'horizontal', labelSide: 'left' })
      )
    }
    default: {
      const { graph, error } = parseFlow(source)
      if (error) throw new Error(`trazo flow DSL line ${error.line}: ${error.message}`)
      return layoutFlow(graph, themeFlowOptions(theme))
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
  children: string
  title?: string
  index?: number
  articleNumber?: string
  className?: string
  // Render the children verbatim as a monospace ASCII figure instead of a trazo
  // graph. Used where a hand-drawn text diagram reads clearer than a rendered
  // one — e.g. git commit graphs whose commits the prose refers to by letter.
  ascii?: boolean
}) {
  const source = String(children).trim()
  const lang = ascii ? undefined : detectLang(source)
  const theme = lang === 'git' ? gitTheme : graphTheme
  const graph = lang ? layoutFor(lang, source, theme) : null

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
          <Graph graph={graph} title={title} className={className} theme={theme} />
        </div>
      ) : (
        <div className="relative overflow-x-auto px-6 py-12">
          <pre
            className={cn(
              'text-foreground/90 w-fit min-w-full font-mono text-[13px] leading-relaxed whitespace-pre',
              className
            )}
          >
            {source}
          </pre>
        </div>
      )}
    </figure>
  )
}
