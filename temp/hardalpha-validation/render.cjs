// PLAYWRIGHT_PATH=/path/to/playwright node render.cjs
// SVGs are rasterized only by installed Google Chrome, never by sharp/resvg.
const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright')
const root = __dirname
const output = path.join(root, 'renders')
fs.mkdirSync(output, { recursive: true })
const original = fs.readFileSync(
  path.join(root, 'polygon-original.svg'),
  'utf8'
)
const figmaStar = fs.readFileSync(
  path.join(root, 'figma-star-original.svg'),
  'utf8'
)
const figmaStar2 = fs.readFileSync(
  path.join(root, 'figma-star2-original.svg'),
  'utf8'
)
const booleanPath = path.join(root, 'boolean-paths.json')
const booleanPaths = fs.existsSync(booleanPath)
  ? JSON.parse(fs.readFileSync(booleanPath, 'utf8'))
  : {}
const partitionPath = path.join(root, 'partition-paths.json')
const partitionPaths = fs.existsSync(partitionPath)
  ? JSON.parse(fs.readFileSync(partitionPath, 'utf8'))
  : {}
const triangle = 'M10.3923 0L20.7846 18H-9.53674e-07L10.3923 0Z'
const star =
  Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6 - Math.PI / 2,
      r = i % 2 ? 8.2 : 18.8
    return `${i ? 'L' : 'M'}${20 + Math.cos(a) * r} ${20 + Math.sin(a) * r}`
  }).join(' ') + 'Z'
const dark = {
  dx: 2.1,
  dy: 2.1,
  color: [10 / 255, 42 / 255, 102 / 255],
  opacity: 0.85,
}
const emboss = [
  { dx: 0, dy: 0.6, color: [0, 0, 0], opacity: 0.48 },
  { dx: 0, dy: -0.6, color: [1, 1, 1], opacity: 1 },
]
const cases = []
function add(id, opts = {}) {
  cases.push({
    id,
    w: 40,
    h: 40,
    vw: 40,
    vh: 40,
    d: star,
    fill: '#4391FF',
    opacity: 1,
    bg: '#ffffff',
    blur: 0,
    mode: 'normal',
    shadows: [dark],
    phase: 0,
    ...opts,
  })
}
add('star_offset3')
add('circle_offset3', {
  d: 'M38.8 20A18.8 18.8 0 1 1 1.2 20A18.8 18.8 0 1 1 38.8 20Z',
})
add('star_onColor', { bg: '#808080' })
add('star_blur2', { blur: 2 })
add('star_overlay', { mode: 'overlay', shadows: emboss })
add('star_overlay_blur2', { mode: 'overlay', shadows: emboss, blur: 2 })
add('star_multiply', { mode: 'multiply' })
add('star_multiply_blur2', { mode: 'multiply', blur: 2 })
add('star_overlay_translucent', {
  mode: 'overlay',
  shadows: emboss,
  fill: '#000000',
  opacity: 0.36,
  bg: '#808080',
})
add('star_overlay_translucent_blur2', {
  mode: 'overlay',
  shadows: emboss,
  fill: '#000000',
  opacity: 0.36,
  bg: '#808080',
  blur: 2,
})
for (const size of [16, 24, 64])
  for (const blur of [0, 2])
    add(`star_overlay_${size}_blur${blur}`, {
      w: size,
      h: size,
      mode: 'overlay',
      shadows: emboss,
      blur,
    })
