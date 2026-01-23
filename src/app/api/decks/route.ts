import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface Deck {
  slug: string
  title: string
}

// GET /api/decks - Get list of all decks (slug and title only)
export async function GET() {
  try {
    const decksDirectory = path.join(process.cwd(), 'content', 'decks')
    const filenames = fs.readdirSync(decksDirectory)

    const decks: Deck[] = filenames
      .filter((filename) => filename.endsWith('.md'))
      .map((filename) => {
        const slug = filename.replace(/\.md$/, '')
        const filePath = path.join(decksDirectory, filename)
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const { data } = matter(fileContent)

        return {
          slug,
          title: data.title || slug,
        }
      })
      .sort((a, b) => a.title.localeCompare(b.title))

    return NextResponse.json(decks)
  } catch (error) {
    console.error('Error fetching decks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch decks' },
      { status: 500 }
    )
  }
}
