// User role constants for type safety
// Must match the values in prisma/schema.prisma

export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUBSCRIBER: 'SUBSCRIBER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// Locale types for subscriptions
export type SubscriptionLocale = 'en' | 'es';

// User data shape for subscription checks
export interface UserSubscriptionData {
  role?: string | null;
  stripeSubscriptionStatus?: string | null;     // English subscription status
  stripeSubscriptionStatusEs?: string | null;   // Spanish subscription status
}

// Helper functions
export function isAdmin(role: string | null | undefined): boolean {
  return role === UserRole.ADMIN;
}

export function isSubscriber(role: string | null | undefined): boolean {
  return role === UserRole.SUBSCRIBER;
}

export function hasSubscriberAccess(role: string | null | undefined): boolean {
  // If NEXT_PUBLIC_REQUIRE_SUBSCRIPTION is not 'true', grant access to everyone
  if (process.env.NEXT_PUBLIC_REQUIRE_SUBSCRIPTION !== 'true') {
    return true;
  }
  return role === UserRole.ADMIN || role === UserRole.SUBSCRIBER;
}

/**
 * Check if user has subscriber access for a specific locale.
 * Admins have access to all locales.
 * Subscribers must have an active subscription for the specific locale.
 */
export function hasSubscriberAccessForLocale(
  user: UserSubscriptionData | null | undefined,
  locale: SubscriptionLocale
): boolean {
  // If NEXT_PUBLIC_REQUIRE_SUBSCRIPTION is not 'true', grant access to everyone
  if (process.env.NEXT_PUBLIC_REQUIRE_SUBSCRIPTION !== 'true') {
    return true;
  }

  if (!user) return false;

  // Admins have access to all locales
  if (user.role === UserRole.ADMIN) return true;

  // Check locale-specific subscription status
  const status = locale === 'es'
    ? user.stripeSubscriptionStatusEs
    : user.stripeSubscriptionStatus;

  return status === 'active' || status === 'trialing';
}
