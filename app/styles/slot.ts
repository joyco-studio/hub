import type { PluginAPI } from 'tailwindcss/plugin'

export default function ({ matchVariant }: PluginAPI) {
  matchVariant('slot', (value: string) => `& [data-slot="${value}"]`)
}
