import { execFile } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'
import lastModified from 'fumadocs-mdx/plugins/last-modified'

const exec = promisify(execFile)

// `ReturnType` of a bundled plugin gives us the `Plugin` type without reaching
// into Fumadocs' hashed internal module path.
type Plugin = ReturnType<typeof lastModified>

type CreatedPluginOptions = {
  /** Filter the collections to include by name. */
  filter?: (collection: string) => boolean
}

const cache = new Map<string, Promise<Date | null>>()

/**
 * First-commit (creation) date of a file from git history. `--follow` keeps the
 * date stable across renames; the last line of `git log` is the earliest commit.
 */
async function getCreatedTimestamp(file: string): Promise<Date | null> {
  const cached = cache.get(file)
  if (cached) return cached

  const promise = (async () => {
    try {
      const { stdout } = await exec('git', [
        'log',
        '--follow',
        '--diff-filter=A',
        '--format=%aI',
        '--',
        path.relative(process.cwd(), file),
      ])
      const earliest = stdout.trim().split('\n').filter(Boolean).at(-1)
      if (!earliest) return null
      const date = new Date(earliest)
      return Number.isNaN(date.getTime()) ? null : date
    } catch {
      return null
    }
  })()

  cache.set(file, promise)
  return promise
}

/**
 * Injects a `created` date (first git commit) into page exports, mirroring
 * Fumadocs' built-in `lastModified` plugin. Baked in at content-build time, so
 * it is available without git at runtime.
 */
export default function created(options: CreatedPluginOptions = {}): Plugin {
  const { filter = () => true } = options

  return {
    name: 'created',
    'index-file': {
      serverOptions(serverOptions) {
        serverOptions.doc ??= {}
        serverOptions.doc.passthroughs ??= []
        serverOptions.doc.passthroughs.push('created')
      },
    },
    doc: {
      async vfile(file) {
        if (!filter(this.collection.name)) return
        const timestamp = await getCreatedTimestamp(this.filePath)
        if (!timestamp) return

        const data = file.data as {
          'mdx-export'?: { name: string; value: unknown }[]
        }
        data['mdx-export'] ??= []
        data['mdx-export'].push({ name: 'created', value: timestamp })
      },
    },
  }
}
