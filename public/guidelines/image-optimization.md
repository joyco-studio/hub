---
reference: https://registry.joyco.studio/toolbox/pr-guidelines#image-optimization
---

# Image Optimization

### What

- `<img>` elements need explicit `width` and `height` attributes (prevents CLS)
- Below-fold images: use `loading="lazy"`
- Above-fold critical images: use `priority` (Next.js) or `fetchpriority="high"`

### Why

Without explicit dimensions, the browser doesn't know how much space to reserve for an image until it loads. This causes Cumulative Layout Shift (CLS)—content jumps around as images pop in, which hurts Core Web Vitals scores and creates a poor user experience. Lazy loading defers off-screen images, improving initial page load. Priority hints ensure critical images load first.

### Good

```tsx
// Always include width and height
<img
  src="/hero.jpg"
  alt="Hero banner"
  width={1200}
  height={600}
/>

// Next.js Image with priority for above-fold
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero banner"
  width={1200}
  height={600}
  priority
/>

// Lazy load below-fold images
<img
  src="/gallery-1.jpg"
  alt="Gallery image"
  width={400}
  height={300}
  loading="lazy"
/>

// Native img with fetchpriority for critical images
<img
  src="/logo.svg"
  alt="Company logo"
  width={120}
  height={40}
  fetchpriority="high"
/>
```

### Bad

```tsx
// Missing dimensions - causes layout shift
<img src="/hero.jpg" alt="Hero banner" />

// Missing alt text
<img src="/hero.jpg" width={1200} height={600} />

// All images lazy loaded - hurts LCP for above-fold
<img src="/hero.jpg" alt="Hero" width={1200} height={600} loading="lazy" />

// Only width or height - still causes CLS
<img src="/hero.jpg" alt="Hero" width={1200} />
```
