import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

// Compile the two real runtime modules in memory; no build/config or test deps.
const compiled = Object.fromEntries(
  ['runtime', 'transfer'].map((name) => [
    name,
    ts.transpileModule(
      readFileSync(
        new URL(`../registry/lib/image-sequence/${name}.ts`, import.meta.url),
        'utf8'
      ),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      }
    ).outputText,
  ])
)
const settle = async () => {
  for (let i = 0; i < 60; i++) await Promise.resolve()
}
const deferred = () => {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}

function setup(t, { fetch: load, decode = async () => {} } = {}) {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const requests = [],
    revoked = [],
    blobs = new Map(),
    modules = new Map()
  const controllers = [],
    owners = []
  let serial = 0
  const globals = {
    AbortController,
    DOMException,
    Blob,
    setTimeout: (...args) => setTimeout(...args),
    clearTimeout: (id) => clearTimeout(id),
    requestAnimationFrame: (callback) => setTimeout(() => callback(0), 16),
    cancelAnimationFrame: (id) => clearTimeout(id),
    fetch: async (url, options) => {
      requests.push(url)
      return load ? load(url, options) : new Response(url)
    },
    URL: {
      createObjectURL: (blob) => {
        const url = `blob:${++serial}`
        blobs.set(url, blob)
        return url
      },
      revokeObjectURL: (url) => {
        revoked.push(url)
        blobs.delete(url)
      },
    },
    Image: class {
      src = ''
      decode() {
        return blobs
          .get(this.src)
          .text()
          .then((source) => decode(source))
      }
      removeAttribute(name) {
        if (name === 'src') this.src = ''
      }
    },
  }
  const loadModule = (name) => {
    name = name.replace('./', '')
    if (!modules.has(name)) {
      const exports = {}
      modules.set(name, exports)
      runInNewContext(compiled[name], {
        ...globals,
        exports,
        require: loadModule,
      })
    }
    return modules.get(name)
  }
  const { SequenceDemandController } = loadModule('runtime')
  const transfer = loadModule('transfer').getSharedFrameTransfer()
  t.after(async () => {
    controllers.forEach((controller) => controller.dispose())
    owners.forEach((owner) => transfer.release(owner))
    await settle()
    t.mock.timers.tick(1000)
    await settle()
  })
  return {
    requests,
    revoked,
    transfer,
    owner() {
      const owner = Symbol()
      owners.push(owner)
      return owner
    },
    controller(options) {
      const controller = new SequenceDemandController({
        frameCount: 1,
        source: (i) => `/frame/${i}`,
        ...options,
      })
      controllers.push(controller)
      return controller
    },
  }
}

test('replacement retains the visible Blob until the new controller presents', async (t) => {
  const replacement = deferred()
  const env = setup(t, {
    decode: (source) =>
      source.startsWith('/new') ? replacement.promise : Promise.resolve(),
  })
  let visible, release
  const present = (controller) => (_, image) => {
    const previous = release
    release = controller.retainSurface(image)
    visible = image.src
    previous?.()
  }
  const old = env.controller({ onFrame: (...args) => present(old)(...args) })
  old.setConditions(true, true)
  await settle()
  const oldUrl = visible
  assert.ok(oldUrl)
  old.dispose()
  const next = env.controller({
    source: (i) => `/new/${i}`,
    onFrame: (...args) => present(next)(...args),
  })
  next.setConditions(true, true)
  await settle()
  assert.equal(visible, oldUrl)
  assert.ok(!env.revoked.includes(oldUrl))
  replacement.resolve()
  await settle()
  assert.notEqual(visible, oldUrl)
  assert.ok(env.revoked.includes(oldUrl))
  next.dispose()
  assert.ok(!env.revoked.includes(visible))
  release()
  assert.ok(env.revoked.includes(visible))
})

test('a cancelled decode cannot commit after controller replacement', async (t) => {
  const late = deferred(),
    presented = []
  const env = setup(t, {
    decode: (source) =>
      source.startsWith('/old') ? late.promise : Promise.resolve(),
  })
  const old = env.controller({
    source: (i) => `/old/${i}`,
    onFrame: () => presented.push('old'),
  })
  old.setConditions(true, true)
  await settle()
  old.dispose()
  const next = env.controller({ onFrame: () => presented.push('new') })
  next.setConditions(true, true)
  await settle()
  late.resolve()
  await settle()
  assert.deepEqual(presented, ['new'])
  assert.ok(env.revoked.length > 0)
})

test('visible demand reclaims contended nearby transfers without exceeding eight', async (t) => {
  let active = 0,
    peak = 0
  const env = setup(t, {
    fetch: (_, { signal }) =>
      new Promise((_, reject) => {
        peak = Math.max(peak, ++active)
        signal.addEventListener(
          'abort',
          () => {
            active--
            reject(signal.reason)
          },
          { once: true }
        )
      }),
  })
  const nearby = env.owner(),
    visible = env.owner()
  const demand = (prefix, count) =>
    Array.from({ length: count }, (_, i) => ({
      source: `${prefix}/${i}`,
      priority: i,
    }))
  env.transfer.update(nearby, demand('/nearby', 8), () => {}, false)
  env.transfer.update(visible, demand('/visible', 2), () => {}, true)
  assert.equal(env.requests.length, 8)
  t.mock.timers.tick(1000)
  await settle()
  assert.ok(env.requests.includes('/visible/0'))
  assert.ok(env.requests.includes('/visible/1'))
  assert.equal(peak, 8)
})

test('both one-shot policies complete once, only after the final decoded frame', async (t) => {
  const env = setup(t)
  for (const priority of ['hybrid', 'sequential']) {
    const presented = []
    let completions = 0
    const controller = env.controller({
      frameCount: 3,
      frameDuration: 10,
      priority,
      loop: false,
      onFrame: (index) => {
        presented.push(index)
      },
      onComplete: () => {
        assert.equal(presented.at(-1), 2)
        completions++
      },
    })
    controller.setConditions(true, true)
    await settle()
    assert.equal(completions, 0)
    for (let i = 0; i < 4; i++) {
      controller.tick(10)
      await settle()
    }
    assert.equal(presented.at(-1), 2)
    assert.equal(controller.isComplete, true)
    controller.setConditions(false, false)
    controller.setConditions(true, true)
    controller.tick(1000)
    await settle()
    assert.equal(completions, 1)
  }
})

test('terminal HTTP errors stay failed while wanted instead of retrying forever', async (t) => {
  const env = setup(t, {
    fetch: async () => new Response(null, { status: 404 }),
  })
  const owner = env.owner(),
    wanted = [{ source: '/missing', priority: 0 }]
  env.transfer.update(owner, wanted, () => {})
  await settle()
  for (let i = 0; i < 5; i++) {
    t.mock.timers.tick(30_000)
    await settle()
    env.transfer.update(owner, wanted, () => {})
  }
  assert.equal(env.requests.length, 1)
})

test('transient HTTP errors still retry and recover', async (t) => {
  let attempts = 0
  const env = setup(t, {
    fetch: async () =>
      ++attempts === 1
        ? new Response(null, { status: 503 })
        : new Response('frame'),
  })
  env.transfer.update(
    env.owner(),
    [{ source: '/temporary', priority: 0 }],
    () => {}
  )
  await settle()
  t.mock.timers.tick(500)
  await settle()
  assert.equal(attempts, 2)
  assert.ok(env.transfer.get('/temporary'))
})
