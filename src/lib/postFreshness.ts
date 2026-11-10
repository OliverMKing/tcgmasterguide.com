// How long the latest post stays featured on the home page: a week and a half.
export const LATEST_POST_MAX_AGE_MS = 10.5 * 24 * 60 * 60 * 1000

// True when the post date is within LATEST_POST_MAX_AGE_MS of `now`.
// Posts without a parseable date are treated as stale.
export function isPostFresh(date: string, now: number = Date.now()): boolean {
  const published = new Date(date).getTime()
  if (Number.isNaN(published)) return false
  return now - published <= LATEST_POST_MAX_AGE_MS
}
