import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

const siteUrl = 'https://tcgmasterguide.com'

function getAllDeckSlugs(): string[] {
  const decksDirectory = path.join(process.cwd(), 'content', 'decks')
  const filenames = fs.readdirSync(decksDirectory)
  return filenames
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => filename.replace(/\.md$/, ''))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const deckSlugs = getAllDeckSlugs()

  const deckUrls = deckSlugs.map((slug) => ({
    url: `${siteUrl}/decks/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...deckUrls,
  ]
}
