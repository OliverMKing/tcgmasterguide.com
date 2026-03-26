import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, SUBSCRIPTION_PRICES } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@/lib/user-roles'
import Stripe from 'stripe'

type SubscriptionLocale = 'en' | 'es'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const subscriptionLocale = (session.metadata?.subscriptionLocale || 'en') as SubscriptionLocale
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!userId) {
    console.error('No userId in checkout session metadata')
    return
  }

  // Update user with Stripe customer and subscription IDs based on locale
  const updateData: Record<string, unknown> = {
    stripeCustomerId: customerId,
    role: UserRole.SUBSCRIBER,
  }

  if (subscriptionLocale === 'es') {
    updateData.stripeSubscriptionIdEs = subscriptionId
    updateData.stripeSubscriptionStatusEs = 'active'
  } else {
    updateData.stripeSubscriptionId = subscriptionId
    updateData.stripeSubscriptionStatus = 'active'
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  })

  console.log(`User ${userId} subscribed successfully to ${subscriptionLocale} content`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const subscriptionId = subscription.id

  // Find user by customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    console.error(`No user found for customer ${customerId}`)
    return
  }

  // Determine which locale this subscription belongs to
  const isSpanishSubscription = user.stripeSubscriptionIdEs === subscriptionId
  const isEnglishSubscription = user.stripeSubscriptionId === subscriptionId

  // If subscription ID doesn't match either, check by price ID
  let locale: SubscriptionLocale = 'en'
  if (isSpanishSubscription) {
    locale = 'es'
  } else if (!isEnglishSubscription) {
    // Check price ID for new subscriptions
    const priceId = subscription.items?.data[0]?.price?.id
    if (priceId === SUBSCRIPTION_PRICES.es) {
      locale = 'es'
    }
  }

  const status = subscription.status
  const isActive = status === 'active'
  const currentPeriodEnd = subscription.items?.data[0]?.current_period_end
    ? new Date(subscription.items.data[0].current_period_end * 1000)
    : null

  // Update the appropriate locale fields
  const updateData: Record<string, unknown> = {}

  if (locale === 'es') {
    updateData.stripeSubscriptionIdEs = subscriptionId
    updateData.stripeSubscriptionStatusEs = status
    updateData.subscriptionEndsAtEs = currentPeriodEnd
  } else {
    updateData.stripeSubscriptionId = subscriptionId
    updateData.stripeSubscriptionStatus = status
    updateData.subscriptionEndsAt = currentPeriodEnd
  }

  // Check if user should keep SUBSCRIBER role (has any active subscription)
  const hasEnglishActive = locale === 'en'
    ? isActive
    : user.stripeSubscriptionStatus === 'active'
  const hasSpanishActive = locale === 'es'
    ? isActive
    : user.stripeSubscriptionStatusEs === 'active'

  updateData.role = (hasEnglishActive || hasSpanishActive)
    ? UserRole.SUBSCRIBER
    : UserRole.USER

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  })

  console.log(`Subscription updated for user ${user.id} (${locale}): ${status}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const subscriptionId = subscription.id

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    console.error(`No user found for customer ${customerId}`)
    return
  }

  // Determine which locale this subscription belongs to
  const isSpanishSubscription = user.stripeSubscriptionIdEs === subscriptionId
  const locale: SubscriptionLocale = isSpanishSubscription ? 'es' : 'en'

  // Update the appropriate locale fields
  const updateData: Record<string, unknown> = {}

  if (locale === 'es') {
    updateData.stripeSubscriptionStatusEs = 'canceled'
  } else {
    updateData.stripeSubscriptionStatus = 'canceled'
  }

  // Check if user should keep SUBSCRIBER role (has any active subscription)
  const hasEnglishActive = locale === 'en'
    ? false  // This one is being canceled
    : user.stripeSubscriptionStatus === 'active'
  const hasSpanishActive = locale === 'es'
    ? false  // This one is being canceled
    : user.stripeSubscriptionStatusEs === 'active'

  updateData.role = (hasEnglishActive || hasSpanishActive)
    ? UserRole.SUBSCRIBER
    : UserRole.USER

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  })

  console.log(`Subscription canceled for user ${user.id} (${locale})`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  // Get subscription ID from parent details
  const subscriptionDetails = invoice.parent?.subscription_details
  let subscriptionId: string | undefined
  if (subscriptionDetails?.subscription) {
    subscriptionId = typeof subscriptionDetails.subscription === 'string'
      ? subscriptionDetails.subscription
      : subscriptionDetails.subscription.id
  }

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    console.error(`No user found for customer ${customerId}`)
    return
  }

  // Determine which locale this subscription belongs to
  const isSpanishSubscription = user.stripeSubscriptionIdEs === subscriptionId
  const locale: SubscriptionLocale = isSpanishSubscription ? 'es' : 'en'

  // Update the appropriate locale fields
  const updateData: Record<string, unknown> = {}

  if (locale === 'es') {
    updateData.stripeSubscriptionStatusEs = 'past_due'
  } else {
    updateData.stripeSubscriptionStatus = 'past_due'
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  })

  console.log(`Payment failed for user ${user.id} (${locale})`)
}
