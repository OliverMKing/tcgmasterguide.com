import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

// Routes that should be protected by Clerk (require authentication)
const isProtectedRoute = createRouteMatcher([
  '/(en|es)/admin(.*)',
  '/admin(.*)',
])

// Routes that next-intl should handle (all public pages)
const isIntlRoute = createRouteMatcher([
  '/',
  '/(en|es)',
  '/(en|es)/(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // If it's a protected route, ensure user is authenticated
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  // Handle i18n routing for all non-API routes
  if (isIntlRoute(req)) {
    return intlMiddleware(req)
  }
})

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next (Next.js internals)
  // - Static files (images, etc)
  matcher: [
    '/((?!api|_next|.*\\..*).*)',
    '/(api|trpc)(.*)',
  ],
}
