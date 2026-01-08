import fs from 'fs'
import path from 'path'
import { getLanguageFromExtension, stripFrontmatter } from '@/lib/shiki'

/**
 * Validates that a path is within the project directory to prevent path traversal attacks
 */
function isPathWithinProject(filePath: string, baseDir: string): boolean {
  // Strip leading slash to ensure path is treated as relative
  const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath
  const resolvedPath = path.resolve(baseDir, relativePath)
  const normalizedBase = path.resolve(baseDir)
  return resolvedPath.startsWith(normalizedBase + path.sep)
}

/**
 * Processes MDX content for LLM consumption by:
 * 1. Removing frontmatter (already handled by title in getLLMText)
 * 2. Removing import statements
 * 3. Replacing ComponentPreview components with their actual source code
 * 4. Replacing FileCodeblock components with their file content
 */
export function processMdxForLLMs(content: string): string {
  let processed = content

  // Remove frontmatter (--- ... ---)
  processed = processed.replace(/^---[\s\S]*?---\n*/m, '')

  // Remove import statements
  processed = processed.replace(/^import\s+.*$/gm, '')

  // Clean up multiple consecutive newlines (max 2)
  processed = processed.replace(/\n{3,}/g, '\n\n')

  // Match <ComponentPreview name="..." /> or <ComponentPreview name="..."></ComponentPreview>
  const componentPreviewRegex =
    /<ComponentPreview[\s\S]*?name="([^"]+)"[\s\S]*?(?:\/>|<\/ComponentPreview>)/g

  processed = processed.replace(componentPreviewRegex, (match, name) => {
    try {
      const baseDir = process.cwd()
      const demosDir = path.join(baseDir, 'demos')

      // Validate path to prevent path traversal attacks
      if (!isPathWithinProject(path.join('demos', `${name}.tsx`), baseDir)) {
        console.warn(`Path traversal attempt blocked: ${name}`)
        return match
      }

      const demoPath = path.join(demosDir, `${name}.tsx`)

      if (!fs.existsSync(demoPath)) {
        console.warn(`Demo file not found: ${demoPath}`)
        return match
      }

      let source = fs.readFileSync(demoPath, 'utf8')
      source = source.replaceAll('@/registry/joyco/blocks/', '@/components/')

      return `\`\`\`tsx
${source}
\`\`\``
    } catch (error) {
      console.error(`Error processing ComponentPreview ${name}:`, error)
      return match
    }
  })

  // Match <FileCodeblock filePath="..." /> or <FileCodeblock filePath="..."></FileCodeblock>
  const fileCodeblockRegex =
    /<FileCodeblock[\s\S]*?filePath="([^"]+)"[\s\S]*?(?:\/>|<\/FileCodeblock>)/g

  processed = processed.replace(fileCodeblockRegex, (match, filePath) => {
    try {
      const baseDir = process.cwd()

      // Validate path to prevent path traversal attacks
      if (!isPathWithinProject(filePath, baseDir)) {
        console.warn(`Path traversal attempt blocked: ${filePath}`)
        return match
      }

      const fullPath = path.join(baseDir, filePath)

      if (!fs.existsSync(fullPath)) {
        console.warn(`File not found: ${fullPath}`)
        return match
      }

      let source = fs.readFileSync(fullPath, 'utf8')

      // Strip frontmatter from guideline files
      if (filePath.includes('/public/guidelines')) {
        source = stripFrontmatter(source)
      }

      // Determine language from file extension
      const ext = path.extname(filePath).slice(1)
      const lang = getLanguageFromExtension(ext)

      return `\`\`\`${lang}
${source}
\`\`\``
    } catch (error) {
      console.error(`Error processing FileCodeblock ${filePath}:`, error)
      return match
    }
  })

  return processed.trim()
}
