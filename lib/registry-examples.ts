import { readdir, readFile, stat } from 'fs/promises'
import path from 'path'
import { lazy } from 'react'

const demosDir = path.join(process.cwd(), 'demos')
const allEntries = await readdir(demosDir)

type Block = {
  name: string
  description: string
  type: string
  component: React.LazyExoticComponent<React.ComponentType<unknown>>
  files: {
    path: string
  }[]
}

async function getBlockFiles(entry: string): Promise<{ path: string }[]> {
  const entryPath = path.join(demosDir, entry)
  const entryStat = await stat(entryPath)

  if (entryStat.isDirectory()) {
    // Read all files in the directory
    const dirFiles = await readdir(entryPath)
    const tsFiles = dirFiles
      .filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))
      .sort((a, b) => {
        // index files come first
        if (a.startsWith('index.')) return -1
        if (b.startsWith('index.')) return 1
        return a.localeCompare(b)
      })
      .map((f) => ({ path: `@/demos/${entry}/${f}` }))
    return tsFiles
  }

  // Single file
  return [{ path: `@/demos/${entry}` }]
}

async function getBlockName(entry: string): Promise<string> {
  const entryPath = path.join(demosDir, entry)
  const entryStat = await stat(entryPath)

  if (entryStat.isDirectory()) {
    return entry
  }

  return entry.replace('.tsx', '').replace('.ts', '')
}

async function isDirectory(entry: string): Promise<boolean> {
  const entryPath = path.join(demosDir, entry)
  const entryStat = await stat(entryPath)
  return entryStat.isDirectory()
}

const blocks: Block[] = (
  await Promise.all(
    allEntries.map(async (entry) => {
      const blockName = await getBlockName(entry)
      const isDir = await isDirectory(entry)
      const files = await getBlockFiles(entry)

      // Skip if no valid files found (e.g., empty directory)
      if (files.length === 0) return null

      return {
        name: blockName,
        component: lazy(async () => {
          // For directories, import from index.tsx; for files, import directly
          // Using template literals for bundler dynamic import support
          const mod = isDir
            ? await import(`@/demos/${entry}/index`)
            : await import(`@/demos/${blockName}`)
          return { default: mod.default }
        }),
        files,
      }
    })
  )
).filter((block) => block !== null) as unknown as Block[]

export function getRegistryExampleComponent(name: string) {
  const block = blocks.find((block) => block.name === name)
  if (!block) {
    return null
  }
  return block.component
}

export function getRegistryExampleItems() {
  return blocks
    .filter((block) => block.name.endsWith('demo'))
    .map((block) => ({
      name: block.name,
      description: block.description,
      type: block.type,
      component: block.component,
    }))
}

export function getRegistryExampleItem(name: string) {
  // if the name doesnt ends with demo, return null
  if (!name.endsWith('demo')) {
    return null
  }
  const block = blocks.find((block) => block.name === name)
  if (!block) {
    return null
  }
  return block
}

type File = {
  path: string
  content: string
}
export async function getRegistryExampleComponentFile(name: string) {
  const item = blocks.find((block) => block.name === name)

  if (!item) {
    throw new Error(`Component ${name} not found in registry`)
  }

  const files: File[] = []
  for (const { path: filePath } of item.files) {
    // @ path to relative path
    // e.g @/demos/button.tsx -> ./demos/button.tsx
    const relativePath = filePath.replace('@/', './')
    const content = await getFileContent(relativePath)
    files.push({
      path: relativePath,
      content,
    })
  }

  // Fix file paths.
  const fixedFiles = files.map((file) => ({
    ...file,
    path: path.relative(process.cwd(), file.path),
  }))

  return fixedFiles
}

async function getFileContent(filePath: string) {
  const raw = await readFile(filePath, 'utf-8')
  let code = raw
  // code = code.replaceAll('export default', 'export')
  code = code.replaceAll('/* eslint-disable react/no-children-prop */\n', '')
  code = code.replaceAll('@/registry/joyco/blocks/', '@/components/')

  return code
}
