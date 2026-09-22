// Render the native 24px bolt, then enlarge the captured pixels without smoothing.
// PLAYWRIGHT_PATH may point to an existing Playwright installation.
const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright')
const assets = path.resolve(
  __dirname,
  '../../public/static/logs/figma-inner-shadows'
)

;(async () => {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--force-color-profile=srgb'],
  })
  try {
    const page = await browser.newPage({ deviceScaleFactor: 1 })
    for (const palette of ['light', 'dark']) {
      for (const variant of ['alpha1', 'rebuilt']) {
        const name = `bolt-contrast-${palette}-${variant}`
        const source = fs.readFileSync(path.join(assets, `${name}.svg`), 'utf8')
        const png = await page.evaluate(async (source) => {
          const url = URL.createObjectURL(
            new Blob([source], { type: 'image/svg+xml' })
          )
          try {
            const image = new Image()
            image.src = url
            await image.decode()
            const native = document.createElement('canvas')
            native.width = native.height = 24
            native.getContext('2d').drawImage(image, 0, 0, 24, 24)
            const zoom = document.createElement('canvas')
            zoom.width = zoom.height = 384
            const context = zoom.getContext('2d')
            context.imageSmoothingEnabled = false
            context.drawImage(native, 0, 0, 384, 384)
            return zoom.toDataURL('image/png').split(',')[1]
          } finally {
            URL.revokeObjectURL(url)
          }
        }, source)
        fs.writeFileSync(
          path.join(assets, `${name}-pixels.png`),
          Buffer.from(png, 'base64')
        )
      }
    }
    console.log(
      `Generated four bolt close-ups from 24 × 24 Chrome renders (${browser.version()}).`
    )
  } finally {
    await browser.close()
  }
})().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
