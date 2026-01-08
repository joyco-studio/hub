import { readdir, readFile } from 'fs/promises'
import path from 'path'
import { lazy } from 'react'
const allBlocks = [...(await readdir(path.join(process.cwd(), 'demos')))]

type Block = {
  name: string
  description: string
  type: string
  component: React.LazyExoticComponent<React.ComponentType<unknown>>
  files: {
    path: string
  }[]
}

const blocks: Block[] = (
  await Promise.all(
    allBlocks.map(async (block) => {
      const blockName = block.replace('.tsx', '').replace('.ts', '')
      // get the name of file without the -test...
      return {
        name: blockName,
        component: lazy(async () => {
          const mod = await import(`@/demos/${blockName}`)
          return { default: mod.default }
        }),
        files: [{ path: `@/demos/${blockName}.tsx` }],
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

  // Fix import paths for display (e.g., @/registry/joyco/blocks/ → @/components/)
  code = fixImport(code)

  return code
}

export function fixImport(content: string) {
  let result = content

  // Replace @/registry/joyco/blocks/ → @/components/
  result = result.replaceAll('@/registry/joyco/blocks/', '@/components/')

  // Handle other registry paths: @/path/(components|ui|hooks|lib)/name → @/(components|ui|hooks|lib)/name
  const regex = /@\/(.+?)\/((?:.*?\/)?(?:components|ui|hooks|lib))\/([\w-]+)/g

  const replacement = (
    match: string,
    path: string,
    type: string,
    component: string
  ) => {
    if (type.endsWith('components')) {
      return `@/components/${component}`
    } else if (type.endsWith('ui')) {
      return `@/components/ui/${component}`
    } else if (type.endsWith('hooks')) {
      return `@/hooks/${component}`
    } else if (type.endsWith('lib')) {
      return `@/lib/${component}`
    }

    return match
  }

  return result.replace(regex, replacement)
}
