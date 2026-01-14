---
reference: https://registry.joyco.studio/toolbox/pr-guidelines#content-overflow
---

# Content Overflow

### What

- Text containers must handle long content: use `truncate`, `line-clamp-*`, or `break-words`
- Flex children need `min-w-0` to allow text truncation
- Handle empty states—don't render broken UI for empty strings/arrays
- Anticipate user-generated content of all lengths: short, average, and very long

### Why

Real-world data is unpredictable. User names can be 2 characters or 50. Titles can be a word or a paragraph. Without proper overflow handling, long content breaks layouts, overflows containers, or causes horizontal scrolling. The `min-w-0` rule is particularly important—flex items have `min-width: auto` by default, which prevents them from shrinking below their content width.

### Good

```tsx
// Truncate single line
<p className="truncate">{user.name}</p>

// Clamp to multiple lines
<p className="line-clamp-3">{post.description}</p>

// Break long words (URLs, hashes, etc.)
<code className="break-all">{transactionHash}</code>

// Flex child with min-w-0 for truncation
<div className="flex items-center gap-2">
  <Avatar />
  <span className="min-w-0 truncate">{user.displayName}</span>
</div>

// Handle empty state
{items.length > 0 ? (
  <ItemList items={items} />
) : (
  <EmptyState message="No items found" />
)}

// Handle potentially missing/empty string
<h2>{title || 'Untitled'}</h2>
```

### Bad

```tsx
// No overflow handling - breaks on long content
<p>{user.biography}</p>

// Flex without min-w-0 - truncate won't work
<div className="flex items-center gap-2">
  <Avatar />
  <span className="truncate">{user.displayName}</span>
</div>

// Missing empty state - renders empty container or crashes
{items.map(item => <Item key={item.id} {...item} />)}

// Renders broken UI with empty string
<h2>{title}</h2>  // Shows nothing, may break layout
```
