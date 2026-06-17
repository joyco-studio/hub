import { convertToModelMessages, streamText, stepCountIs, tool } from 'ai'
import { groq } from '@ai-sdk/groq'
import { z } from 'zod'
import { searchRegistryComponents } from '@/lib/registry-search'
import type { RegistryChatUIMessage } from '@/demos/ai-sdk-chat/types'

export const maxDuration = 30

const REGISTRY_CHAT_MODEL = 'llama-3.3-70b-versatile'

const MAX_MESSAGES = 20
const MAX_CHARS_PER_MESSAGE = 4000

const SYSTEM_PROMPT = [
  'You are the JOYCO registry assistant.',
  'Help users find components in the registry.',
  'When a user describes what they need, call the searchComponents tool with a concise query.',
  'After the tool returns, briefly summarize the matches in one sentence. Do not list them — the UI renders cards.',
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
        execute: async ({ query }) => ({
          results: searchRegistryComponents(query),
        }),
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
