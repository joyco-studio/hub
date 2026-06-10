# JOYCO UI Kit

> Skill: Building interfaces with the JOYCO design system — a bento/console-style component library built on shadcn/ui with Radix primitives and Tailwind CSS.

## Installation

Install the full UI kit:

```bash
pnpm dlx shadcn@latest add @joyco/ui
```

Or install individual components:

```bash
pnpm dlx shadcn@latest add @joyco/button
```

## Design philosophy

JOYCO interfaces are **modular and bento-like**. Every piece of UI is a discrete block that snaps together with tight gaps — like a console dashboard or a hardware panel. This drives two core rules:

1. **No loose spacing.** Never use `justify-between`, `justify-end`, or large gaps/margins to push elements apart. Instead, use `<Filler />` — a visible, decorative spacer that fills remaining space with the cluster's background color. Dead space is always intentional and styled.

2. **No conventional cards.** Don't wrap content in a `<div>` with `bg-*` + `p-*` to create a "card" look. Use `<Cluster>` — a transparent flex container whose *children* inherit a shared background via CSS custom property. The Cluster itself has no visual weight; each child owns its own appearance.

The base gap between elements is `--gap: 0.25rem` (4px). This tight spacing is what gives JOYCO interfaces their dense, modular feel. Use `gap-gap` in Tailwind to reference it.

## Cluster & Filler (layout primitives)

These are the most important components in the system — they replace conventional flex layouts.

### Cluster

A transparent flex container. Children inherit a shared background color.

```tsx
import { Cluster, Filler } from '@/components/ui/cluster'
```

**Props:**

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `direction` | `'row'` \| `'col'` | `'row'` | Flex direction |
| `align` | `'start'` \| `'center'` \| `'end'` \| `'stretch'` \| `'baseline'` | `'center'` | Align items |
| `wrap` | `boolean` | `false` | Flex wrap |
| `bg` | `'muted'` \| `'accent'` | `'muted'` | Background color applied to children via `--cluster-bg` |
| `display` | `'flex'` \| `'inline-flex'` | `'flex'` | Display type |
| `asChild` | `boolean` | `false` | Merge props onto child element |

**How it works:** Cluster sets `--cluster-bg` on itself, and a global CSS rule propagates it:

```css
:where([data-slot='cluster'] > *) {
  background-color: var(--cluster-bg, transparent);
}
```

Children get the background automatically. The gap between them (`gap-gap`, 4px) reveals the page background underneath, creating the bento grid effect.

### Filler

A decorative spacer with `flex-1`. It takes up remaining space and receives the cluster's background — making it a visible element, not empty whitespace.

```tsx
<Cluster>
  <span className="p-3 text-sm font-medium">Title</span>
  <Filler />
  <Button>Action</Button>
</Cluster>
```

Filler has `role="presentation"` and `aria-hidden="true"` — it is purely visual.

**Rule: anywhere you would use `justify-between` or `justify-end`, use `<Filler />` instead.**

### Layout examples

Row with title and action:

```tsx
<Cluster>
  <div className="flex items-center gap-2 px-3 py-2">
    <span className="text-sm font-medium">Project Setup</span>
  </div>
  <Filler />
  <Badge variant="accent">Draft</Badge>
</Cluster>
```

Column form layout:

```tsx
<Cluster direction="col" align="stretch" bg="muted">
  <div className="p-3 pt-2">
    <span className="text-sm font-medium">Project Setup</span>
    <p className="text-muted-foreground text-sm">Configure your project settings.</p>
  </div>
  <label className="focus-within:bg-accent/70 flex items-center gap-3 p-3">
    <PresentationIcon className="text-muted-foreground size-4 shrink-0" />
    <input placeholder="Project name" className="min-w-0 text-sm outline-none" />
  </label>
  <Cluster bg="muted">
    <Filler />
    <Button variant="secondary">Cancel</Button>
    <Button>Create</Button>
  </Cluster>
</Cluster>
```

## Components reference

All components use `data-slot` attributes for CSS targeting. Style internals from the parent with `**:data-[slot=name]:styles` — avoid multiple className props.

