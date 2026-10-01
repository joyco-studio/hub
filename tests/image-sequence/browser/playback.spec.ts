import { test, expect, type Page } from '@playwright/test'

// Instrument browser APIs from the test, never from shipped registry code.
async function instrument(page: Page, delay = 60) {
  await page.addInitScript((delay) => {
    const state = {
      created: [] as string[],
      revoked: [] as string[],
      ready: [] as string[],
      early: [] as string[],
      earlyRevokes: [] as string[],
      incomplete: 0,
      samples: 0,
      decodeDurations: [] as number[],
    }
    Object.assign(window, { probe: state })
    const create = URL.createObjectURL.bind(URL),
      revoke = URL.revokeObjectURL.bind(URL)
    URL.createObjectURL = (blob) => {
      const url = create(blob)
      state.created.push(url)
      return url
    }
    URL.revokeObjectURL = (url) => {
      if (
        [
          ...document.querySelectorAll<HTMLImageElement>(
            '[data-slot="sequence-image"]'
          ),
        ].some((image) => image.src === url)
      )
        state.earlyRevokes.push(url)
      state.revoked.push(url)
      revoke(url)
    }
    const nativeDecode = HTMLImageElement.prototype.decode
    HTMLImageElement.prototype.decode = async function () {
      const src = this.src,
        start = performance.now()
      await nativeDecode.call(this)
      await new Promise((resolve) => setTimeout(resolve, delay))
      state.ready.push(src)
      state.decodeDurations.push(performance.now() - start)
    }
    const src = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      'src'
    )!
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      ...src,
      set(value: string) {
        if (
          this.isConnected &&
          value.startsWith('blob:') &&
          !state.ready.includes(value)
        )
          state.early.push(value)
        src.set!.call(this, value)
      },
    })
    const sample = () => {
      for (const image of document.querySelectorAll<HTMLImageElement>(
        '[data-slot="sequence-image"]'
      )) {
        if (!image.src.startsWith('blob:')) continue
        state.samples++
        if (!image.complete || !image.naturalWidth) state.incomplete++
      }
      requestAnimationFrame(sample)
    }
    requestAnimationFrame(sample)
  }, delay)
}
async function assets(page: Page, failed = false) {
  await page.route('**/*.svg', async (route) => {
    const url = new URL(route.request().url())
    if (failed && url.pathname.includes('/5.svg')) {
      await route.abort()
      return
    }
    const width = Number(url.pathname.split('/')[3]) || 640
    const index =
      Number(url.pathname.split('/').at(-1)?.replace('.svg', '')) || 0
    await route.fulfill({
      contentType: 'image/svg+xml',
      body: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}"><rect width="100%" height="100%" fill="hsl(${index * 30} 60% 50%)"/><text x="20" y="60" font-size="40">${index}</text></svg>`,
    })
  })
}
async function progress(page: Page, count = 4) {
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { presented: unknown[] }).presented.length
      )
    )
    .toBeGreaterThanOrEqual(count)
}
async function probe(page: Page) {
  return page.evaluate(
    () =>
      (
        window as unknown as {
          probe: {
            created: string[]
            revoked: string[]
            early: string[]
            earlyRevokes: string[]
            incomplete: number
            samples: number
          }
        }
      ).probe
  )
}
async function control(page: Page, name: string, value: number | boolean) {
  await page.evaluate(
    ([name, value]) =>
      (
        window as unknown as {
          controls: Record<string, (value: unknown) => void>
        }
      ).controls[name as string](value),
    [name, value]
  )
}

test('one stable mounted image receives only decoded URLs and remains complete with delayed decode', async ({
  page,
}) => {
  await instrument(page)
  await assets(page)
  await page.goto('/')
  const image = page.locator('[data-slot="sequence-image"]')
  const element = await image.elementHandle()
  await progress(page, 8)
  expect(await page.locator('[data-slot="image-sequence"] img').count()).toBe(1)
  expect(
    await element?.evaluate(
      (node) => node === document.querySelector('[data-slot="sequence-image"]')
    )
  ).toBe(true)
  const result = await probe(page)
  expect(result.samples).toBeGreaterThan(10)
  expect(result.early).toEqual([])
  expect(result.earlyRevokes).toEqual([])
  expect(result.incomplete).toBe(0)
})

test('failure holds the valid frame and reduced motion restores the poster and releases Blob ownership', async ({
  page,
}) => {
  await instrument(page)
  await assets(page, true)
  await page.goto('/?sequential')
  await progress(page, 5)
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as unknown as { presented: { index: number }[] }
          ).presented.at(-1)?.index
      )
    )
    .toBe(4)
  await page.waitForTimeout(300)
  expect((await probe(page)).incomplete).toBe(0)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('[data-slot="sequence-image"]')).toHaveAttribute(
    'src',
    '/poster.svg'
  )
  await expect
    .poll(async () => {
      const p = await probe(page)
      return p.created.length - p.revoked.length
    })
    .toBe(0)
  const before = await page.evaluate(
    () => (window as unknown as { presented: unknown[] }).presented.length
  )
  await page.waitForTimeout(200)
  expect(
    await page.evaluate(
      () => (window as unknown as { presented: unknown[] }).presented.length
    )
  ).toBe(before)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await progress(page, before + 1)
})

