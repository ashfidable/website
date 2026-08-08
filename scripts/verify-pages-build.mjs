import { access, readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const outputUrl = new URL('../dist/client/', import.meta.url)
const staleRootIndexUrl = new URL('../dist/index.html', import.meta.url)

async function exists(url) {
  try {
    await access(url)
    return true
  } catch {
    return false
  }
}

async function walk(directoryUrl) {
  const entries = await readdir(directoryUrl, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const entryUrl = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directoryUrl)
    if (entry.isDirectory()) files.push(...await walk(entryUrl))
    else files.push(entryUrl)
  }
  return files
}

if (!await exists(new URL('index.html', outputUrl))) {
  throw new Error('Cloudflare Pages output is missing dist/client/index.html')
}

if (await exists(staleRootIndexUrl)) {
  throw new Error('Stale dist/index.html found. Cloudflare Pages must publish dist/client, not dist.')
}

const outputFiles = await walk(outputUrl)
const htmlFiles = outputFiles.filter((url) => url.pathname.endsWith('.html'))
const checkedAssets = new Set()

for (const htmlUrl of htmlFiles) {
  const html = await readFile(htmlUrl, 'utf8')
  if (html.includes('/_astro/') || html.includes('Astro v')) {
    throw new Error(`Astro output leaked into ${fileURLToPath(htmlUrl)}`)
  }

  for (const match of html.matchAll(/(?:href|src)="(\/[^"?#]+)(?:[?#][^"]*)?"/g)) {
    const pathname = match[1]
    if (!/\.[a-z0-9]+$/i.test(pathname)) continue
    const assetUrl = new URL(`.${pathname}`, outputUrl)
    if (!await exists(assetUrl)) {
      throw new Error(`Missing static asset ${pathname} referenced by ${fileURLToPath(htmlUrl)}`)
    }
    checkedAssets.add(pathname)
  }
}

console.log(
  `Cloudflare Pages output verified: ${htmlFiles.length} HTML files, ` +
  `${checkedAssets.size} referenced assets, no Astro output. Publish dist/client.`,
)
