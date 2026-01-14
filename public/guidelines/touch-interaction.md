---
reference: https://registry.joyco.studio/toolbox/pr-guidelines#touch-interaction
---

# Touch & Interaction

### What

- Use `touch-action: manipulation` to prevent double-tap zoom delay
- Set `-webkit-tap-highlight-color` intentionally
- Use `overscroll-behavior: contain` in modals, drawers, and sheets
- During drag operations: disable text selection, use `inert` on dragged elements
- Use `autoFocus` sparingly—desktop only, single primary input; avoid on mobile

### Why

Mobile browsers add a 300ms delay waiting for double-tap zoom. `touch-action: manipulation` removes this delay for a snappier feel. The default tap highlight can look jarring—set it intentionally or disable it. Without `overscroll-behavior: contain`, scrolling to the end of a modal can accidentally scroll the page behind it. Auto-focusing inputs on mobile can cause the keyboard to pop up unexpectedly, pushing content around.

### Good

```tsx
// Fast tap response on interactive elements
<button className="touch-manipulation">
  Tap me
</button>

// Or apply globally in CSS
// button, a, [role="button"] { touch-action: manipulation; }

// Intentional tap highlight (or none)
<button className="[-webkit-tap-highlight-color:transparent]">
  No highlight
</button>

// Modal/drawer with contained scroll
<div
  role="dialog"
  className="fixed inset-0 overflow-auto overscroll-contain"
>
  <DialogContent />
</div>

// Sheet that doesn't scroll the page behind
<div className="fixed bottom-0 inset-x-0 max-h-[80vh] overflow-auto overscroll-contain">
  <SheetContent />
</div>

// Conditional autoFocus - desktop only
<input
  autoFocus={!isMobile}
  placeholder="Search"
/>

// Drag operation setup
<div
  draggable
  onDragStart={() => {
    document.body.classList.add('select-none')
  }}
  onDragEnd={() => {
    document.body.classList.remove('select-none')
  }}
>
  Drag me
</div>
```

### Bad

```tsx
// No touch-action - 300ms delay on tap
<button onClick={handleClick}>
  Slow response
</button>

// Default tap highlight can look jarring
<a href="/page">Link with default blue highlight</a>

// Modal without overscroll containment
<div role="dialog" className="fixed inset-0 overflow-auto">
  {/* Scrolling past end scrolls the page */}
</div>

// AutoFocus on mobile - keyboard pops up immediately
<input autoFocus placeholder="Search" />

// Text selection during drag is annoying
<div draggable>
  Users accidentally select text while dragging
</div>
```
