import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, parse } from "node:path"
import matter from "gray-matter"
import readingTime from "reading-time"

const CONTENT_DIR = join(process.cwd(), "content")

export type DocPage = {
  slug: string[]
  title: string
  description: string | null
  content: string
  weight: number
  readingTime: { text: string; minutes: number; words: number }
}

function parseDoc(filePath: string, slug: string[]): DocPage | null {
  const raw = readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)

  if (!data.title) return null

  return {
    slug,
    title: data.title,
    description: data.description ?? null,
    content,
    weight: data.weight ?? 50,
    readingTime: readingTime(content),
  }
}

function scanDirectory(dir: string, basePath: string[] = []): DocPage[] {
  const results: DocPage[] = []

  let names: string[]
  try {
    names = readdirSync(dir)
  } catch {
    return results
  }

  for (const name of names) {
    if (name.startsWith(".")) continue

    const fullPath = join(dir, name)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      // Check for _index.md (section index)
      const indexPath = join(fullPath, "_index.md")
      try {
        statSync(indexPath)
        const raw = readFileSync(indexPath, "utf-8")
        const { data } = matter(raw)
        if (data.title) {
          results.push({
            slug: [...basePath, name],
            title: data.title,
            description: data.description ?? null,
            content: "",
            weight: data.weight ?? 50,
            readingTime: { text: "0 min read", minutes: 0, words: 0 },
          })
        }
      } catch {
        // no _index.md, that's fine
      }

      results.push(...scanDirectory(fullPath, [...basePath, name]))
    } else if (name.endsWith(".md") && name !== "_index.md") {
      const baseName = parse(name).name
      const slug = [...basePath, baseName]
      const doc = parseDoc(fullPath, slug)
      if (doc) results.push(doc)
    }
  }

  return results
}

let _cached: DocPage[] | null = null

export function getAllDocs(): DocPage[] {
  if (_cached) return _cached
  _cached = scanDirectory(CONTENT_DIR)
  return _cached
}

export function getDocBySlug(slug: string[]): DocPage | null {
  return getAllDocs().find((d) => d.slug.join("/") === slug.join("/")) ?? null
}

export function getDocsInSection(section: string): DocPage[] {
  return getAllDocs()
    .filter((d) => d.slug[0] === "docs" && d.slug[1] === section && d.slug.length === 3)
    .sort((a, b) => a.weight - b.weight)
}

export function getDocSections(): { slug: string; title: string }[] {
  return getAllDocs()
    .filter((d) => d.slug[0] === "docs" && d.slug.length === 2)
    .sort((a, b) => a.weight - b.weight)
    .map((d) => ({ slug: d.slug[1]!, title: d.title }))
}
