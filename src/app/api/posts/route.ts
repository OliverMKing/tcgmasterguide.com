import { NextResponse, type NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { normalizeDate } from '@/lib/posts'

interface Post {
  slug: string
  title: string
  date: string
}

type Locale = 'en' | 'es'

function getPostsDirectory(locale: Locale): string {
  if (locale === 'es') {
    return path.join(process.cwd(), 'content', 'posts', 'es')
  }
  return path.join(process.cwd(), 'content', 'posts')
}

// GET /api/posts - Get list of all posts (slug, title, date), newest first
// Query params: ?locale=en|es (defaults to 'en')
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const localeParam = searchParams.get('locale')
    const locale: Locale = localeParam === 'es' ? 'es' : 'en'

    const postsDirectory = getPostsDirectory(locale)

    // Return empty array if the directory doesn't exist yet
    if (!fs.existsSync(postsDirectory)) {
      return NextResponse.json([])
    }

    const filenames = fs.readdirSync(postsDirectory)

    const posts: Post[] = filenames
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

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}
