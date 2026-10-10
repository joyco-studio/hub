import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

const compiled = ts.transpileModule(
  readFileSync(new URL('../lib/github-visibility.ts', import.meta.url), 'utf8'),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }
).outputText

function setup(fetch, token) {
  const exports = {}
  runInNewContext(compiled, {
    exports,
    URL,
    fetch,
    process: { env: { GITHUB_TOKEN: token } },
    require: (name) => {
      assert.equal(name, 'server-only')
      return {}
    },
  })
  return exports
}

test('normalizes file URLs and preserves non-repository destinations', () => {
  const { getGitHubRepository } = setup()
  assert.equal(
    getGitHubRepository(
      'https://github.com/JOYCO-STUDIO/PortalGL.git/blob/main/a.ts'
    ),
    'joyco-studio/portalgl'
  )
  for (const url of [
    'https://github.com/joyco-studio',
    'https://example.com/a/b',
    'invalid',
  ]) {
    assert.equal(getGitHubRepository(url), null)
  }
})

test('only explicit public visibility is accepted, even with private access', async () => {
  for (const data of [
    { private: false },
    { private: true },
    {},
    null,
    { private: 'false' },
  ]) {
    const { isRepoPublic } = setup(async (url, options) => {
      assert.equal(url, 'https://api.github.com/repos/team/repo')
      assert.equal(options.headers.Authorization, 'Bearer test-token')
      assert.equal(options.next.revalidate, 3600)
      return { ok: true, json: async () => data }
    }, 'test-token')
    assert.equal(
      await isRepoPublic('https://github.com/team/repo'),
      data?.private === false
    )
  }
})

test('unavailable repositories and failed responses fail closed', async () => {
  for (const fetch of [
    async () => ({ ok: false }),
    async () => {
      throw new Error('network')
    },
    async () => ({
      ok: true,
      json: async () => {
        throw new Error('invalid JSON')
      },
    }),
  ]) {
    const { isRepoPublic } = setup(fetch)
    assert.equal(await isRepoPublic('https://github.com/team/repo'), false)
    assert.equal(await isRepoPublic(undefined), false)
    assert.equal(await isRepoPublic('invalid'), false)
  }
})

test('filters independently, preserves order and other links, and deduplicates repositories', async () => {
  const requests = []
  const { filterPublicRepoLinks } = setup(async (url, options) => {
    requests.push(url)
    assert.equal(options.headers.Authorization, undefined)
    return {
      ok: true,
      json: async () => ({ private: !url.endsWith('/team/public') }),
    }
  })
  const links = [
    { href: 'https://github.com/team/private' },
    { href: 'https://github.com/team/public' },
    { href: 'https://example.com/docs' },
    { href: 'https://github.com/team' },
    { href: 'https://github.com/team/public/blob/main/file' },
  ]
  assert.deepEqual(
    Array.from(await filterPublicRepoLinks(links)),
    links.slice(1)
  )
  assert.equal(requests.length, 2)
})
