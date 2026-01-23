/**
 * Fetch wrapper that handles Clerk JWT expiration by retrying once on 401.
 * When a 401 is received, it waits briefly for Clerk to refresh the token,
 * then retries the request.
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, options)

  if (response.status === 401) {
    // Wait a moment for Clerk to refresh the token in the background
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Retry the request once
    return fetch(url, options)
  }

  return response
}
