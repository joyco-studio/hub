'use client'

import * as React from 'react'
import { PackageManagerCommand } from '@/components/package-manager-command'
import {
  BoldIcon,
  CopyIcon,
  ItalicIcon,
  MailIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  SettingsIcon,
  ShareIcon,
  TrashIcon,
  UnderlineIcon,
  UserIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { ButtonGroup } from '@/components/ui/button-group'
import { Separator } from '@/components/ui/separator'

const themeColors = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'border',
  'input',
  'ring',
] as const

const chartColors = [
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
] as const

const brandColors = [
  { name: 'joyco-blue', var: '--color-joyco-blue' },
  { name: 'mustard-yellow', var: '--color-mustard-yellow' },
  { name: 'mint-green', var: '--color-mint-green' },
] as const

function Section({
  title,
  registryName,
  children,
}: {
  title: string
  registryName?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col">
      <h2>{title}</h2>
      <div className="not-prose bg-preview text-preview-foreground flex flex-col gap-8 overflow-clip p-6">
        {children}
      </div>
      {registryName && (
        <PackageManagerCommand
          pnpm={`pnpm dlx shadcn@latest add @joyco/${registryName}`}
          npm={`npx shadcn@latest add @joyco/${registryName}`}
          yarn={`npx shadcn@latest add @joyco/${registryName}`}
          bun={`bunx --bun shadcn@latest add @joyco/${registryName}`}
        />
      )}
    </section>
  )
}

function SubSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-muted-foreground font-mono text-sm tracking-wide uppercase">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Labeled({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-muted-foreground font-mono text-[11px] tracking-wide uppercase">
        {label}
      </span>
      {children}
    </div>
  )
}

function ColorSwatch({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="border-border size-12 rounded-sm border"
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <span className="text-muted-foreground font-mono text-[10px] leading-tight">
        {name}
      </span>
    </div>
  )
}

