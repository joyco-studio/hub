import { convertToModelMessages, streamText, stepCountIs, tool } from 'ai'
import { groq } from '@ai-sdk/groq'
import { z } from 'zod'
import { searchRegistryComponents } from '@/lib/registry-search'
import type { RegistryChatUIMessage } from '@/demos/ai-sdk-chat/types'

export const maxDuration = 30

const REGISTRY_CHAT_MODEL = 'openai/gpt-oss-120b'

const MAX_MESSAGES = 20
const MAX_CHARS_PER_MESSAGE = 4000

const SYSTEM_PROMPT = [
  'You are the JOYCO registry assistant.',
  'Help users find components in the JOYCO registry.',
  'Always reply in the same language the user writes in (e.g. Spanish in, Spanish out).',
  'Whenever the user asks for, describes, or wants to find any component — by name, purpose, or vibe (e.g. "a plane game", "something for video") — you MUST call the searchComponents tool so the UI renders component cards.',
  'Translate the request into a concise English query for the tool.',
  'Never answer with a plain-text list of components — always call searchComponents so the cards are shown.',
  'After the tool returns, add one short sentence summarizing the matches; do not list them in text, the cards already show them.',
  'If nothing matches, say so plainly and suggest a different phrasing.',
].join(' ')

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