test('two visible sequences both progress through the shared eight-slot scheduler', async ({
  page,
}) => {
  await instrument(page, 20)
  let pending = 0,
    maxPending = 0
  await assets(page)
  await page.route('**/frames/**', async (route) => {
    pending++
    maxPending = Math.max(maxPending, pending)
    await new Promise((resolve) => setTimeout(resolve, 100))
    pending--
    await route.fallback()
  })
  await page.goto('/?two')
  await expect
    .poll(() =>
      page.evaluate(() => {
        const frames = (window as unknown as { presented: { owner: string }[] })
          .presented
        return Math.min(
          ...['a', 'b'].map(
            (owner) => frames.filter((frame) => frame.owner === owner).length
          )
        )
      })
    )
    .toBeGreaterThanOrEqual(5)
  expect(maxPending).toBeLessThanOrEqual(8)
  expect((await probe(page)).incomplete).toBe(0)
})

test('scrub reversals and resize preserve the surface and only approach the latest target', async ({
  page,
}) => {
  await instrument(page, 100)
  await assets(page)
  await page.goto('/?scrub')
  await progress(page, 1)
  await control(page, 'setTarget', 10)
  await page.waitForTimeout(30)
  await control(page, 'setTarget', 2)
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as unknown as { presented: { index: number }[] }
          ).presented.at(-1)?.index
      )
    )
    .toBe(2)
  const frames = await page.evaluate(
    () =>
      (window as unknown as { presented: { index: number; target: number }[] })
        .presented
  )
  expect(
    frames
      .filter((frame) => frame.target === 2)
      .every((frame) => frame.index <= 2)
  ).toBe(true)
  const before = await page.locator('img').getAttribute('src')
  await control(page, 'setSize', 500)
  await expect
    .poll(() => page.locator('img').getAttribute('src'))
    .not.toBe(before)
  expect((await probe(page)).earlyRevokes).toEqual([])
  expect((await probe(page)).incomplete).toBe(0)
})

test('one-shot holds its final frame and toggling playing cannot complete it twice', async ({
  page,
}) => {
  await instrument(page, 10)
  await assets(page)
  await page.goto('/?once')
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { completions: number }).completions
      )
    )
    .toBe(1)
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { presented: { index: number }[] }).presented.at(
          -1
        )?.index
    )
  ).toBe(11)
  const final = await page.locator('img').getAttribute('src')
  await control(page, 'setPlaying', false)
  await control(page, 'setPlaying', true)
  await page.waitForTimeout(250)
  expect(await page.locator('img').getAttribute('src')).toBe(final)
  expect(
    await page.evaluate(
      () => (window as unknown as { completions: number }).completions
    )
  ).toBe(1)
  await control(page, 'setRun', 1)
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { completions: number }).completions
      )
    )
    .toBe(2)
})

test('distance, disabling, and unmount release work while the mounted surface remains valid', async ({
  page,
}) => {
  await instrument(page, 20)
  await assets(page)
  await page.goto('/?reentry')
  await page.waitForTimeout(150)
  expect((await probe(page)).created).toEqual([])
  await page.evaluate(() => scrollTo(0, 1100))
  await progress(page, 3)
  await page.evaluate(() => scrollTo(0, 0))
  await page.waitForTimeout(200)
  let result = await probe(page)
  expect(result.created.length - result.revoked.length).toBe(1)
  await page.evaluate(() => scrollTo(0, 1100))
  await progress(page, 5)
  await control(page, 'setEnabled', false)
  await page.waitForTimeout(150)
  result = await probe(page)
  expect(result.created.length - result.revoked.length).toBe(1)
  await control(page, 'setMounted', false)
  await expect
    .poll(async () => {
      const p = await probe(page)
      return p.created.length - p.revoked.length
    })
    .toBe(0)
})

test('initial reduced motion does not start sequence work', async ({
  page,
}) => {
  await instrument(page)
  await assets(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.waitForTimeout(200)
  expect((await probe(page)).created).toEqual([])
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await progress(page, 2)
})

test('document hiding suspends playback and releases future ownership', async ({
  page,
}) => {
  await instrument(page, 20)
  await assets(page)
  await page.goto('/')
  await progress(page, 3)
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await page.waitForTimeout(150)
  const before = await page.evaluate(
    () => (window as unknown as { presented: unknown[] }).presented.length
  )
  const suspended = await probe(page)
  expect(suspended.created.length - suspended.revoked.length).toBe(1)
  await page.waitForTimeout(150)
  expect(
    await page.evaluate(
      () => (window as unknown as { presented: unknown[] }).presented.length
    )
  ).toBe(before)
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await progress(page, before + 2)
})

test('observer updates do not restart the poster request', async ({ page }) => {
  await page.addInitScript(() => {
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      'src'
    )!
    Object.assign(window, { posterAssignments: 0 })
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      ...descriptor,
      set(value: string) {
        if (this.isConnected && value === '/poster.svg') {
          const state = window as unknown as { posterAssignments: number }
          state.posterAssignments++
        }
        descriptor.set!.call(this, value)
      },
    })
  })
  await instrument(page, 500)
  await assets(page)
  await page.goto('/')
  // React assigns the native src once when mounting; observer notifications
  // and resizing must not add another assignment.
  await page.waitForTimeout(150)
  await control(page, 'setSize', 140)
  await page.waitForTimeout(150)
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { posterAssignments: number }).posterAssignments
    )
  ).toBe(1)
})
