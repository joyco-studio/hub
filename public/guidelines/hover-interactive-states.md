---
reference: https://registry.joyco.studio/toolbox/pr-guidelines#hover-interactive-states
---

# Hover & Interactive States

### What

- Buttons and links need `hover:` states for visual feedback
- Interactive states should increase contrast: hover/active/focus must be more prominent than the rest state
- Provide visual feedback for all user interactions

### Why

Without hover states, users can't tell what's clickable. Interactive elements should respond to user attention—this is a fundamental UX expectation. The state progression (rest → hover → active → focus) should feel natural, with each state being slightly more prominent than the last.

### Good

```tsx
// Button with full state progression
<button
  className="
    bg-blue-500 text-white px-4 py-2 rounded
    hover:bg-blue-600
    active:bg-blue-700
    focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2
  "
>
  Submit
</button>

// Link with hover state
<Link
  href="/about"
  className="text-blue-600 hover:text-blue-800 hover:underline"
>
  About Us
</Link>

// Card with hover effect
<div className="border rounded-lg p-4 transition-colors hover:bg-muted/50 hover:border-foreground/20">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>

// Icon button with hover
<button
  aria-label="Settings"
  className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
>
  <SettingsIcon aria-hidden="true" />
</button>

// Ghost button variant
<button className="px-4 py-2 rounded hover:bg-accent active:bg-accent/80">
  Cancel
</button>
```

### Bad

```tsx
// No hover state - looks static/disabled
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Submit
</button>

// Link without hover feedback
<Link href="/about" className="text-blue-600">
  About Us
</Link>

// Hover state that reduces contrast (wrong direction)
<button className="bg-blue-600 hover:bg-blue-400">
  Submit
</button>

// Clickable element with no visual feedback
<div onClick={handleClick} className="p-4 cursor-pointer">
  Click me
</div>
```
