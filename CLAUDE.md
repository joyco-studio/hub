# Registry — CLAUDE.md

## Adding new content pages

Fumadocs uses `content/<section>/meta.json` files to control which pages appear in the sidebar. The `pages` array acts as a **whitelist** — if a page's slug isn't listed, it won't show up in the sidebar regardless of the MDX file existing.

When adding a new page:

1. Create the MDX file in the appropriate `content/<section>/` directory
2. Add its slug to the corresponding `meta.json` `pages` array (keep alphabetical order)
3. Set the `type` field in frontmatter if it belongs to a sub-category (`game`, `effect`, `canvas`). Defaults to `component`

### Sidebar sub-categories (Components section)

The Components sidebar splits pages into sub-sections based on the `type` frontmatter field:

- **UI** — `type: component` (default)
- **Canvas** — `type: canvas`
- **Effects** — `type: effect`
- **Games** — `type: game`

The type enum is defined in `source.config.ts`. Slug getters live in `lib/source.ts` and are passed through `app/(registry)/layout.tsx` → `RegistrySidebar` → `SidebarSection`.

## Diagram conventions (`<Diagram>` / trazo)

Log diagrams render through the `Diagram` component (`components/flow.tsx`) using the `@joycostudio/trazo` DSL. Two house rules:

- **Arrows/connectors are never colored.** Only node fills carry semantic role color (`:primary`, `:success`, …); every connector renders in the neutral accent color. This is **enforced in code** — `Diagram` strips trazo's per-edge `colored` flag before layout — so a colored token (`===`, `==>`, `<==`, `<==>`) renders identically to its neutral form (`---`, `-->`, `<--`, `<-->`). Prefer the neutral tokens in new DSL for clarity, but either way the render stays neutral. (Git-graph branch lanes are exempt — those are colored by branch on purpose.)
- **Sequence participants should carry roles.** Give each `participant` a `:role` (e.g. `participant S[Server]:primary`) so the actor boxes are colored, matching the flow diagrams. Keep the role for a given actor consistent across an article (e.g. Main Thread → `:primary`, Compositor → `:success`).

When editing a diagram that also appears on the temporary `/diagram-comparison` review page (`app/diagram-comparison/page.tsx`), update the duplicated DSL in that page's `after` field too.
