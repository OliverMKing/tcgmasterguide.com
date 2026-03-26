import Stripe from 'stripe'

// Lazy initialization to avoid build-time errors
// Stripe client is only created when first accessed at runtime
let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    })
  }
  return stripeClient
}

// For backwards compatibility - use getStripe() for new code
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return Reflect.get(getStripe(), prop)
  },
})

// Subscription configuration
// STRIPE_PRICE_ID = English (existing, unchanged)
// STRIPE_PRICE_ID_ES = Spanish (new)
export const SUBSCRIPTION_PRICES = {
  en: process.env.STRIPE_PRICE_ID || '',
  es: process.env.STRIPE_PRICE_ID_ES || '',
} as const

export type SubscriptionLocale = keyof typeof SUBSCRIPTION_PRICES

export function getSubscriptionPriceId(locale: SubscriptionLocale): string {
  return SUBSCRIPTION_PRICES[locale]
}

// Backwards compatibility
export const SUBSCRIPTION_PRICE_ID = process.env.STRIPE_PRICE_ID || ''
