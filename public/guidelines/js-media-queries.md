---
reference: https://registry.joyco.studio/toolbox/pr-guidelines#js-media-queries
---

# Avoid JS-Based Media Queries for Initial Render

### What

Never use JavaScript-based media queries (`window.matchMedia`, `useMediaQuery` hooks, or `innerWidth` checks) to determine layout or visibility of elements on initial render. Only use them in components where JavaScript has already loaded and React has fully hydrated.

### Why

During Server-Side Rendering (SSR), the server has no knowledge of the client's viewport size. JavaScript media queries must default to a fallback value (often `false` or a desktop-first assumption), which creates several problems:

1. **Hydration mismatch**: React expects the server-rendered HTML to match the initial client render. When the client hydrates with a different viewport result, React detects a mismatch, potentially causing rendering errors or forcing a full re-render.

2. **Layout shift (CLS)**: Users see content "jump" as elements resize, reposition, or toggle visibility after hydration. This hurts Core Web Vitals scores and creates a jarring user experience.

3. **Flash of incorrect content (FOUC)**: On slower connections or devices, users may see the wrong layout for several hundred milliseconds before JavaScript executes and corrects it. A mobile user might briefly see a desktop layout, or vice versa.

CSS media queries don't have this problem—they're evaluated by the browser immediately when parsing CSS, before any JavaScript runs, ensuring consistent rendering from the very first paint.

### Good

```tsx
// CSS-based responsive behavior - works correctly with SSR
export function Navigation() {
  return (
    <nav>
      {/* Desktop nav - hidden on mobile via CSS */}
      <div className="hidden md:flex gap-4">
        <NavLinks />
      </div>

      {/* Mobile menu button - hidden on desktop via CSS */}
      <MobileMenuButton className="flex md:hidden" />
    </nav>
  )
}

// JS media query is acceptable here because the modal
// only renders after user interaction (click), well after hydration
export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  // This is fine - component only matters after user clicks
  if (!isOpen) return null

  return <MobileMenuContent variant={isMobile ? 'fullscreen' : 'sidebar'} />
}
```

### Bad

```tsx
// JS-based responsive behavior - causes layout shift and hydration issues
export function Navigation() {
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Server renders with isMobile=false (fallback)
  // Client hydrates with isMobile=true on mobile devices
  // Result: layout shift, hydration mismatch, flash of wrong content
  return (
    <nav>
      {isMobile ? (
        <MobileMenuButton />
      ) : (
        <div className="flex gap-4">
          <NavLinks />
        </div>
      )}
    </nav>
  )
}
```

### When JS Media Queries Are Acceptable

- **After user interaction**: Modals, dropdowns, and tooltips that only render after a click or hover.
- **Client-only components**: Components explicitly lazy-loaded or rendered after hydration (behind `useEffect` or `Suspense`).
- **Non-visual logic**: Analytics, feature flags, or behavior that doesn't affect the rendered layout.

```tsx
// Safe pattern: guard with hydration check for unavoidable cases
const [isHydrated, setIsHydrated] = useState(false)
useEffect(() => setIsHydrated(true), [])

const isMobile = useMediaQuery('(max-width: 768px)')

// Only use the JS result after hydration; render both variants via CSS first
const effectiveIsMobile = isHydrated ? isMobile : undefined
```