export default function UIKit() {
  const [collapsibleOpen, setCollapsibleOpen] = React.useState(false)

  return (
    <div className="bg-background text-foreground flex flex-col gap-22">
      <PackageManagerCommand
        pnpm="pnpm dlx shadcn@latest add @joyco/ui"
        npm="npx shadcn@latest add @joyco/ui"
        yarn="npx shadcn@latest add @joyco/ui"
        bun="bunx --bun shadcn@latest add @joyco/ui"
      />

      {/* ── Button ── */}
      <Section title="Button" registryName="button">
        <SubSection title="Variants">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="muted">Muted</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </SubSection>

        <SubSection title="Sizes">
          <div className="flex flex-wrap items-start gap-4">
            <Labeled label="sm">
              <Button size="sm">Small</Button>
            </Labeled>
            <Labeled label="default">
              <Button size="default">Default</Button>
            </Labeled>
            <Labeled label="lg">
              <Button size="lg">Large</Button>
            </Labeled>
            <Labeled label="icon">
              <Button size="icon" aria-label="Settings">
                <SettingsIcon />
              </Button>
            </Labeled>
            <Labeled label="icon-sm">
              <Button size="icon-sm" aria-label="Copy">
                <CopyIcon />
              </Button>
            </Labeled>
          </div>
        </SubSection>

        <SubSection title="With Icons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>
              <MailIcon /> Send Email
            </Button>
            <Button variant="outline">
              <PlusIcon /> New Item
            </Button>
            <Button variant="destructive">
              <TrashIcon /> Delete
            </Button>
          </div>
        </SubSection>
      </Section>

      {/* ── Badge ── */}
      <Section title="Badge" registryName="badge">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="muted">Muted</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="key">Key</Badge>
        </div>
      </Section>

      {/* ── Input ── */}
      <Section title="Input" registryName="input">
        <div className="flex max-w-sm flex-col gap-4">
          <Labeled label="default">
            <Input placeholder="Default input" />
          </Labeled>
          <Labeled label="disabled">
            <Input placeholder="Disabled" disabled />
          </Labeled>
          <Labeled label="invalid">
            <Input type="email" placeholder="Email" aria-invalid="true" />
          </Labeled>
        </div>
      </Section>

      {/* ── Textarea ── */}
      <Section title="Textarea" registryName="textarea">
        <div className="max-w-sm">
          <Textarea placeholder="Write something…" rows={3} />
        </div>
      </Section>

      {/* ── Select ── */}
      <Section title="Select" registryName="select">
        <div className="max-w-sm">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Choose a framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="next">Next.js</SelectItem>
              <SelectItem value="remix">Remix</SelectItem>
              <SelectItem value="astro">Astro</SelectItem>
              <SelectItem value="nuxt">Nuxt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      {/* ── Tabs ── */}
      <Section title="Tabs" registryName="tabs">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent
            value="overview"
            className="text-muted-foreground mt-4 text-sm"
          >
            Overview content goes here.
          </TabsContent>
          <TabsContent
            value="analytics"
            className="text-muted-foreground mt-4 text-sm"
          >
            Analytics dashboard content.
          </TabsContent>
          <TabsContent
            value="settings"
            className="text-muted-foreground mt-4 text-sm"
          >
            Settings panel content.
          </TabsContent>
        </Tabs>
      </Section>

      {/* ── Switch ── */}
      <Section title="Switch" registryName="switch">
        <div className="flex items-end gap-6">
          <Labeled label="default">
            <Switch id="switch-default" />
          </Labeled>
          <Labeled label="checked">
            <Switch id="switch-checked" defaultChecked />
          </Labeled>
          <Labeled label="sm">
            <Switch id="switch-sm" size="sm" />
          </Labeled>
          <Labeled label="disabled">
            <Switch id="switch-disabled" disabled />
          </Labeled>
        </div>
      </Section>

      {/* ── Slider ── */}
      <Section title="Slider" registryName="slider">
        <div className="flex max-w-sm flex-col gap-5">
          <Labeled label="single">
            <Slider defaultValue={[40]} max={100} aria-label="Volume" />
          </Labeled>
          <Labeled label="range">
            <Slider defaultValue={[25, 75]} max={100} aria-label="Range" />
          </Labeled>
        </div>
      </Section>

      {/* ── Card ── */}
      <Section title="Card" registryName="card">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Project Setup</CardTitle>
            <CardDescription>
              Configure your project settings and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Input placeholder="Project name" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="next">Next.js</SelectItem>
                  <SelectItem value="remix">Remix</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Create</Button>
          </CardFooter>
        </Card>
      </Section>

      {/* ── Avatar ── */}
      <Section title="Avatar" registryName="avatar">
        <div className="flex items-end gap-4">
          <Labeled label="with image">
            <Avatar>
              <AvatarImage
                src="https://r2.joyco.studio/qykHGCJ16OXi.png"
                alt="User"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Labeled>
          <Labeled label="fallback">
            <Avatar>
              <AvatarFallback>JC</AvatarFallback>
            </Avatar>
          </Labeled>
          <Labeled label="large">
            <Avatar className="size-12">
              <AvatarFallback className="text-lg">MP</AvatarFallback>
            </Avatar>
          </Labeled>
        </div>
      </Section>

      {/* ── Tooltip ── */}
      <Section title="Tooltip" registryName="tooltip">
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Settings">
                <SettingsIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Share">
                <ShareIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share</TooltipContent>
          </Tooltip>
        </div>
      </Section>

      {/* ── Popover ── */}
      <Section title="Popover" registryName="popover">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open Popover</Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Dimensions</p>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Width" />
                <Input placeholder="Height" />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </Section>

      {/* ── Dropdown Menu ── */}
      <Section title="Dropdown Menu" registryName="dropdown-menu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SettingsIcon /> Settings
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ShareIcon /> Share
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Copy Link</DropdownMenuItem>
                <DropdownMenuItem>Email</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <TrashIcon /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Section>

      {/* ── Collapsible ── */}
      <Section title="Collapsible" registryName="collapsible">
        <Collapsible open={collapsibleOpen} onOpenChange={setCollapsibleOpen}>
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                {collapsibleOpen ? 'Hide' : 'Show'} Details
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-3">
            <div className="bg-muted rounded-md p-4 text-sm">
              This content is revealed when the collapsible is open. It supports
              animated enter/exit transitions.
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Section>

      {/* ── Kbd ── */}
      <Section title="Kbd" registryName="kbd">
        <div className="flex flex-wrap items-center gap-4">
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>P</Kbd>
          </KbdGroup>
          <Kbd>Enter</Kbd>
          <Kbd>Esc</Kbd>
        </div>
      </Section>

      {/* ── Input Group ── */}
      <Section title="Input Group" registryName="input-group">
        <div className="flex max-w-md flex-col gap-4">
          <Labeled label="with icon addon">
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <SearchIcon className="text-muted-foreground size-4" />
              </InputGroupAddon>
              <InputGroupInput placeholder="Search…" />
            </InputGroup>
          </Labeled>
          <Labeled label="with button addon">
            <InputGroup>
              <InputGroupInput placeholder="Type a message…" />
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-sm" aria-label="Send">
                  <SendIcon />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Labeled>
        </div>
      </Section>

      {/* ── Button Group ── */}
      <Section title="Button Group" registryName="button-group">
        <div className="flex flex-wrap items-end gap-6">
          <Labeled label="icon buttons">
            <ButtonGroup>
              <Button variant="outline" size="icon" aria-label="Bold">
                <BoldIcon />
              </Button>
              <Button variant="outline" size="icon" aria-label="Italic">
                <ItalicIcon />
              </Button>
              <Button variant="outline" size="icon" aria-label="Underline">
                <UnderlineIcon />
              </Button>
            </ButtonGroup>
          </Labeled>
          <Labeled label="text buttons">
            <ButtonGroup>
              <Button variant="outline">Copy</Button>
              <Button variant="outline">Cut</Button>
              <Button variant="outline">Paste</Button>
            </ButtonGroup>
          </Labeled>
        </div>
      </Section>

      {/* ── Separator ── */}
      <Section title="Separator" registryName="separator">
        <div className="flex flex-col gap-6">
          <Labeled label="horizontal">
            <Separator />
          </Labeled>
          <Labeled label="brackets">
            <Separator brackets />
          </Labeled>
          <Labeled label="vertical">
            <div className="flex h-8 items-center gap-4">
              <span className="text-sm">Item A</span>
              <Separator orientation="vertical" />
              <span className="text-sm">Item B</span>
              <Separator orientation="vertical" />
              <span className="text-sm">Item C</span>
            </div>
          </Labeled>
        </div>
      </Section>

      {/* ── Typography ── */}
      <Section title="Typography">
        <SubSection title="Public Sans (sans)">
          <div className="flex flex-col gap-3">
            <p className="text-4xl font-bold">The quick brown fox</p>
            <p className="text-2xl font-semibold">jumps over the lazy dog</p>
            <p className="text-xl font-medium">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
            </p>
            <p className="text-base">
              The five boxing wizards jump quickly. Pack my box with five dozen
              liquor jugs.
            </p>
            <p className="text-muted-foreground text-sm">
              Regular · Medium · Semibold · Bold
            </p>
          </div>
        </SubSection>

        <SubSection title="Roboto Mono (mono)">
          <div className="flex flex-col gap-3 font-mono">
            <p className="text-2xl font-bold">The quick brown fox</p>
            <p className="text-lg font-medium">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
            </p>
            <p className="text-base">
              const result = await fetch(&#39;/api/data&#39;)
            </p>
            <p className="text-muted-foreground text-sm">
              console.log(&#39;Hello, World!&#39;)
            </p>
          </div>
        </SubSection>

        <SubSection title="Tabular Nums">
          <div
            className="flex flex-col gap-1 font-mono text-sm"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            <span>1,234.56</span>
            <span>12,345.67</span>
            <span>123,456.78</span>
          </div>
        </SubSection>
      </Section>

      {/* ── Theme ── */}
      <Section title="Theme">
        <SubSection title="Semantic Colors">
          <div className="flex flex-wrap gap-4">
            {themeColors.map((color) => (
              <ColorSwatch key={color} name={color} cssVar={`--${color}`} />
            ))}
          </div>
        </SubSection>

        <SubSection title="Chart Colors">
          <div className="flex flex-wrap gap-4">
            {chartColors.map((color) => (
              <ColorSwatch key={color} name={color} cssVar={`--${color}`} />
            ))}
          </div>
        </SubSection>

        <SubSection title="Brand Colors">
          <div className="flex flex-wrap gap-4">
            {brandColors.map((color) => (
              <ColorSwatch
                key={color.name}
                name={color.name}
                cssVar={color.var}
              />
            ))}
          </div>
        </SubSection>
      </Section>
    </div>
  )
}
