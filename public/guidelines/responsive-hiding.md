---
reference: https://registry.joyco.studio/toolbox/pr-guidelines#responsive-hiding
---

# Responsive Hiding with max-* Variants

### What

Use Tailwind's `max-{breakpoint}` variants with `hidden` to hide elements below specific breakpoints, while keeping the default display value intact (e.g., `flex max-sm:hidden`).

### Why

When you use `hidden sm:flex`, the base state is `hidden`. Consumers might override this with their own classes, not realizing the component is hidden by default. They might add `className="flex"` thinking they're just setting display, but they're actually fighting the responsive behavior.

Using `flex max-sm:hidden` keeps the natural display as the default. The component is visible by default and only hidden on small screens. This makes the API more predictable and prevents accidental overrides.

### Good

```tsx
// Desktop nav - visible by default, hidden on mobile
<nav className="flex max-md:hidden items-center gap-4">
  <NavLinks />
</nav>

// Mobile menu button - visible by default, hidden on desktop
<button className="flex md:max-[0px]:hidden items-center">
  <MenuIcon />
</button>

// Or more simply for "show only on mobile"
<button className="md:hidden flex items-center">
  <MenuIcon />
</button>

// Sidebar - visible on desktop, hidden on mobile
<aside className="w-64 max-lg:hidden">
  <SidebarContent />
</aside>
```

### Bad

```tsx
// Base is hidden - consumers might accidentally override
<nav className="hidden md:flex items-center gap-4">
  <NavLinks />
</nav>

// If consumer does this, they break the responsive behavior:
<Navigation className="flex" />  // Now it's always visible

// Confusing chain of overrides
<div className="hidden sm:block md:hidden lg:block">
  Hard to reason about
</div>
```

### When to Use Each Pattern

- `flex max-md:hidden` → "Show by default, hide on mobile"
- `md:hidden` → "Show only on mobile" (this is fine because base is visible)
- `hidden md:flex` → Avoid this pattern when the component accepts className
