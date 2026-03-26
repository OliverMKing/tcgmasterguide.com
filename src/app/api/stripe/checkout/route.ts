import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe, getSubscriptionPriceId, type SubscriptionLocale } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { trackException } from '@/lib/appinsights'

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get locale from request body, default to 'en'
  let locale: SubscriptionLocale = 'en'
  try {
    const body = await request.json()
    if (body.locale === 'es') {
      locale = 'es'
    }
  } catch {
    // No body or invalid JSON, use default locale
  }

  // Get the price ID for this locale
  const priceId = getSubscriptionPriceId(locale)
  if (!priceId) {
    return NextResponse.json({ error: `No price configured for locale: ${locale}` }, { status: 400 })
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { authId: userId },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Check if user already has an active subscription for this locale
  const hasActiveSubscription = locale === 'es'
    ? user.stripeSubscriptionStatusEs === 'active'
    : user.stripeSubscriptionStatus === 'active'

  if (hasActiveSubscription) {
    return NextResponse.json({ error: `Already subscribed to ${locale === 'es' ? 'Spanish' : 'English'} content` }, { status: 400 })
  }

  try {
    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
          authId: user.authId,
        },
      })
      customerId = customer.id

      // Save customer ID to database
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      locale: locale === 'es' ? 'es' : 'en',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/subscribe`,
      metadata: {
        userId: user.id,
        subscriptionLocale: locale,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    trackException(error, {
      route: '/api/stripe/checkout',
      userId: user.id,
      stripeCustomerId: user.stripeCustomerId || 'none',
    })
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