add('star_overlay_phase025', { mode: 'overlay', shadows: emboss, phase: 0.25 })
add('star_overlay_blur2_phase05', {
  mode: 'overlay',
  shadows: emboss,
  blur: 2,
  phase: 0.5,
})
add('star_zero_offset', { shadows: [{ ...dark, dx: 0, dy: 0 }] })
add('star_translucent_normal', {
  opacity: 0.36,
  shadows: [{ ...dark, dx: 3, dy: 3 }],
  bg: '#808080',
})
add('star_translucent_normal_blur2', {
  opacity: 0.36,
  shadows: [{ ...dark, dx: 3, dy: 3 }],
  bg: '#808080',
  blur: 2,
})
add('star_translucent_overlay_thick', {
  opacity: 0.36,
  shadows: emboss.map((s) => ({ ...s, dy: s.dy * 5 })),
  mode: 'overlay',
  bg: '#808080',
})
add('star_translucent_overlay_thick_blur2', {
  opacity: 0.36,
  shadows: emboss.map((s) => ({ ...s, dy: s.dy * 5 })),
  mode: 'overlay',
  bg: '#808080',
  blur: 2,
})
const triShadows = [
  { dx: 2, dy: 4, color: [1, 1, 1], opacity: 0.6 },
  { dx: 0, dy: -4, color: [1, 0.134465, 0.134465], opacity: 0.6 },
]
add('polygon_original', {
  w: 21,
  h: 18,
  vw: 21,
  vh: 18,
  d: triangle,
  shadows: triShadows,
  exact: true,
})
add('polygon_overlay_variant', {
  w: 21,
  h: 18,
  vw: 21,
  vh: 18,
  d: triangle,
  shadows: triShadows,
  exact: true,
  mode: 'overlay',
})
add('polygon_overlay_blur2_variant', {
  w: 21,
  h: 18,
  vw: 21,
  vh: 18,
  d: triangle,
  shadows: triShadows,
  exact: true,
  mode: 'overlay',
  blur: 2,
})
const figmaOpts = {
  w: 52,
  h: 49,
  vw: 52,
  vh: 49,
  d: figmaStar.match(/<path d="([^"]+)"/)[1],
  shadows: [
    { ...triShadows[0], dy: 15, blur: 0 },
    { ...triShadows[1], blur: 1 },
  ],
  blur: 1,
  exact: true,
  figma: true,
}
add('figma_star_original', figmaOpts)
add('figma_star_gray', { ...figmaOpts, bg: '#808080' })
add('figma_star_dark', { ...figmaOpts, bg: '#202020' })
add('figma_star_overlay_variant', { ...figmaOpts, mode: 'overlay' })
add('figma_star_translucent_variant', {
  ...figmaOpts,
  opacity: 0.36,
  bg: '#808080',
})
add('figma_star_24', { ...figmaOpts, w: 24, h: 23 })
add('figma_star_104', { ...figmaOpts, w: 104, h: 98 })
const figma2Opts = {
  ...figmaOpts,
  star2: true,
  shadows: [
    { ...figmaOpts.shadows[0], opacity: 1 },
    { ...figmaOpts.shadows[1], opacity: 0.2 },
  ],
}
add('figma_star2_original', figma2Opts)
add('figma_star2_gray', { ...figma2Opts, bg: '#808080' })
add('figma_star2_dark', { ...figma2Opts, bg: '#202020' })
add('figma_star2_overlay_variant', { ...figma2Opts, mode: 'overlay' })
function svg(c, variant, scale) {
  const { w, h, vw, vh, d, fill, opacity, bg, blur, mode, shadows, phase } = c
  const shape = `<path d="${d}" transform="translate(${phase} ${phase})"`
  let body
  if (variant === 'silhouette') body = `${shape} fill="#fff"/>`
  else if (variant === 'boolean') {
    body = `<g style="isolation:isolate">${shape} fill="${fill}" fill-opacity="${opacity}"/>`
    shadows.forEach((s, i) => {
      body += `<path d="${booleanPaths[c.id][i]}" fill-rule="evenodd" fill="rgb(${s.color.map((v) => v * 255).join(',')})" fill-opacity="${s.opacity}" style="mix-blend-mode:${mode}"/>`
    })
    body += '</g>'
  } else if (variant === 'partition') {
    // Bake the first sharp shadow into two disjoint, opaque vector regions.
    // This avoids stacking two partially covered layers at the outer edge.
    // Retain the second soft shadow as an independent blurred mask.
    const p = partitionPaths[c.id],
      first = shadows[0],
      s = shadows[1]
    const base = [67, 145, 255],
      color = base.map(
        (v, i) => v * (1 - first.opacity) + first.color[i] * 255 * first.opacity
      )
    body = `<defs><filter id="soft" x="-100%" y="-100%" width="300%" height="300%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${s.blur}"/></filter><mask id="softRim" maskUnits="userSpaceOnUse" x="-20" y="-20" width="${vw + 40}" height="${vh + 40}" style="mask-type:luminance"><path d="${d}" fill="white"/><path d="${d}" fill="black" transform="translate(${s.dx} ${s.dy})" filter="url(#soft)"/></mask></defs><g style="isolation:isolate"><path d="${p.base}" fill="${fill}" fill-rule="evenodd"/><path d="${p.rim}" fill="rgb(${color.join(',')})" fill-rule="evenodd"/><path d="${d}" fill="rgb(${s.color.map((v) => v * 255).join(',')})" fill-opacity="${s.opacity}" mask="url(#softRim)"/></g>`
  } else if (c.exact && variant !== 'geometry') {
    body = (c.star2 ? figmaStar2 : c.figma ? figmaStar : original)
      .replace(/<svg[^>]*>|<\/svg>/g, '')
      .replace(/0 127 0/g, `0 ${variant === 'a1' ? 1 : 127} 0`)
    if (opacity !== 1)
      body = body.replace('<path ', `<path fill-opacity="${opacity}" `)
    body = body.replace(
      /<feBlend mode="normal" in2=/g,
      `<feBlend mode="${mode}" in2=`
    )
    if (blur && !c.figma)
      body = body.replace(
        /(<feOffset[^>]*\/>)/g,
        `$1<feGaussianBlur stdDeviation="${blur}"/>`
      )
  } else if (variant === 'geometry') {
    // The article's white silhouette minus black shifted silhouette, applied
    // to another copy of the path: a rasterized luminance mask, not Boolean geometry.
    let defs = '',
      layers = `${shape} fill="${fill}" fill-opacity="${opacity}"/>`
    shadows.forEach((s, i) => {
      const sigma = s.blur ?? blur
      defs += `<filter id="blur${i}" x="-100%" y="-100%" width="300%" height="300%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${sigma}"/></filter><mask id="rim${i}" maskUnits="userSpaceOnUse" x="-20" y="-20" width="${vw + 40}" height="${vh + 40}" style="mask-type:luminance"><path d="${d}" transform="translate(${phase} ${phase})" fill="white"/><path d="${d}" transform="translate(${phase + s.dx} ${phase + s.dy})" fill="black" ${sigma ? `filter="url(#blur${i})"` : ''}/></mask>`
      layers += `${shape} fill="rgb(${s.color.map((v) => v * 255).join(',')})" fill-opacity="${s.opacity}" mask="url(#rim${i})" style="mix-blend-mode:${mode}"/>`
    })
    body = `<defs>${defs}</defs><g style="isolation:isolate">${layers}</g>`
  } else {
    let primitives =
      '<feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>'
    shadows.forEach((s, i) => {
      primitives += `<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${variant === 'a1' ? 1 : 127} 0" result="hardAlpha"/><feOffset dx="${s.dx}" dy="${s.dy}"/>${blur ? `<feGaussianBlur stdDeviation="${blur}"/>` : ''}<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix type="matrix" values="0 0 0 0 ${s.color[0]} 0 0 0 0 ${s.color[1]} 0 0 0 0 ${s.color[2]} 0 0 0 ${s.opacity} 0"/><feBlend mode="${mode}" in2="${i ? `effect${i - 1}` : 'shape'}" result="effect${i}"/>`
    })
    body = `<defs><filter id="shadow" filterUnits="userSpaceOnUse" x="-20" y="-20" width="${vw + 40}" height="${vh + 40}" color-interpolation-filters="sRGB">${primitives}</filter></defs><g filter="url(#shadow)">${shape} fill="${fill}" fill-opacity="${opacity}"/></g>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w * scale}" height="${h * scale}" viewBox="0 0 ${vw} ${vh}"><rect width="${vw}" height="${vh}" fill="${variant === 'silhouette' ? '#000' : bg}"/>${body}</svg>`
}
;(async () => {
  fs.writeFileSync(
    path.join(root, 'cases.json'),
    JSON.stringify(cases, null, 2)
  )
  if (process.env.WRITE_CASES_ONLY) return
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--force-color-profile=srgb'],
  })
  try {
    const page = await browser.newPage({ deviceScaleFactor: 1 })
    const manifest = { chrome: browser.version(), cases, files: [] }
    for (const c of cases) {
      const variants = [
        ['a127', 1],
        ['a1', 1],
        ['geometry', 1],
        ['a127', 8],
        ['a127', 16],
        ['a1', 16],
        ['silhouette', 16],
      ]
      if (c.figma) variants.push(['a127', 32])
      if (partitionPaths[c.id]) variants.push(['partition', 1])
      if (booleanPaths[c.id] && !c.blur) variants.push(['boolean', 1])
      for (const [variant, scale] of variants) {
        const source = svg(c, variant, scale),
          name = `${c.id}-${variant}-${scale}`
        fs.writeFileSync(path.join(output, name + '.svg'), source)
        const png = await page.evaluate(async (source) => {
          const blob = new Blob([source], { type: 'image/svg+xml' }),
            url = URL.createObjectURL(blob)
          try {
            const img = new Image()
            img.src = url
            await img.decode()
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            canvas.getContext('2d').drawImage(img, 0, 0)
            return canvas.toDataURL('image/png').split(',')[1]
          } finally {
            URL.revokeObjectURL(url)
          }
        }, source)
        fs.writeFileSync(
          path.join(output, name + '.png'),
          Buffer.from(png, 'base64')
        )
        manifest.files.push({ case: c.id, variant, scale, name })
      }
      console.log(c.id)
    }
    // Independently compare canvas SVG rendering against an inline SVG screenshot.
    for (const [id, file] of [
      ['polygon_original', 'polygon-inline-screenshot'],
      ['figma_star_original', 'figma-star-inline-screenshot'],
      ['figma_star2_original', 'figma-star2-inline-screenshot'],
    ]) {
      const c = cases.find((c) => c.id === id)
      await page.setContent(
        `<style>html,body{margin:0}svg{display:block}</style>${svg(c, 'a127', 1)}`
      )
      await page
        .locator('svg')
        .screenshot({ path: path.join(output, file + '.png') })
    }
    fs.writeFileSync(
      path.join(root, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    )
  } finally {
    await browser.close()
  }
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
