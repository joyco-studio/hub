---
reference: https://registry.joyco.studio/toolbox/pr-guidelines#accessibility-basics
---

# Accessibility Basics

### What

Follow these core accessibility rules for interactive elements:

- Icon-only buttons need `aria-label`
- Form controls need `<label>` or `aria-label`
- Interactive elements need keyboard handlers (`onKeyDown`/`onKeyUp`)
- Use `<button>` for actions, `<a>`/`<Link>` for navigation (not `<div onClick>`)
- Images need `alt` (or `alt=""` if decorative)
- Decorative icons need `aria-hidden="true"`

### Why

Accessibility isn't optional—it ensures everyone can use your interface, including users with screen readers, keyboard-only navigation, and other assistive technologies. Proper semantic HTML also improves SEO and makes your code more maintainable.

### Good

```tsx
// Icon button with aria-label
<button aria-label="Close dialog" onClick={onClose}>
  <XIcon aria-hidden="true" />
</button>

// Proper navigation vs action distinction
<Link href="/settings">Settings</Link>
<button onClick={handleSave}>Save Changes</button>

// Form with proper labeling
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Or using aria-label for icon inputs
<input aria-label="Search" type="search" />

// Image with alt text
<img src="/avatar.jpg" alt="User profile photo" width={40} height={40} />

// Decorative image
<img src="/pattern.svg" alt="" aria-hidden="true" />
```

### Bad

```tsx
// Icon button without label - screen readers can't identify it
<button onClick={onClose}>
  <XIcon />
</button>

// Div with click handler instead of semantic button
<div onClick={handleSave} className="cursor-pointer">
  Save Changes
</div>

// Link used for action instead of navigation
<a onClick={handleDelete}>Delete</a>

// Input without label
<input type="email" placeholder="Email" />

// Image without alt text
<img src="/avatar.jpg" />
```
