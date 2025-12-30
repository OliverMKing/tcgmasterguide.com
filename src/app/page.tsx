import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

function getAllDecks() {
  const decksDirectory = path.join(process.cwd(), 'content', 'decks')
  const filenames = fs.readdirSync(decksDirectory)

  const decks = filenames
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, '')
      const filePath = path.join(decksDirectory, filename)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const { data } = matter(fileContent)

      return {
        id: slug,
        title: data.title || slug,
        description: data.description || '',
        category: data.category || 'General',
      }
    })

  return decks
}

export default function Home() {
  const decks = getAllDecks()
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-purple-700 mb-4">
            TCG Master Guide
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Your ultimate Pokemon TCG companion. Master the game with expert deck guides,
            strategies, and insights.
          </p>
        </div>

        {/* Decks Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-8">
            Deck Guides & Strategy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <Link
                key={deck.id}
                href={`/decks/${deck.id}`}
                className="block bg-white rounded-lg border border-border hover:border-purple-700 hover:shadow-lg transition-all p-6 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-purple-700 bg-surface-secondary px-3 py-1 rounded-full">
                    {deck.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-purple-700 transition-colors">
                  {deck.title}
                </h3>
                <p className="text-text-secondary">
                  {deck.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div
          className="text-center rounded-lg p-8 text-white"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)' }}
        >
          <h2 className="text-3xl font-bold mb-4">
            Stay Updated with the Latest Strategies
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Subscribe to get new deck guides, meta updates, and expert tips delivered to your inbox
          </p>
          <form className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="bg-white text-purple-700 font-semibold px-6 py-3 rounded-lg hover:bg-surface-secondary transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
