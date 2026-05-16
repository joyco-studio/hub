---
name: cluster
description: "Use when building layouts, creating flex containers, distributing space between elements, or when the user mentions Cluster, Filler, layout wrappers, or spacing. Also trigger when you see justify-between, justify-end, Card wrappers with bg+padding, or any pattern that should use Cluster instead. Proactively suggest Cluster when reviewing code that violates these layout principles."
---

# Cluster & Filler — Layout Primitives

`Cluster` and `Filler` are the primary layout primitives in this design system. They replace Cards, justify-between, and any opaque wrapper pattern.

## Core Rules

1. **Clusters are always transparent** — they never render a background. The `bg` prop sets a CSS variable (`--cluster-bg`) that direct children inherit via a zero-specificity `@layer base` rule.
2. **Every direct child of a Cluster must be a solid element** — it should have its own visual identity (background, border, etc.). Never place bare text or icons as direct Cluster children.
3. **Use `<Filler />` for space distribution** — never use `justify-between`, `justify-end`, or `justify-around`. Filler is an invisible `flex-1` spacer with `aria-hidden="true"`.
4. **Children can override the inherited bg** — since the inheritance rule uses `:where()` (zero specificity) inside `@layer base`, any `bg-*` utility on a child wins naturally.

## Import

```tsx
import { Cluster, Filler } from '@/components/ui/cluster'
```

## Cluster Props

| Prop | Values | Default | Notes |
|---|---|---|---|
| `display` | `'flex'`, `'inline-flex'` | `'flex'` | |
| `direction` | `'row'`, `'col'` | `'row'` | |
| `align` | `'start'`, `'center'`, `'end'`, `'stretch'`, `'baseline'` | `'center'` | |
| `wrap` | `true`, `false` | `false` | |
| `bg` | `'muted'`, `'accent'` | `'muted'` | Sets `--cluster-bg`, inherited by children |
| `asChild` | `boolean` | `false` | Render as child element via Radix Slot |

## Filler

Takes no special props. Renders a `<div>` with `flex-1 min-w-0 self-stretch`. It inherits `--cluster-bg` like any other child.

`Filler` omits `role` and `aria-hidden` from its props type since those are hardcoded (`role="presentation"`, `aria-hidden="true"`).

## Patterns

### Row with Filler (replaces justify-between)

```tsx
<Cluster>
  <div className="rounded-md px-3 py-2">
    <span className="text-sm font-medium">Label</span>
  </div>
  <Filler />
  <Badge variant="accent">Status</Badge>
</Cluster>
```

### Column layout (replaces Card)

```tsx
<Cluster direction="col" align="stretch" bg="muted">
  <div className="rounded-md p-3">
    <span className="text-sm font-medium">Header</span>
    <p className="text-muted-foreground text-sm">Description</p>
  </div>
  <div className="rounded-md p-3">
    <Input placeholder="Field" />
  </div>
  <Cluster bg="muted">
    <Filler />
    <Button variant="secondary">Cancel</Button>
    <Button>Create</Button>
  </Cluster>
</Cluster>
```

### Input-like solid child (sidebar search pattern)

```tsx
<div className="bg-muted focus-within:bg-accent/70 flex h-10 items-center gap-3 rounded-md px-3">
  <SearchIcon className="text-muted-foreground size-4 shrink-0" />
  <input
    type="text"
    placeholder="Search"
    className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent font-mono text-sm tracking-wide uppercase outline-none"
  />
  <Kbd className="h-[2em] px-2">⌘K</Kbd>
</div>
```

This is a valid Cluster child — it's a solid block with `bg-muted` and its own internal layout.

### Inline display

For inline contexts, use `asChild` with a `<span>` to avoid `<div>` nesting issues:

```tsx
<Cluster display="inline-flex" asChild>
  <span>
    <Badge>Active</Badge>
    <Badge variant="muted">3 tasks</Badge>
  </span>
</Cluster>
```

### Overriding child background

```tsx
<Cluster>
  <div className="px-3 py-2">Inherits bg-muted</div>
  <div className="bg-fd-background px-3 py-2">Overrides to different bg</div>
</Cluster>
```

### Nested Clusters

Inner Clusters set their own `--cluster-bg` scope:

```tsx
<Cluster direction="col" align="stretch" bg="muted">
  <div className="p-3">Top section</div>
  <Cluster bg="accent">
    <Filler />
    <Button>Action</Button>
  </Cluster>
</Cluster>
```

## Anti-patterns — DO NOT

```tsx
// WRONG: bare text as direct child
<Cluster>
  <span>Label</span>
  <Filler />
</Cluster>

// WRONG: justify-between instead of Filler
<Cluster className="justify-between">
  <div>Left</div>
  <div>Right</div>
</Cluster>

// WRONG: Card wrapper with bg + padding
<div className="bg-card p-6 rounded-lg">
  <div>Content</div>
</div>

// CORRECT alternatives:
<Cluster>
  <div className="rounded-md px-3 py-2">
    <span>Label</span>
  </div>
  <Filler />
</Cluster>
```

## CSS Dependency

Cluster requires this base CSS rule (injected automatically via the shadcn registry):

```css
@layer base {
  :where([data-slot='cluster'] > *) {
    background-color: var(--cluster-bg, transparent);
  }
}
```

And the `--gap` spacing token:

```css
:root {
  --gap: 0.25rem;
}

@theme inline {
  --spacing-gap: var(--gap);
}
```