### Button

```tsx
import { Button } from '@/components/ui/button'
```

**Variants:** `default` | `secondary` | `muted` | `accent` | `outline` | `ghost` | `destructive` | `link`

**Sizes:** `default` (h-9) | `sm` (h-8) | `lg` (h-10) | `icon` (size-9) | `icon-sm` (size-8) | `icon-lg` (size-10)

```tsx
<Button variant="default">Save</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button size="icon" aria-label="Settings"><SettingsIcon /></Button>
<Button variant="destructive"><TrashIcon /> Delete</Button>
```

Icon-only buttons always need `aria-label`. Icons auto-size to `size-4` unless they have an explicit `size-*` class.

### Badge

```tsx
import { Badge } from '@/components/ui/badge'
```

**Variants:** `default` | `secondary` | `muted` | `accent` | `card` | `outline` | `destructive` | `key`

**Sizes:** `default` | `sm`

Badges have sliced corners by default (clip-path). Disable with `slicedCorners={false}`. Text is monospace, uppercase, with tight tracking.

```tsx
<Badge variant="accent">New</Badge>
<Badge variant="key">⌘K</Badge>
```

### Input

```tsx
import { Input } from '@/components/ui/input'
```

Standard text input with border, focus ring, and dark mode tint. Use correct `type` attributes (`email`, `tel`, `url`, `number`).

```tsx
<Input placeholder="Email address" type="email" />
<Input placeholder="Disabled" disabled />
<Input placeholder="Invalid" aria-invalid="true" />
```

### InputGroup

```tsx
import {
  InputGroup, InputGroupAddon, InputGroupButton,
  InputGroupInput, InputGroupText
} from '@/components/ui/input-group'
```

Composable input with addons. The group manages a unified focus ring.

```tsx
<InputGroup>
  <InputGroupAddon align="inline-start">
    <SearchIcon className="text-muted-foreground size-4" />
  </InputGroupAddon>
  <InputGroupInput placeholder="Search..." />
</InputGroup>

<InputGroup>
  <InputGroupInput placeholder="Type a message..." />
  <InputGroupAddon align="inline-end">
    <InputGroupButton size="icon-sm" aria-label="Send">
      <SendIcon />
    </InputGroupButton>
  </InputGroupAddon>
</InputGroup>
```

### ButtonGroup

```tsx
import { ButtonGroup } from '@/components/ui/button-group'
```

Groups adjacent buttons, removing internal borders. Supports `orientation="horizontal"` (default) or `"vertical"`.

```tsx
<ButtonGroup>
  <Button variant="outline" size="icon" aria-label="Bold"><BoldIcon /></Button>
  <Button variant="outline" size="icon" aria-label="Italic"><ItalicIcon /></Button>
</ButtonGroup>
```

### Textarea

```tsx
import { Textarea } from '@/components/ui/textarea'
```

Uses `field-sizing: content` for auto-height based on content.

```tsx
<Textarea placeholder="Write something..." rows={3} />
```

### Select

```tsx
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
```

Radix-based select with portal dropdown.

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Choose a framework" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="next">Next.js</SelectItem>
    <SelectItem value="remix">Remix</SelectItem>
    <SelectItem value="astro">Astro</SelectItem>
  </SelectContent>
</Select>
```

### Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
```

Triggers are monospace, uppercase, with active state via `data-[state=active]`.

```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview content.</TabsContent>
  <TabsContent value="settings">Settings content.</TabsContent>
</Tabs>
```

### Switch

```tsx
import { Switch } from '@/components/ui/switch'
```

**Sizes:** `default` | `sm`

```tsx
<Switch id="notifications" />
<Switch id="compact" size="sm" />
```

### Slider

```tsx
import { Slider } from '@/components/ui/slider'
```

Supports single value and range (pass array to `defaultValue`). Thumb is a narrow 1.5-wide bar.

```tsx
<Slider defaultValue={[40]} max={100} aria-label="Volume" />
<Slider defaultValue={[25, 75]} max={100} aria-label="Price range" />
```

