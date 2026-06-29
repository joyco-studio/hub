# Feature request: a Trazo "callout" / span-annotation primitive

Context: converting diagrams in `content/logs/14-phantom-merge-conflicts.mdx`
to Trazo. One block can't be expressed by any of the four existing DSLs
(`flow`, `git`, `sequence`, `block`) and is left as ASCII:

```
git rebase --onto <new-base> <old-base> [<branch>]
                      │           │         │
                      │           │         └─ what to move (defaults to the branch you're on)
                      │           └─ where your own work starts (exclusive)
                      └─ where it should land
```

## Why none of the existing DSLs fit

All four current DSLs model **relationships between discrete nodes**. This
diagram is a different primitive entirely: it annotates **spans within a single
string**. The "nodes" are substrings of one line of literal text
(`<new-base>`, `<old-base>`, `[<branch>]`), and the connectors are **leader
lines** dropping from each span to an explanation — not edges between entities.

- Not `git`: no commits/branches/merges.
- Not `flow`: faking it (one box per arg + `---` to an explanation node)
  destroys the single most useful property — the args stay **inline in the real
  command**, so you read it left-to-right exactly as you'd type it. A flow chart
  also implies a top-down ordering the breakdown doesn't have.
- Not `sequence` / `block`: no actors, no grid.

The missing capability is **character-offset anchoring**: pinning a label to a
range of characters in a code string and drawing a leader line to it.

## Proposed DSL

A new kind, e.g. `callout`, that takes a literal line and a set of
(span → note) annotations. Spans addressed by substring match (or explicit
column range as a fallback when the substring is ambiguous):

```
callout
code "git rebase --onto <new-base> <old-base> [<branch>]"
note "<new-base>"  : where it should land
note "<old-base>"  : where your own work starts (exclusive)
note "[<branch>]"  : what to move (defaults to the branch you're on)
```

Renderer responsibilities:

1. Render `code` in the monospace label font, measuring each annotated span's
   x-range from the actual glyph advances (so leaders land under the right
   characters regardless of proportional vs mono).
2. Drop a vertical leader from the horizontal center of each span, then an
   elbow to a left-aligned note stacked below — matching the ASCII's
   `│ … └─ text` shape. Stagger leader lengths so notes don't collide
   (longest span-to-note distance for the leftmost, shortest for the rightmost,
   as in the original).
3. Optional `:role` per note for color, reusing the existing role palette.

### Open questions for the engine

- **Span addressing.** Substring is ergonomic but breaks on repeats
  (`<old-base>` appearing twice). Allow `note 12-21 : …` column form as an
  escape hatch?
- **Multiple lines.** Should `code` accept more than one line (annotating a
  multi-line snippet)? The current need is single-line only.
- **Wrapping.** If the code line is wider than the container, does it scroll,
  shrink, or wrap? Wrapping would break column math; horizontal scroll (like a
  `<pre>`) is probably the safe default.

## Priority

Low-frequency but genuinely unrepresentable today. Until it exists, syntax
breakdowns like the one above should stay as monospace code blocks — that's the
correct tool for them, and Trazo would be a downgrade.
