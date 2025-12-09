import lastModified from 'fumadocs-mdx/plugins/last-modified'
import rehypePrettyCode from 'rehype-pretty-code'
import { z } from 'zod'
import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from 'fumadocs-mdx/config'

import { transformers } from './lib/shiki'

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
        },
      ])
      return plugins
    },
  },
  plugins: [lastModified()],
})
