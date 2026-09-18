// Render transparent publication assets directly from the SVGs. Do not remove
// white pixels from measured PNGs: white highlights are part of the artwork.
const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright')
const root = __dirname
const files = {
  'star1-original': 'Star 1.svg',
  'star1-alpha1': 'Star 1-alpha1.svg',
  'star2-original': 'Star2.svg',
  'star2-alpha1': 'Star2-alpha1.svg',
  'star2-rebuilt': 'Star2-rebuilt.svg',
}
;(async () => {
  fs.mkdirSync(path.join(root, 'renders'), { recursive: true })
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--force-color-profile=srgb'],
  })
  try {
    const page = await browser.newPage()
    for (const [name, file] of Object.entries(files)) {
      const source = fs.readFileSync(path.join(root, '..', file), 'utf8')
      const png = await page.evaluate(async (source) => {
        const url = URL.createObjectURL(
          new Blob([source], { type: 'image/svg+xml' })
        )
        try {
          const image = new Image()
          image.src = url
          await image.decode()
          const canvas = document.createElement('canvas')
          canvas.width = image.width
          canvas.height = image.height
          canvas.getContext('2d').drawImage(image, 0, 0)
          return canvas.toDataURL().split(',')[1]
        } finally {
          URL.revokeObjectURL(url)
        }
      }, source)
      fs.writeFileSync(
        path.join(root, 'renders', `${name}-transparent.png`),
        Buffer.from(png, 'base64')
      )
    }
  } finally {
    await browser.close()
  }
})().catch((error) => {
  console.error(error)
  process.exit(1)
})
