import Link from 'next/link'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import ReactMarkdown from 'react-markdown'

function getAllDeckSlugs() {
  const decksDirectory = path.join(process.cwd(), 'content', 'decks')
  const filenames = fs.readdirSync(decksDirectory)
  return filenames
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => filename.replace(/\.md$/, ''))
}

function getDeckContent(slug: string) {
  try {
    const filePath = path.join(process.cwd(), 'content', 'decks', `${slug}.md`)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContent)
    return {
      title: data.title,
      lastEdited: data.lastEdited,
      content,
    }
  } catch {
    return null
  }
}

export function generateStaticParams() {
  return getAllDeckSlugs().map((slug) => ({
    slug,
  }))
}

export default async function DeckPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const deck = getDeckContent(slug)

  if (!deck) {
    notFound()
  }

  // Transform relative image paths to API route
  const transformImageSrc = (src: string) => {
    if (src.startsWith('./images/')) {
      return `/api/deck-images/${src.replace('./images/', '')}`
    }
    return src
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-purple-700 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Guides
          </Link>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
            {deck.title}
          </h1>
          {deck.lastEdited && (
            <p className="text-sm text-slate-500">
              Last updated {deck.lastEdited}
            </p>
          )}
        </header>

        {/* Article Content */}
        <div className="prose prose-slate prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-4 first:mt-0 pb-2 border-b border-slate-200">
                  {children}
                </h2>
              ),
              h2: ({ children }) => (
                <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-4">
                  {children}
                </h3>
              ),
              h3: ({ children }) => (
                <h4 className="text-xl font-semibold text-slate-900 mt-8 mb-3">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="text-slate-600 leading-relaxed mb-6">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="space-y-3 text-slate-600 mb-6 pl-0">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="space-y-3 text-slate-600 mb-6 pl-0 list-decimal list-inside">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-slate-600 flex items-start gap-3">
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5" />
                  <span>{children}</span>
                </li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-slate-900">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-slate-700">{children}</em>
              ),
              code: ({ children }) => (
                <code className="bg-slate-100 text-purple-700 px-2 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              ),
              img: ({ src, alt }) => {
                const imageSrc = transformImageSrc(typeof src === 'string' ? src : '')
                return (
                  <span className="block my-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageSrc}
                      alt={alt || ''}
                      className="rounded-xl border border-slate-200 shadow-lg w-full h-auto"
                    />
                  </span>
                )
              },
            }}
          >
            {deck.content}
          </ReactMarkdown>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              Explore More Guides
            </h3>
            <p className="text-purple-100 mb-6">
              Continue your journey with our other expert guides
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white text-purple-700 font-semibold px-6 py-3 rounded-xl hover:bg-purple-50 transition-colors shadow-lg shadow-purple-900/20"
            >
              Browse All Guides
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </article>
    </main>
  )
}
