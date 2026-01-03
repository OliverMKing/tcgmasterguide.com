'use client'

import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              TCG Master Guide
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-text-secondary dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-text-secondary dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
            >
              About
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
