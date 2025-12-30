import Link from 'next/link'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import ReactMarkdown from 'react-markdown'

const decks = [
  'beginner-guide',
  'deck-building',
  'meta-analysis',
  'card-values',
  'tournament-prep',
  'trading-tips',
]

function getDeckContent(slug: string) {
  try {
    const filePath = path.join(process.cwd(), 'content', 'decks', `${slug}.md`)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContent)
    return {
      title: data.title,
      category: data.category,
      date: data.date,
      content,
    }
  } catch (error) {
    return null
  }
}

export function generateStaticParams() {
  return decks.map((slug) => ({
    slug,
  }))
}

export default async function DeckPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const deck = getDeckContent(slug)

  if (!deck) {
    notFound()
  }

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-purple-700 hover:text-purple-600 mb-8"
        >
          <span className="mr-2">←</span>
          Back to Home
        </Link>

        {/* Deck Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs font-semibold text-purple-700 bg-surface-secondary px-3 py-1 rounded-full">
              {deck.category}
            </span>
            <span className="text-sm text-text-secondary">{deck.date}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            {deck.title}
          </h1>
        </div>

        {/* Deck Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-lg border border-border p-8">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h2 className="text-3xl font-bold text-text-primary mt-8 mb-4 first:mt-0">
                    {children}
                  </h2>
                ),
                h2: ({ children }) => (
                  <h3 className="text-2xl font-bold text-text-primary mt-6 mb-3">
                    {children}
                  </h3>
                ),
                h3: ({ children }) => (
                  <h4 className="text-xl font-bold text-text-primary mt-4 mb-2">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="text-text-secondary leading-relaxed mb-4">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 text-text-secondary ml-4 mb-4">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-2 text-text-secondary ml-4 mb-4">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-text-secondary">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-text-primary">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic">{children}</em>
                ),
                code: ({ children }) => (
                  <code className="bg-surface-secondary px-2 py-1 rounded text-sm font-mono">
                    {children}
                  </code>
                ),
              }}
            >
              {deck.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Related Decks CTA */}
        <div className="mt-12 text-center bg-surface-secondary rounded-lg p-8">
          <h3 className="text-2xl font-bold text-text-primary mb-4">
            Want to learn more?
          </h3>
          <Link
            href="/"
            className="inline-block bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Browse More Decks
          </Link>
        </div>
      </article>
    </main>
  )
}
