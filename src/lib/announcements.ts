import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface AnnouncementMeta {
  slug: string
  title: string
  date: string
  summary: string
}

export interface Announcement extends AnnouncementMeta {
  content: string
}

const announcementsDirectory = path.join(process.cwd(), 'content', 'announcements')

/**
 * Get all announcement slugs (filenames without .md extension).
 */
export function getAllAnnouncementSlugs(): string[] {
  if (!fs.existsSync(announcementsDirectory)) {
    return []
  }
  const filenames = fs.readdirSync(announcementsDirectory)
  return filenames
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => filename.replace(/\.md$/, ''))
}

/**
 * Get all announcements with metadata, sorted by date descending (newest first).
 */
export function getAllAnnouncements(): AnnouncementMeta[] {
  const slugs = getAllAnnouncementSlugs()

  const announcements = slugs.map((slug) => {
    const filePath = path.join(announcementsDirectory, `${slug}.md`)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { data } = matter(fileContent)

    return {
      slug,
      title: data.title || slug,
      date: data.date || '',
      summary: data.summary || '',
    }
  })

  return announcements.sort((a, b) => {
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

/**
 * Get a single announcement by slug, including full markdown content.
 */
export function getAnnouncementBySlug(slug: string): Announcement | null {
  try {
    const filePath = path.join(announcementsDirectory, `${slug}.md`)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContent)

    return {
      slug,
      title: data.title || slug,
      date: data.date || '',
      summary: data.summary || '',
      content,
    }
  } catch {
    return null
  }
}
