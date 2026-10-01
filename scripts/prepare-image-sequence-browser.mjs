import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Install the built payload into an isolated consumer. Browser tests exercise
// exactly the files delivered by shadcn, including rewritten library imports.
const root = resolve('.')
const consumer = resolve('.context/image-sequence-install')
execFileSync(
  'pnpm',
  ['exec', 'shadcn', 'build', '--output', '.context/image-sequence-registry'],
  { stdio: 'inherit' }
)
rmSync(consumer, { recursive: true, force: true })
mkdirSync(`${consumer}/app`, { recursive: true })
writeFileSync(
  `${consumer}/package.json`,
  JSON.stringify({
    name: 'sequence-consumer',
    private: true,
    type: 'module',
    dependencies: {
      react: '19.2.0',
      'react-dom': '19.2.0',
      clsx: '^2.1.1',
      'tailwind-merge': '^3.4.0',
    },
  })
)
const config = JSON.parse(readFileSync('components.json', 'utf8'))
config.tailwind.css = 'app/globals.css'
// The utility dependency is served from the same locally built registry.
config.registries['@joyco'] =
  `${root}/.context/image-sequence-registry/{name}.json`
writeFileSync(`${consumer}/components.json`, JSON.stringify(config))
writeFileSync(
  `${consumer}/tsconfig.json`,
  JSON.stringify({
    compilerOptions: { baseUrl: '.', paths: { '@/*': ['./*'] } },
  })
)
writeFileSync(`${consumer}/app/globals.css`, '@import "tailwindcss";\n')
execFileSync(
  'pnpm',
  [
    'exec',
    'shadcn',
    'add',
    `${root}/.context/image-sequence-registry/image-sequence.json`,
    '--cwd',
    consumer,
    '--yes',
  ],
  { stdio: 'inherit' }
)
