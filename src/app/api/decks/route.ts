import { NextResponse, type NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface Deck {
  slug: string
  title: string
}

type Locale = 'en' | 'es'

function getDecksDirectory(locale: Locale): string {
  if (locale === 'es') {
    return path.join(process.cwd(), 'content', 'decks', 'es')
  }
  return path.join(process.cwd(), 'content', 'decks')
}

// GET /api/decks - Get list of all decks (slug and title only)
// Query params: ?locale=en|es (defaults to 'en')
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const localeParam = searchParams.get('locale')
    const locale: Locale = localeParam === 'es' ? 'es' : 'en'

    const decksDirectory = getDecksDirectory(locale)

    // Check if directory exists
    if (!fs.existsSync(decksDirectory)) {
      // Return empty array if no Spanish decks yet
      return NextResponse.json([])
    }

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
