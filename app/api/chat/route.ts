import { readFileSync } from 'node:fs'
import path from 'node:path'
import { convertToModelMessages, streamText, stepCountIs, tool } from 'ai'
import { groq } from '@ai-sdk/groq'
import { z } from 'zod'
import { searchRegistryComponents } from '@/lib/registry-search'
import type { RegistryChatUIMessage } from '@/demos/ai-sdk-chat/types'

export const maxDuration = 30

const REGISTRY_CHAT_MODEL = 'openai/gpt-oss-120b'

const MAX_MESSAGES = 20
const MAX_CHARS_PER_MESSAGE = 4000

type RegistryItem = { name: string; type: string; description?: string }

// Full installable catalog (components, UI primitives, hooks, theme) so the
// assistant has absolute awareness of what exists — even items without a doc page.
const REGISTRY_CATALOG = (
  JSON.parse(
    readFileSync(path.join(process.cwd(), 'registry.json'), 'utf-8')
  ) as { items: RegistryItem[] }
).items
  .map((item) => {
    const kind = item.type.replace('registry:', '')
    return item.description
      ? `- ${item.name} (${kind}): ${item.description}`
      : `- ${item.name} (${kind})`
  })
  .join('\n')

const SYSTEM_PROMPT = [
  'You are the JOYCO registry assistant.',
  'Help users find and learn about everything in the JOYCO registry.',
  'Always reply in the same language the user writes in (e.g. Spanish in, Spanish out).',
  'You know the full registry catalog (listed below) — use it to answer questions about what exists (components, UI primitives, hooks, themes), including "is there an X?" or "something similar to Y".',
  'When the user wants to find or browse components, call the searchComponents tool with a concise query so the UI can render cards. The tool only returns documented component pages; for UI primitives or items without a page, answer from the catalog in text.',
  'After the tool returns, briefly summarize the matches in one sentence. Do not list them — the UI renders cards.',
  'If nothing matches, say so plainly and suggest a different phrasing.',
  '',
  'Registry catalog:',
  REGISTRY_CATALOG,
].join('\n')

const bodySchema = z.object({
  messages: z.array(z.unknown()).min(1).max(MAX_MESSAGES),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)

  if (!parsed.success) {
    return new Response('Invalid request body', { status: 400 })
  }

  const messages = parsed.data.messages as RegistryChatUIMessage[]

  const tooLong = messages.some((m) =>
    m.parts?.some(
      (p) => p.type === 'text' && p.text.length > MAX_CHARS_PER_MESSAGE
    )
  )
  if (tooLong) return new Response('Message too long', { status: 400 })

  const result = streamText({
    model: groq(REGISTRY_CHAT_MODEL),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(2),
    tools: {
      searchComponents: tool({
        description:
          'Search the JOYCO registry for components matching a natural-language query.',
        inputSchema: z.object({
          query: z.string().describe('What the user is looking for'),
        }),
        execute: async ({ query }) => {
          // Demo-only: Groq resolves near-instantly, so pause briefly to let the
          // "Searching the registry…" shimmer be visible before the cards render.
          await new Promise((resolve) => setTimeout(resolve, 2000))
          return { results: searchRegistryComponents(query) }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      console.error('[api/chat]', error)
      return 'An error occurred.'
    },
  })
}
