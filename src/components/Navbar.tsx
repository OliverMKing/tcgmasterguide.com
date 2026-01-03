import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-purple-700">
              TCG Master Guide
            </span>
          </Link>

          <div className="flex space-x-8">
            <Link
              href="/"
              className="text-text-secondary hover:text-purple-700 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-text-secondary hover:text-purple-700 transition-colors"
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
