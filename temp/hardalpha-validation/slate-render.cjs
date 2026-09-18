const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright')
const root = __dirname
const fixture = process.env.SHADOW_FIXTURE || 'slate'
const material = {
  slate: 'slate-porcelain',
  graphite: 'slate-graphite',
  'contrast-light': 'contrast-light',
  'contrast-dark': 'contrast-dark',
}[fixture]
if (!material) throw new Error(`Unknown fixture: ${fixture}`)
const output = path.join(root, 'renders')
const sources = Object.fromEntries(
  [
    ['a127', material],
    ['a1', `${material}-alpha1`],
    ['rebuilt', `${material}-rebuilt`],
  ].map(([key, name]) => [
    key,
    fs.readFileSync(path.join(root, '..', name + '.svg'), 'utf8'),
  ])
)
const d = JSON.parse(fs.readFileSync(path.join(root, 'slate-paths.json'))).shape
function svg(variant, scale, background) {
  const body =
    variant === 'silhouette'
      ? `<path d="${d}" fill="white"/>`
      : sources[variant].replace(/<svg[^>]*>|<\/svg>/g, '')
  const bg = variant === 'silhouette' ? '#000' : background
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${52 * scale}" height="${49 * scale}" viewBox="0 0 52 49">${bg ? `<rect width="52" height="49" fill="${bg}"/>` : ''}${body}</svg>`
}
;(async () => {
  fs.mkdirSync(output, { recursive: true })
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--force-color-profile=srgb'],
  })
  try {
    const page = await browser.newPage({ deviceScaleFactor: 1 })
    const manifest = {
      chrome: browser.version(),
      backgrounds: {
        white: '#ffffff',
        gray: '#808080',
        dark: '#101010',
        transparent: null,
      },
      inline: {},
    }
    for (const [name, background] of Object.entries(manifest.backgrounds)) {
      for (const variant of ['a127', 'a1', 'rebuilt', 'silhouette']) {
        const scales =
          variant === 'a127'
            ? [1, 8, 16, 32]
            : variant === 'silhouette'
              ? [16]
              : [1]
        for (const scale of scales) {
          const source = svg(variant, scale, background)
          const png = await page.evaluate(async (source) => {
            const url = URL.createObjectURL(
              new Blob([source], { type: 'image/svg+xml' })
            )
            try {
              const img = new Image()
              img.src = url
              await img.decode()
              const canvas = document.createElement('canvas')
              canvas.width = img.width
              canvas.height = img.height
              canvas.getContext('2d').drawImage(img, 0, 0)
              return canvas.toDataURL().split(',')[1]
            } finally {
              URL.revokeObjectURL(url)
            }
          }, source)
          fs.writeFileSync(
            path.join(output, `${fixture}-${name}-${variant}-${scale}.png`),
            Buffer.from(png, 'base64')
          )
        }
      }
    }
    for (const variant of ['a127', 'a1', 'rebuilt']) {
      await page.setContent(
        `<style>html,body{margin:0}svg{display:block}</style>${svg(variant, 1, '#ffffff')}`
      )
      await page.locator('svg').screenshot({
        path: path.join(output, `${fixture}-${variant}-inline.png`),
      })
    }
    fs.writeFileSync(
      path.join(root, `${fixture}-manifest.json`),
      JSON.stringify(manifest, null, 2) + '\n'
    )
  } finally {
    await browser.close()
  }
})().catch((error) => {
  console.error(error)
  process.exit(1)
})
