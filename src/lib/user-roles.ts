// User role constants for type safety
// Must match the values in prisma/schema.prisma

export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUBSCRIBER: 'SUBSCRIBER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

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
