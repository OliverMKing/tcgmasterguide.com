// The id of a tier's zone on the home page, so links can jump straight to it
// (for example, "Back to decks" on a deck page returns to that deck's tier).
// With several formats on the page, the format is part of the id so tiers do not clash.
export function tierAnchor(tier: number, format?: string): string {
  const multiFormat = process.env.NEXT_PUBLIC_ENABLE_MULTI_FORMAT === 'true'
  if (multiFormat && format) {
    const formatSlug = format.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return `${formatSlug}-tier-${tier}`
  }
  return `tier-${tier}`
}
