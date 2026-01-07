import lastModified from 'fumadocs-mdx/plugins/last-modified'
import rehypePrettyCode from 'rehype-pretty-code'
import type { Element } from 'hast'
import { z } from 'zod'
import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from 'fumadocs-mdx/config'

import { transformers } from './lib/shiki'
import { cn } from './lib/utils'

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: 'content',
  docs: {
    schema: frontmatterSchema.extend({
      maintainers: z.array(z.string()).default([]),
      docLinks: z
        .array(
          z.object({
            label: z.string(),
            href: z.string(),
          })
        )
        .default([]),
      // External registry component configuration
      externalRegistry: z
        .object({
          /** Name of the external registry (e.g., "Dice UI") */
          name: z.string(),
          /** URL to the component on the external registry */
          url: z.string(),
          /** URL to the registry JSON file for shadcn installation */
          registryUrl: z.string(),
        })
        .optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
})

export default defineConfig({
  mdxOptions: {
    rehypePlugins: (plugins) => {
      plugins.shift()
      plugins.push([
        rehypePrettyCode,
        {
          theme: {
            dark: 'github-dark',
            light: 'github-light-default',
          },
          transformers,
          onVisitTitle(node: Element) {
            node.properties['class'] = cn(
              'not-prose',
              node.properties['class']?.toString()
            )
          },
        },
      ])
      return plugins
    },
  },
  plugins: [lastModified()],
})