### Separator

```tsx
import { Separator } from '@/components/ui/separator'
```

**Props:** `orientation` (`horizontal` | `vertical`), `brackets` (boolean — decorative bracket endpoints), `align` (`top` | `center` | `bottom`), `thickness` (number, default 2).

```tsx
<Separator />
<Separator brackets />
<div className="flex h-8 items-center gap-4">
  <span>Item A</span>
  <Separator orientation="vertical" />
  <span>Item B</span>
</div>
```

### Kbd

```tsx
import { Kbd, KbdGroup } from '@/components/ui/kbd'
```

Keyboard shortcut indicators. Monospace, uppercase, with border and shadow.

```tsx
<KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>
<Kbd>Enter</Kbd>
```

### Avatar

```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
```

```tsx
<Avatar>
  <AvatarImage src="/avatar.png" alt="User" />
  <AvatarFallback>JC</AvatarFallback>
</Avatar>
```

### Tooltip

```tsx
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
```

Zero-delay by default. Inverted colors (`bg-foreground text-background`).

```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button size="icon" aria-label="Settings"><SettingsIcon /></Button>
  </TooltipTrigger>
  <TooltipContent>Settings</TooltipContent>
</Tooltip>
```

### Popover

```tsx
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
```

Backdrop blur with `bg-popover/60 backdrop-blur-lg`.

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open</Button>
  </PopoverTrigger>
  <PopoverContent>
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">Settings</p>
      <Input placeholder="Name" />
    </div>
  </PopoverContent>
</Popover>
```

### DropdownMenu

```tsx
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
```

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem><UserIcon /> Profile</DropdownMenuItem>
    <DropdownMenuItem><SettingsIcon /> Settings</DropdownMenuItem>
    <DropdownMenuSub>
      <DropdownMenuSubTrigger><ShareIcon /> Share</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem>Copy Link</DropdownMenuItem>
        <DropdownMenuItem>Email</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive"><TrashIcon /> Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Collapsible

```tsx
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
```

Animated expand/collapse.

```tsx
<Collapsible>
  <CollapsibleTrigger asChild>
    <Button variant="outline" size="sm">Toggle</Button>
  </CollapsibleTrigger>
  <CollapsibleContent className="mt-3">
    <div className="bg-muted rounded-md p-4 text-sm">
      Expandable content with enter/exit animations.
    </div>
  </CollapsibleContent>
</Collapsible>
```

## Theme

JOYCO uses OKLch color space. Key semantic tokens:

| Token | Purpose |
|-------|---------|
| `background` / `foreground` | Page base |
| `primary` / `primary-foreground` | Brand color (purple-blue) for CTAs |
| `secondary` / `secondary-foreground` | Secondary actions |
| `muted` / `muted-foreground` | Subdued surfaces and text |
| `accent` / `accent-foreground` | Highlighted surfaces |
| `destructive` | Danger/delete actions |
| `border` | Borders |
| `input` | Input borders |
| `ring` | Focus rings |
| `card` / `popover` | Elevated surfaces |

**Typography:** Public Sans (sans), Roboto Mono (mono). Headings use decreasing letter-spacing. Use `font-mono uppercase tracking-wide` for labels and badges.

**Focus states:** All interactive elements use `focus-visible:ring-ring/50 focus-visible:ring-[3px]`. Never remove outlines without a focus replacement.

## Styling conventions

- **Single `className` on root:** Components accept one `className` prop. Style internals from outside using `data-slot` selectors.
- **`data-slot` attributes:** Every component part has a `data-slot` (e.g., `data-slot="button"`, `data-slot="badge"`, `data-slot="cluster"`). Target with `**:data-[slot=button]:bg-red-500`.
- **`data-variant` and `data-size`:** Buttons expose these for conditional parent styling.
- **Responsive hiding:** Use `max-{breakpoint}:hidden` instead of hiding by default and showing at larger breakpoints.
- **Hover states:** Every interactive element needs a `hover:` state. Use `hocus:` (custom variant for `:hover` + `:focus-visible` combined) where available.
