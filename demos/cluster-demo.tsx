'use client'

import { PresentationIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Cluster, Filler } from '@/components/ui/cluster'
import { Kbd } from '@/components/ui/kbd'
import { SearchIcon } from 'lucide-react'

export default function ClusterDemo() {
  return (
    <div className="flex flex-col gap-10 p-6">
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground font-mono text-xs tracking-wide uppercase">
          Row with Filler
        </span>
        <Cluster className="max-w-sm items-stretch">
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="text-sm font-medium">Project Setup</span>
          </div>
          <div className="bg-fd-background flex flex-1 items-center justify-end px-2">
            <Badge variant="accent">Draft</Badge>
          </div>
        </Cluster>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground font-mono text-xs tracking-wide uppercase">
          Column layout
        </span>
        <Cluster
          direction="col"
          align="stretch"
          className="max-w-sm"
          bg="muted"
        >
          <div className="p-3 pt-2">
            <span className="text-sm font-medium">Project Setup</span>
            <p className="text-muted-foreground text-sm">
              Configure your project settings and preferences.
            </p>
          </div>
          <label className="focus-within:bg-accent/70 flex items-center gap-3 p-3">
            <PresentationIcon className="text-muted-foreground size-4 shrink-0" />
            <input
              placeholder="Project name"
              className="min-w-0 text-sm outline-none"
            />
          </label>
          <Cluster bg="muted">
            <Filler />
            <Button variant="secondary" className="rounded-none">
              Cancel
            </Button>
            <Button className="rounded-none">Create</Button>
          </Cluster>
        </Cluster>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground font-mono text-xs tracking-wide uppercase">
          Input variant (sidebar pattern)
        </span>
        <Cluster direction="col" align="stretch" className="h-48 max-w-sm">
          <label className="focus-within:bg-accent/70 flex h-10 items-center gap-3 px-3">
            <SearchIcon className="text-muted-foreground size-4 shrink-0" />
            <input
              type="text"
              placeholder="Search"
              className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent font-mono text-sm tracking-wide uppercase outline-none"
            />
            <Kbd className="h-[2em] rounded-none px-2">⌘K</Kbd>
          </label>
          <Filler />
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="text-muted-foreground text-sm">Footer</span>
          </div>
        </Cluster>
      </div>
    </div>
  )
}
