import { execSync } from 'child_process'

export function getGitLastModified(filePath: string): string | null {
  try {
    const timestamp = execSync(
      `git log -1 --format=%cI -- "${filePath}"`,
      { encoding: 'utf8' }
    ).trim()
    if (!timestamp) return null
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return null
  }
}
