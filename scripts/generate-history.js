#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const decksDir = path.join(__dirname, '..', 'content', 'decks')
const outputDir = path.join(__dirname, '..', 'src', 'generated')

// Number of history entries to keep
const MAX_HISTORY_ENTRIES = 3
// Fetch more commits to account for skipped ones (metadata-only, excluded lines)
const MAX_COMMITS_TO_FETCH = 5

function getGitHistory(filePath) {
  try {
    // Get more commits than needed to account for skipped ones
    // Format: commit hash, date, subject
    const log = execSync(
      `git log --follow --format="%H|%cI|%s" -n ${MAX_COMMITS_TO_FETCH} -- "${filePath}"`,
      { encoding: 'utf8' }
    ).trim()

    if (!log) return []

    const commits = log.split('\n').map((line) => {
      const [hash, date, ...subjectParts] = line.split('|')
      return {
        hash,
        date,
        subject: subjectParts.join('|'), // Handle subjects with | in them
      }
    })

    return commits
  } catch {
    return []
  }
}

function getFileContentAtCommit(filePath, commitHash) {
  try {
    // Get relative path from repo root
    const repoRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim()
    const relativePath = path.relative(repoRoot, filePath)

    const content = execSync(`git show ${commitHash}:"${relativePath}"`, {
      encoding: 'utf8',
    })
    return content
  } catch {
    return null
  }
}

function extractMarkdownContent(fileContent) {
  // Remove frontmatter and return just the markdown body
  if (!fileContent.startsWith('---')) return fileContent

  const endOfFrontmatter = fileContent.indexOf('---', 3)
  if (endOfFrontmatter === -1) return fileContent

  return fileContent.slice(endOfFrontmatter + 3).trim()
}

function getHeadingAtLine(lines, lineIndex) {
  // Walk backwards from lineIndex to find the most recent heading
  for (let i = lineIndex; i >= 0; i--) {
    const line = lines[i]
    if (line.startsWith('## ') || line.startsWith('### ')) {
      return line.replace(/^#+\s*/, '')
    }
  }
  return null
}

function shouldExcludeLine(line) {
  const trimmed = line.trim().toLowerCase()
  return trimmed.includes('<!-- public -->') || trimmed.includes('private')
}

function computeDiff(oldContent, newContent) {
  if (!oldContent) {
    // This is the first commit, everything is an addition
    const lines = newContent.split('\n')
    const filteredChanges = lines
      .map((line, i) => ({
        type: 'add',
        lineNumber: i + 1,
        content: line,
        heading: getHeadingAtLine(lines, i),
      }))
      .filter((c) => !shouldExcludeLine(c.content))
    return {
      additions: filteredChanges.length,
      deletions: 0,
      changes: filteredChanges,
    }
  }

  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')

  // Simple line-by-line diff
  const changes = []
  let additions = 0
  let deletions = 0

  // Find changed, added, and deleted lines using a simple comparison
  // This is a simplified diff - for production you might want a proper diff library
  const oldSet = new Set(oldLines)
  const newSet = new Set(newLines)

  // Lines that are new
  newLines.forEach((line, i) => {
    if (!oldSet.has(line) && !shouldExcludeLine(line)) {
      changes.push({
        type: 'add',
        lineNumber: i + 1,
        content: line,
        heading: getHeadingAtLine(newLines, i),
      })
      additions++
    }
  })

  // Lines that were removed
  oldLines.forEach((line, i) => {
    if (!newSet.has(line) && !shouldExcludeLine(line)) {
      changes.push({
        type: 'remove',
        lineNumber: i + 1,
        content: line,
        heading: getHeadingAtLine(oldLines, i),
      })
      deletions++
    }
  })

  return { additions, deletions, changes }
}

function generateHistoryForDeck(filePath) {
  const commits = getGitHistory(filePath)

  if (commits.length === 0) return []

  const history = []
  let commitIndex = 0

  // Keep processing commits until we have enough history entries or run out of commits
  while (history.length < MAX_HISTORY_ENTRIES && commitIndex < commits.length) {
    const commit = commits[commitIndex]
    const previousCommit = commits[commitIndex + 1]

    commitIndex++

    // Skip if this is the last commit and there's no previous to diff against
    // (we can't show meaningful changes without a baseline)
    if (!previousCommit) continue

    const currentContent = getFileContentAtCommit(filePath, commit.hash)
    const previousContent = getFileContentAtCommit(filePath, previousCommit.hash)

    if (!currentContent) continue

    const currentMarkdown = extractMarkdownContent(currentContent)
    const previousMarkdown = previousContent ? extractMarkdownContent(previousContent) : null

    const diff = computeDiff(previousMarkdown, currentMarkdown)

    // Filter to only significant changes (non-empty lines)
    const significantChanges = diff.changes.filter((c) => c.content.trim().length > 0)

    // Skip commits with no meaningful changes (metadata-only or only excluded lines)
    if (significantChanges.length === 0) continue

    history.push({
      hash: commit.hash.substring(0, 7),
      date: commit.date,
      subject: commit.subject,
      additions: diff.additions,
      deletions: diff.deletions,
      changes: significantChanges.slice(0, 50), // Limit to 50 changes per version
    })
  }

  return history
}

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Process all markdown files in decks directory
const files = fs.readdirSync(decksDir).filter((f) => f.endsWith('.md'))

const allHistory = {}

for (const file of files) {
  const slug = file.replace(/\.md$/, '')
  const filePath = path.join(decksDir, file)
  const history = generateHistoryForDeck(filePath)

  if (history.length > 0) {
    allHistory[slug] = history
    console.log(`Generated history for ${slug}: ${history.length} entries`)
  }
}

// Write the history data as a TypeScript file for type safety
const outputPath = path.join(outputDir, 'deck-history.ts')
const tsContent = `// This file is auto-generated by scripts/generate-history.js
// Do not edit manually

export interface HistoryChange {
  type: 'add' | 'remove'
  lineNumber: number
  content: string
  heading: string | null
}

export interface HistoryEntry {
  hash: string
  date: string
  subject: string
  additions: number
  deletions: number
  changes: HistoryChange[]
}

export type DeckHistory = Record<string, HistoryEntry[]>

export const deckHistory: DeckHistory = ${JSON.stringify(allHistory, null, 2)}
`

fs.writeFileSync(outputPath, tsContent)
console.log(`\nWrote history data to ${outputPath}`)
console.log('Done generating deck history')
