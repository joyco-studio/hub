---
reference: https://registry.joyco.studio/toolbox/pr-guidelines#data-slot-approach
---

# Data Slot Approach

### What

Use `data-slot` attributes to name inner elements instead of exposing multiple `className` props like `titleClassName`, `descriptionClassName`, etc. One `className` prop for the root element is fine.

### Why

Multiple className props clutter component signatures and make the API messier as the component grows. The `data-slot` approach leverages CSS-first styling, keeping props clean while still allowing parent components to style inner elements via the `**:data-[slot=name]` selector.

### Good

```jsx
// Component with data-slot attributes
export function CardLink({ href, title, description, className }) {
  return (
    <Card className={cn('hover:bg-accent/50', className)} asChild>
      <Link href={href}>
        <div data-slot="card-title">
          {title}
          <ArrowRightIcon />
        </div>
        <p data-slot="card-description">{description}</p>
      </Link>
    </Card>
  )
}

// Final Result
<CardLink className="**:data-[slot=card-description]:opacity-50" />
```

### Bad

```jsx
// Multiple className props - clutters the API
export function CardLink({
  href,
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
}) {
  return (
    <Card className={cn('hover:bg-accent/50', className)} asChild>
      <Link href={href}>
        <div className={titleClassName}>
          {title}
          <ArrowRightIcon />
        </div>
        <p className={descriptionClassName}>{description}</p>
      </Link>
    </Card>
  )
}

// Usage
<CardLink titleClassName="font-bold" descriptionClassName="opacity-50" />
```
