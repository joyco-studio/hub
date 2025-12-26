/**
 * External Registry Configuration
 *
 * Define external registry components that will:
 * 1. Appear in the sidebar alongside regular components
 * 2. Redirect to the external registry when clicked
 *
 * This provides a way to curate and showcase components from other registries
 * while giving proper credit to the original authors.
 */

export interface ExternalRegistry {
  /** Unique identifier for the registry */
  id: string
  /** Display name of the registry */
  name: string
  /** Base URL of the registry documentation */
  baseUrl: string
  /** Optional description of the registry */
  description?: string
}

export interface ExternalComponent {
  /** URL-friendly slug for the component (used in local routing) */
  slug: string
  /** Display title of the component */
  title: string
  /** Description of what the component does */
  description: string
  /** The registry this component belongs to */
  registry: string
  /** Full URL to the component's documentation page */
  externalUrl: string
  /**
   * Full URL to the component's registry JSON file.
   * This enables installation via your registry domain:
   * `npx shadcn@latest add https://registry.joyco.studio/r/{slug}.json`
   * which redirects to this URL.
   */
  externalRegistryUrl: string
  /** Optional tags/categories */
  tags?: string[]
}

/**
 * Registry definitions - add new external registries here
 */
export const externalRegistries: ExternalRegistry[] = [
  {
    id: 'diceui',
    name: 'Dice UI',
    baseUrl: 'https://www.diceui.com',
    description:
      'A collection of open-source, accessible, and customizable UI components.',
  },
]

/**
 * External component definitions - add components you want to feature here
 *
 * These components will:
 * - Appear in your site's navigation under /components/[slug]
 * - Have their registry JSON redirect: /r/{slug}.json → externalRegistryUrl
 */
export const externalComponents: ExternalComponent[] = [
  {
    slug: 'media-player',
    title: 'Media Player',
    description:
      'A fully-featured media player component with support for video and audio playback, controls, and accessibility.',
    registry: 'diceui',
    externalUrl: 'https://www.diceui.com/docs/components/media-player',
    externalRegistryUrl: 'https://www.diceui.com/r/media-player.json',
    tags: ['media', 'video', 'audio', 'player'],
  },
]

/**
 * Get all external component redirects for Next.js config
 * Redirects /r/{slug}.json to the external registry's JSON file
 */
export function getExternalComponentRedirects() {
  return externalComponents.map((component) => ({
    source: `/r/${component.slug}.json`,
    destination: component.externalRegistryUrl,
    permanent: false,
  }))
}

/**
 * Get a registry by its ID
 */
export function getRegistryById(id: string): ExternalRegistry | undefined {
  return externalRegistries.find((r) => r.id === id)
}

/**
 * Get all components for a specific registry
 */
export function getComponentsByRegistry(registryId: string): ExternalComponent[] {
  return externalComponents.filter((c) => c.registry === registryId)
}

/**
 * Get an external component by slug
 */
export function getExternalComponentBySlug(
  slug: string
): ExternalComponent | undefined {
  return externalComponents.find((c) => c.slug === slug)
}
