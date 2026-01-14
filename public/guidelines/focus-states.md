---
reference: https://registry.joyco.studio/toolbox/pr-guidelines#focus-states
---

# Focus States

### What

- Interactive elements need visible focus: use `focus-visible:ring-*` or equivalent
- Never use `outline-none` / `outline: none` without a focus replacement
- Use `:focus-visible` over `:focus` (avoids focus ring on click)
- Group focus with `:focus-within` for compound controls

### Why

Focus indicators are essential for keyboard navigation. Users who can't use a mouse rely on visible focus to know where they are in the interface. Removing outlines without replacement makes your site unusable for these users. Using `focus-visible` instead of `focus` provides the best of both worlds—keyboard users see the ring, but mouse users don't see it on click.

### Good

```tsx
// Button with proper focus-visible state
<button className="px-4 py-2 rounded bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2">
  Submit
</button>

// Custom input with focus replacement
<input
  className="border rounded px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-primary"
/>

// Compound control with focus-within
<div className="flex border rounded focus-within:ring-2 focus-within:ring-primary">
  <input className="flex-1 px-3 py-2 outline-none" />
  <button className="px-3 border-l">Search</button>
</div>

// Link with visible focus
<Link
  href="/about"
  className="text-blue-600 underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400 rounded"
>
  About Us
</Link>
```

### Bad

```tsx
// Removes outline with no replacement - invisible to keyboard users
<button className="outline-none">Submit</button>

// Using focus instead of focus-visible - shows ring on mouse click
<button className="focus:ring-2 focus:ring-blue-400">Submit</button>

// Custom input removes outline without adding focus state
<input className="border rounded px-3 py-2 outline-none" />
```
