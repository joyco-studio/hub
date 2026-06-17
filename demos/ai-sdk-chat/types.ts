import type { UIMessage } from 'ai'
import type { RegistryComponentResult } from '@/lib/registry-search'

// The tools the assistant can call, pinned input → output so each tool part
// renders from its own frozen `part.output` (no shared global).
export type RegistryChatTools = {
  searchComponents: {
    input: { query: string }
    output: { results: RegistryComponentResult[] }
  }
}

// This demo uses no metadata and no custom data parts — only a tool.
type NoDataParts = Record<string, never>

export type RegistryChatUIMessage = UIMessage<never, NoDataParts, RegistryChatTools>
