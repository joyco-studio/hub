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
