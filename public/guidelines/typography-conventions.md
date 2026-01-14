---
reference: https://registry.joyco.studio/toolbox/pr-guidelines#typography-conventions
---

# Typography Conventions

### What

- Use `…` (ellipsis character) not `...` (three periods)
- Use curly quotes `"` `"` not straight quotes `"`
- Use non-breaking spaces for units and keyboard shortcuts: `10&nbsp;MB`, `⌘&nbsp;K`
- Loading states end with `…`: `"Loading…"`, `"Saving…"`
- Use `font-variant-numeric: tabular-nums` for number columns and comparisons
- Use `text-wrap: balance` or `text-pretty` on headings to prevent widows

### Why

Professional typography improves readability and perceived quality. The ellipsis character (`…`) is a single glyph designed for this purpose. Curly quotes are typographically correct. Non-breaking spaces prevent awkward line breaks that separate units from numbers or split keyboard shortcuts. Tabular numbers ensure columns align properly. Balanced text wrapping prevents single words on their own line (widows).

### Good

```tsx
// Proper ellipsis
<span>Loading…</span>
<p className="truncate">This text will be truncated…</p>

// Curly quotes
<blockquote>"Design is not just what it looks like, design is how it works."</blockquote>

// Non-breaking spaces (use &nbsp; or actual non-breaking space character)
<span>10&nbsp;MB</span>
<kbd>⌘&nbsp;K</kbd>
<span>New&nbsp;York</span>

// Tabular numbers for alignment
<td className="tabular-nums">1,234.56</td>
<td className="tabular-nums">12.00</td>

// Balanced heading
<h1 className="text-wrap-balance">
  Building the Future of Design Systems
</h1>

// Or using text-pretty for paragraphs
<p className="text-pretty">
  A longer paragraph that should avoid orphans at the end.
</p>
```

### Bad

```tsx
// Three periods instead of ellipsis
<span>Loading...</span>

// Straight quotes
<blockquote>"Design is not just what it looks like"</blockquote>

// Breaking space between number and unit
<span>10 MB</span>  // Can break as "10" on one line, "MB" on next

// Proportional numbers in a table - columns won't align
<td>1,234.56</td>
<td>12.00</td>

// Unbalanced heading - may have single word on last line
<h1>Building the Future of Design Systems</h1>
```
