import type { UIMessage } from 'ai'
import type { RegistrySearchResult } from '@/lib/registry-search'

export type RegistryChatTools = {
  searchComponents: {
    input: { query: string }
    output: { results: RegistrySearchResult[] }
  }
}

type NoDataParts = Record<string, never>

export type RegistryChatUIMessage = UIMessage<
  never,
  NoDataParts,
  RegistryChatTools
>
