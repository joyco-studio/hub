// Local design prototypes. These are not new Figma exports.
const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright')
const root = __dirname
const original = fs.readFileSync(path.join(root, '../Star 1.svg'), 'utf8')
const d = original.match(/<path d="([^"]+)"/)[1]
const designs = [
  {
    id: 'amber',
    name: 'Amber',
    fill: '#D7A04A',
    light: '#FFE4A3',
    lightOpacity: 0.75,
    lightY: 2,
    dark: '#7B4A1F',
    darkOpacity: 0.35,
    darkY: -2,
    background: '#F7F4ED',
    purpose: 'Simple, readable bevel',
  },
  {
    id: 'enamel',
    name: 'Blue enamel',
    fill: '#5676C8',
    light: '#CAD8FF',
    lightOpacity: 0.85,
    lightY: 2,
    dark: '#253B70',
    darkOpacity: 0.45,
    darkY: -2,
    background: '#F0F3FA',
    purpose: 'Same light, cooler material',
  },
  {
    id: 'slate',
    name: 'Slate + porcelain',
    fill: '#7B8EA8',
    light: '#FFFFFF',
    lightOpacity: 1,
    lightY: 3,
    dark: '#34465F',
    darkOpacity: 0.3,
    darkY: -2,
    background: '#FFFFFF',
    purpose: 'Candidate for the halo example',
  },
]
function rgb(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
}
function svg(c, alpha, scale = 1, background = false) {
  let filters =
    '<feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape"/>'
  const shadows = [
    { color: c.light, opacity: c.lightOpacity, y: c.lightY, sigma: 0 },
    { color: c.dark, opacity: c.darkOpacity, y: c.darkY, sigma: 1 },
  ]
  shadows.forEach((s, i) => {
    const [r, g, b] = rgb(s.color)
    filters += `<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${alpha} 0" result="hardAlpha"/><feOffset dy="${s.y}"/>${s.sigma ? `<feGaussianBlur stdDeviation="${s.sigma}"/>` : ''}<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix type="matrix" values="0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 ${s.opacity} 0"/><feBlend mode="normal" in2="${i ? 'shadow0' : 'shape'}" result="shadow${i}"/>`
  })
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${52 * scale}" height="${49 * scale}" viewBox="0 0 52 49">${background ? `<rect width="52" height="49" fill="${c.background}"/>` : ''}<defs><filter id="inner" filterUnits="userSpaceOnUse" x="-4" y="-4" width="60" height="57" color-interpolation-filters="sRGB">${filters}</filter></defs><g filter="url(#inner)"><path d="${d}" fill="${c.fill}"/></g></svg>`
}
async function raster(page, source) {
  return page.evaluate(async (source) => {
    const url = URL.createObjectURL(
      new Blob([source], { type: 'image/svg+xml' })
    )
    try {
      const img = new Image()
      img.src = url
      await img.decode()
      const c = document.createElement('canvas')
      c.width = img.width
      c.height = img.height
      c.getContext('2d').drawImage(img, 0, 0)
      return c.toDataURL().split(',')[1]
    } finally {
      URL.revokeObjectURL(url)
    }
  }, source)
}
;(async () => {
  fs.writeFileSync(
    path.join(root, 'recipes.json'),
    JSON.stringify(designs, null, 2) + '\n'
  )
  fs.writeFileSync(
    path.join(root, 'star-base.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" width="52" height="49" viewBox="0 0 52 49"><path d="${d}" fill="#D7A04A"/></svg>`
  )
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--force-color-profile=srgb'],
  })
  try {
    const page = await browser.newPage()
    for (const c of designs) {
      for (const alpha of [127, 1]) {
        fs.writeFileSync(
          path.join(root, `${c.id}-alpha${alpha}.svg`),
          svg(c, alpha)
        )
        const transparent = await raster(page, svg(c, alpha, 1, false))
        fs.writeFileSync(
          path.join(root, `${c.id}-alpha${alpha}-transparent.png`),
          Buffer.from(transparent, 'base64')
        )
        for (const scale of [1, 8, 16]) {
          const png = await raster(page, svg(c, alpha, scale, true))
          fs.writeFileSync(
            path.join(root, `${c.id}-alpha${alpha}-${scale}x.png`),
            Buffer.from(png, 'base64')
          )
        }
      }
      // An enlarged rerasterization is only for judging the material design.
      const png = await raster(page, svg(c, 1, 4, false))
      fs.writeFileSync(
        path.join(root, `${c.id}-design-preview.png`),
        Buffer.from(png, 'base64')
      )
    }
  } finally {
    await browser.close()
  }
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
