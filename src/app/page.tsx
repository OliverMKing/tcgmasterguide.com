import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { getGitLastModified } from '@/lib/git'

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
        lastEdited: getGitLastModified(filePath),
      }
    })

  return decks
}

export default function Home() {
  const decks = getAllDecks()
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-fuchsia-600/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-700 to-fuchsia-600 bg-clip-text text-transparent mb-6">
              TCG Master Guide
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              In-depth deck guides by Grant Manley, former world #1 ranked player. Constantly updated to keep you ahead of the meta.
            </p>
          </div>
        </div>
      </div>

      {/* Decks Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-slate-900">
            Decks
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent ml-8" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <Link
              key={deck.id}
              href={`/decks/${deck.id}`}
              className="group relative bg-white rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 p-6"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-purple-700 transition-colors pr-4">
                  {deck.title}
                </h3>
                <span className="shrink-0 w-8 h-8 rounded-full bg-slate-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
              {deck.lastEdited && (
                <p className="text-sm text-slate-400 mt-3">
                  Updated {deck.lastEdited}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>

    </main>
  )
}
