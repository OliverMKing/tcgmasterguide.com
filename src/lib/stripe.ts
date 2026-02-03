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
export const SUBSCRIPTION_PRICE_ID = process.env.STRIPE_PRICE_ID || ''
