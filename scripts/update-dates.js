#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const decksDir = path.join(__dirname, '..', 'content', 'decks')

function getGitLastModified(filePath) {
  try {
    const timestamp = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
      encoding: 'utf8',
    }).trim()
    return timestamp || null
  } catch {
    return null
  }
}

function updateFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lastEdited = getGitLastModified(filePath)

  if (!lastEdited) return

  // Check if file has frontmatter
  if (!content.startsWith('---')) {
    console.log(`Skipping ${filePath} - no frontmatter`)
    return
  }

  const endOfFrontmatter = content.indexOf('---', 3)
  if (endOfFrontmatter === -1) return

  const frontmatter = content.slice(3, endOfFrontmatter)
  const body = content.slice(endOfFrontmatter + 3)

  // Remove existing lastEdited if present
  const cleanedFrontmatter = frontmatter
    .split('\n')
    .filter((line) => !line.startsWith('lastEdited:'))
    .join('\n')

  // Add new lastEdited
  const newFrontmatter = cleanedFrontmatter.trimEnd() + `\nlastEdited: "${lastEdited}"\n`
  const newContent = '---' + newFrontmatter + '---' + body

  fs.writeFileSync(filePath, newContent)
  console.log(`Updated ${path.basename(filePath)}`)
}

// Process all markdown files in decks directory
const files = fs.readdirSync(decksDir).filter((f) => f.endsWith('.md'))

for (const file of files) {
  updateFrontmatter(path.join(decksDir, file))
}

console.log('Done updating dates')
