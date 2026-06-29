# Trazo git-DSL limitations — phantom-merge-conflicts diagrams

Context: converting the two ASCII commit graphs in
`content/logs/14-phantom-merge-conflicts.mdx` to Trazo's `git` DSL
(`@joycostudio/trazo@0.3.0`). Both **parse and layout cleanly** — nothing
errors. What follows is what the DSL _can't express_ relative to the original
hand-drawn ASCII, so you can decide what (if anything) to add to the engine.

## The two diagrams as authored

### 1. Phantom-conflict setup (squash duplicates inherited commits)

```
commit A
commit B
branch homero/receipts
commit e1 : elvira
commit e2 : elvira
commit h1 : homero
commit h2 : homero
checkout main
commit S : squash of elvira/checkout
```

Topology produced (verified): `S` parents `B` (NOT e1/e2) — the squash is
correctly disconnected from Elvira's inherited commits, which is the whole
point of the article. `e1→e2→h1→h2` live on `homero/receipts`.

### 2. Post-rebase transplant

```
commit A
commit B
commit S : squash of elvira/checkout
branch homero/receipts
commit h1' : homero
commit h2' : homero
```

`h1'` parents `S` — Homero's commits replayed on top of the squash. Correct.

## Original ASCII intent (for reference)

```
main:              A ── B ───────── S        (S = squash of elvira/checkout)
                          \
homero/receipts:           e1 ── e2 ── h1 ── h2
                          └ Elvira's ┘└ Homero's ┘
                             commits      commits
```

## What the git DSL cannot express

1. **Free-floating annotations.** The `(S = squash of elvira/checkout)` note
   was a callout _beside_ the graph, not a property of the commit. The only
   place to put text in the git DSL is a commit's own `: message` badge, so it
   became `commit S : squash of elvira/checkout`. There is no syntax for a note
   anchored to a commit but rendered as a side-annotation (flow/sequence have
   `note`, git does not).

2. **Commit-range grouping / brackets.** `└ Elvira's ┘└ Homero's ┘` brackets a
   _range_ of commits under a shared label. The DSL has no way to group N
   consecutive commits and label the group. Workaround used: repeat the owner
   as each commit's message (`e1: elvira`, `e2: elvira`, `h1: homero`, …),
   which is noisier and loses the "these belong together" visual.
   - A `subgraph`/`group`-like construct for commit ranges, or a
     `branch <name> ["Label"]` ref label, would cover this.

3. **No per-commit role / color.** Flow nodes take `:primary|success|error|…`;
   git commits don't. We can't tint Elvira's inherited commits as
   "danger/duplicated" vs Homero's as "yours" — git lanes are auto-colored by
   branch only. The article's core distinction (inherited vs your own work) has
   no color affordance.
   - Desired: allow `:role` on a commit, e.g. `commit e1 :error : elvira`.

4. **Orientation is layout-only, not in the DSL.** The original reads
   left→right; `layoutGit` supports `orientation: 'horizontal'` but there's no
   DSL directive for it, and the `<Diagram>` wrapper calls `layoutGit(graph)`
   with defaults (vertical). Either a DSL directive (`orientation horizontal`)
   or a `<Diagram orientation="horizontal">` passthrough would let authors pick
   per-diagram without editing the component.

5. **Branch lane labels (`main:` / `homero/receipts:`).** Branch names exist as
   refs at the tip, but the original ASCII labels the _whole lane_. Minor, but
   the per-lane label on the left margin isn't reproducible.

## Suggested priority

For these specific diagrams, (2) commit-range grouping and (3) per-commit role
are what would make the Trazo version as legible as the ASCII. (4) orientation
is a nice-to-have for matching the original's reading direction.

---

## Issues in current diagrams

(almost all graphs in /logs/08-webgl-scroll-sync look broken by overlapping figures)

1. Note overlaps:

```
flow LR
subgraph main ["Main Thread"]
LTH["LayerTreeHost<br/>owns main-thread tree"]:primary
end
subgraph impl ["Impl Thread"]
LTHI["LayerTreeHostImpl<br/>owns impl-thread tree"]:success
end
LTH <==>|"commit (sync) / scroll deltas (async)"| LTHI
```

Result: https://r2.joyco.studio/trazo-issues/dual-tree.png

2. Note overlaps:

```
flow LR
subgraph viewport ["Window (W)"]
CANVAS["Canvas<br/>(fixed to window)"]:streamed
VIEW["Viewport<br/>(what user sees)"]:primary
end
subgraph page ["Page (P)"]
CONTENT["DOM content"]:success
end
VIEW ===|"D (delta) — JS animates scrollTop, reads it back for canvas"| CONTENT
```

Result: https://r2.joyco.studio/trazo-issues/js-driven-scroll.png

3. Widows: 