import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export type Locale = 'en' | 'es'

export interface PostSummary {
  slug: string
  title: string
  date: string
}

function getPostsDirectory(locale: Locale): string {
  // Spanish posts live in content/posts/es. Fall back to English if the
  // locale directory does not exist or is empty.
  if (locale === 'es') {
    const esDirectory = path.join(process.cwd(), 'content', 'posts', 'es')
    if (fs.existsSync(esDirectory)) {
      const esFiles = fs.readdirSync(esDirectory).filter((f) => f.endsWith('.md'))
      if (esFiles.length > 0) {
        return esDirectory
      }
    }
  }
  return path.join(process.cwd(), 'content', 'posts')
}

// Normalize a frontmatter `date` value to `YYYY-MM-DDT00:00:00` (local midnight).
// YAML parses an unquoted date into a Date object; a quoted date stays a string.
// The local-midnight form sorts lexically by calendar date and renders on the
// author's intended day regardless of the viewer's timezone.
export function normalizeDate(value: unknown): string {
  if (!value) return ''
  if (value instanceof Date) {
    const y = value.getUTCFullYear()
    const m = String(value.getUTCMonth() + 1).padStart(2, '0')
    const d = String(value.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${d}T00:00:00`
  }
  const str = String(value)
  const match = str.match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? `${match[1]}T00:00:00` : str
}

// Read all posts for a locale, sorted newest first by the `date` frontmatter field.
export function getAllPosts(locale: Locale): PostSummary[] {
  const postsDirectory = getPostsDirectory(locale)

  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const filenames = fs.readdirSync(postsDirectory)

  return filenames
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, '')
      const filePath = path.join(postsDirectory, filename)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const { data } = matter(fileContent)

      return {
        slug,
        title: data.title || slug,
        date: normalizeDate(data.date),
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

// Read a single post's metadata (title + date) for the given locale.
// Returns null when the post does not exist for that locale (triggers 404).
export function getPostMetadata(slug: string, locale: string = 'en') {
  const dir =
    locale === 'es'
      ? path.join(process.cwd(), 'content', 'posts', 'es')
      : path.join(process.cwd(), 'content', 'posts')
  const filePath = path.join(dir, `${slug}.md`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { data } = matter(fileContent)
    return {
      title: data.title as string,
      date: normalizeDate(data.date),
    }
  } catch {
    return null
  }
}

// All English post slugs, used for static generation.
export function getAllPostSlugs(): string[] {
  const postsDirectory = path.join(process.cwd(), 'content', 'posts')
  if (!fs.existsSync(postsDirectory)) {
    return []
  }
  return fs
    .readdirSync(postsDirectory)
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => filename.replace(/\.md$/, ''))
}
