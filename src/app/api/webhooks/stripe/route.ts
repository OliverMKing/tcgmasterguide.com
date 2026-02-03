import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@/lib/user-roles'
import Stripe from 'stripe'

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
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!userId) {
    console.error('No userId in checkout session metadata')
    return
  }

  // Update user with Stripe customer and subscription IDs
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      role: UserRole.SUBSCRIBER,
    },
  })

  console.log(`User ${userId} subscribed successfully`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    console.error(`No user found for customer ${customerId}`)
    return
  }

  const status = subscription.status
  const isActive = status === 'active' || status === 'trialing'
  // Get current period end from subscription items or use a default
  const currentPeriodEnd = subscription.items?.data[0]?.current_period_end
    ? new Date(subscription.items.data[0].current_period_end * 1000)
    : null

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: status,
      subscriptionEndsAt: currentPeriodEnd,
      role: isActive ? UserRole.SUBSCRIBER : UserRole.USER,
    },
  })

  console.log(`Subscription updated for user ${user.id}: ${status}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    console.error(`No user found for customer ${customerId}`)
    return
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionStatus: 'canceled',
      role: UserRole.USER,
    },
  })

  console.log(`Subscription canceled for user ${user.id}`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    console.error(`No user found for customer ${customerId}`)
    return
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionStatus: 'past_due',
    },
  })

  console.log(`Payment failed for user ${user.id}`)
}
