import { chromium } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import os from 'node:os'

const destination = '.context/image-sequence-profile'
mkdirSync(destination, { recursive: true })
const browser = await chromium.launch({ headless: false })
const metadata = {
  commit: execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim(),
  payloadSha256: createHash('sha256')
    .update(
      readFileSync('.context/image-sequence-registry/image-sequence.json')
    )
    .digest('hex'),
  browser: browser.version(),
  hardware: os.cpus()[0].model,
  os: `${os.platform()} ${os.release()}`,
  viewport: { width: 1000, height: 800 },
  dpr: 1,
  settings: {
    transferConcurrency: 8,
    relevantDecodeConcurrency: 3,
    readyAhead: 3,
    encodedBudgetMiB: 16,
    nearbyPx: 200,
    fps: 24,
  },
  network: {
    latencyMs: 40,
    downloadBytesPerSecond: (4 * 1024 * 1024) / 8,
    uploadBytesPerSecond: (3 * 1024 * 1024) / 8,
    browserCacheDisabled: true,
  },
}
const results = []
try {
  for (const [name, query] of [
    ['isolated', 'real'],
    ['simultaneous', 'real&two'],
    ['consecutive', 'real&consecutive'],
    ['scrub-resize', 'real&scrub'],
  ]) {
    const context = await browser.newContext({
      viewport: metadata.viewport,
      deviceScaleFactor: 1,
    })
    const page = await context.newPage()
    await page.addInitScript(() => {
      const metrics = {
        fetches: [],
        decodes: [],
        longTasks: [],
        liveBlobs: new Map(),
        peakBytes: 0,
        peakUrls: 0,
        samples: 0,
        incomplete: 0,
      }
      window.metrics = metrics
      const fetcher = window.fetch.bind(window)
      window.fetch = async (...args) => {
        const record = { url: String(args[0]), started: performance.now() }
        metrics.fetches.push(record)
        try {
          const response = await fetcher(...args)
          record.headers = performance.now()
          record.status = response.status
          return response
        } catch (error) {
          record.error = String(error)
          throw error
        }
      }
      const decode = HTMLImageElement.prototype.decode
      HTMLImageElement.prototype.decode = async function () {
        const start = performance.now()
        try {
          await decode.call(this)
          metrics.decodes.push({
            start,
            duration: performance.now() - start,
            width: this.naturalWidth,
            height: this.naturalHeight,
          })
        } catch (error) {
          metrics.decodes.push({ start, error: String(error) })
          throw error
        }
      }
      const create = URL.createObjectURL.bind(URL),
        revoke = URL.revokeObjectURL.bind(URL)
      URL.createObjectURL = (blob) => {
        const url = create(blob)
        metrics.liveBlobs.set(url, blob.size)
        metrics.peakBytes = Math.max(
          metrics.peakBytes,
          [...metrics.liveBlobs.values()].reduce((a, b) => a + b, 0)
        )
        metrics.peakUrls = Math.max(metrics.peakUrls, metrics.liveBlobs.size)
        return url
      }
      URL.revokeObjectURL = (url) => {
        metrics.liveBlobs.delete(url)
        revoke(url)
      }
      new PerformanceObserver((list) =>
        metrics.longTasks.push(
          ...list
            .getEntries()
            .map((e) => ({ start: e.startTime, duration: e.duration }))
        )
      ).observe({ type: 'longtask', buffered: true })
      const sample = () => {
        for (const image of document.querySelectorAll(
          '[data-slot="sequence-image"]'
        )) {
          if (image.src.startsWith('blob:')) {
            metrics.samples++
            if (!image.complete || !image.naturalWidth) metrics.incomplete++
          }
        }
        requestAnimationFrame(sample)
      }
      requestAnimationFrame(sample)
    })
    const cdp = await context.newCDPSession(page)
    await cdp.send('Network.enable')
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: metadata.network.latencyMs,
      downloadThroughput: metadata.network.downloadBytesPerSecond,
      uploadThroughput: metadata.network.uploadBytesPerSecond,
      connectionType: 'cellular4g',
    })
    await cdp.send('Tracing.start', {
      categories:
        'devtools.timeline,disabled-by-default-devtools.timeline,blink.user_timing,loading,cc,gpu',
      transferMode: 'ReturnAsStream',
    })
    await page.goto(`http://localhost:4180/?${query}`)
    await page.bringToFront()
    if (name === 'scrub-resize') {
      for (const target of [0, 50, 10, 65, 5, 40, 2]) {
        await page.evaluate(
          (target) => window.controls.setTarget(target),
          target
        )
        await page.waitForTimeout(500)
      }
      await page.evaluate(() => window.controls.setSize(500))
      await page.waitForTimeout(1500)
    } else if (name === 'consecutive') {
      await page.waitForTimeout(7000)
      for (const y of [400, 650, 1000, 400, 0, 1000]) {
        await page.evaluate((y) => scrollTo(0, y), y)
        await page.waitForTimeout(1500)
      }
      await page.waitForTimeout(3000)
    } else {
      await page.waitForTimeout(name === 'simultaneous' ? 24000 : 14000)
    }
    const warmStart = await page.evaluate(() => performance.now())
    await page.waitForTimeout(5000)
    const data = await page.evaluate(() => ({
      ...window.metrics,
      liveBlobs: [...window.metrics.liveBlobs.values()],
      presented: window.presented,
      resources: performance
        .getEntriesByType('resource')
        .filter((e) => e.name.includes('.webp'))
        .map((e) => ({
          url: e.name,
          start: e.startTime,
          end: e.responseEnd,
          duration: e.duration,
          transferSize: e.transferSize,
          decodedBodySize: e.decodedBodySize,
        })),
      images: [...document.querySelectorAll('img')].map((image) => ({
        src: image.src,
        width: image.naturalWidth,
        height: image.naturalHeight,
        cssWidth: image.getBoundingClientRect().width,
      })),
      ended: performance.now(),
    }))
    const traceDone = new Promise((resolve) =>
      cdp.once('Tracing.tracingComplete', resolve)
    )
    await cdp.send('Tracing.end')
    const { stream } = await traceDone
    let trace = ''
    while (true) {
      const chunk = await cdp.send('IO.read', { handle: stream })
      trace += chunk.data
      if (chunk.eof) break
    }
    await cdp.send('IO.close', { handle: stream })
    writeFileSync(`${destination}/${name}.trace.json`, trace)
    await page.screenshot({ path: `${destination}/${name}.png` })
    results.push({ name, warmStart, ...data })
    writeFileSync(
      `${destination}/results.json`,
      JSON.stringify({ metadata, results }, null, 2)
    )
    console.log(
      `${name}: ${data.fetches.length} source fetches, ${data.presented.length} Blob assignments, ${data.incomplete}/${data.samples} incomplete samples`
    )
    await context.close()
  }
} finally {
  await browser.close()
}
