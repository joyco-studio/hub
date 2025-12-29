# Code Duplication

### What

Extract repeated UI patterns with identical Tailwind styling into reusable components instead of copy-pasting them.

### Why

Duplicated styled code blocks become maintenance nightmares and create inconsistency vectors when updates are applied to only some instances.

### Good

```jsx
// Button.jsx
export const Button = ({ children }) => (
  <button className="px-4 py-2 bg-blue-500 text-white rounded">
    {children}
  </button>
);

// Usage
<Button>Save</Button>
<Button>Delete</Button>
```

### Bad

```jsx
// Repeated everywhere
<button className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
<button className="px-4 py-2 bg-blue-500 text-white rounded">Delete</button>
<button className="px-4 py-2 bg-blue-500 text-white rounded">Cancel</button>
```
