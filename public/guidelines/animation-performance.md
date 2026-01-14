---
reference: https://registry.joyco.studio/toolbox/pr-guidelines#animation-performance
---

# Animation Performance

### What

- Animate only `transform` and `opacity` (compositor-friendly properties)
- Never use `transition: all`—list properties explicitly
- Set correct `transform-origin`
- For SVG animations, apply transforms on a `<g>` wrapper with `transform-box: fill-box; transform-origin: center`
- Animations should be interruptible—respond to user input mid-animation

### Why

Animating `transform` and `opacity` runs on the GPU compositor thread, avoiding expensive layout recalculations and repaints. Other properties like `width`, `height`, `top`, `left`, `margin`, or `padding` trigger layout thrashing and cause jank, especially on lower-end devices. Using `transition: all` is wasteful and can cause unexpected transitions on properties you didn't intend to animate.

### Good

```tsx
// Only animating transform and opacity
<div className="transition-transform duration-200 hover:scale-105">
  Hover me
</div>

// Explicit property list
<button className="transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-95">
  Click me
</button>

// Correct transform-origin for scale
<div className="origin-top-left transition-transform hover:scale-110">
  Scales from top-left
</div>

// SVG with proper transform setup
<svg viewBox="0 0 24 24">
  <g className="origin-center transition-transform hover:rotate-180" style={{ transformBox: 'fill-box' }}>
    <path d="..." />
  </g>
</svg>
```

### Bad

```tsx
// Animating layout properties - causes layout thrashing
<div className="transition-all duration-200 hover:w-64 hover:h-64">
  Laggy resize
</div>

// transition-all is wasteful and unpredictable
<button className="transition-all duration-200 hover:bg-blue-600">
  Submit
</button>

// Animating top/left instead of transform
<div className="absolute transition-all duration-200 hover:top-4 hover:left-4">
  Jittery movement
</div>

// Missing transform-origin - unexpected pivot point
<div className="transition-transform hover:scale-150">
  Where does this scale from?
</div>
```
