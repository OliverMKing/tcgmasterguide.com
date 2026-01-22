import { createHmac, timingSafeEqual } from 'crypto'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// Verify Svix webhook signature without the svix package
function verifyWebhook(
  secret: string,
  payload: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string
): boolean {
  // Svix secrets are base64 encoded with a "whsec_" prefix
  const secretBytes = Buffer.from(secret.replace('whsec_', ''), 'base64')

  // Check timestamp is within 5 minutes
  const timestamp = parseInt(svixTimestamp, 10)
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - timestamp) > 300) {
    return false
  }

  // Create the signed content
  const signedContent = `${svixId}.${svixTimestamp}.${payload}`

  // Compute expected signature
  const expectedSignature = createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64')

  // Svix signature header contains multiple signatures like "v1,signature1 v1,signature2"
  const signatures = svixSignature.split(' ')
  for (const sig of signatures) {
    const [version, signature] = sig.split(',')
    if (version === 'v1') {
      try {
        const sigBuffer = Buffer.from(signature, 'base64')
        const expectedBuffer = Buffer.from(expectedSignature, 'base64')
        if (sigBuffer.length === expectedBuffer.length && timingSafeEqual(sigBuffer, expectedBuffer)) {
          return true
        }
      } catch {
        continue
      }
    }
  }
  return false
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Verify the webhook signature
  if (!verifyWebhook(WEBHOOK_SECRET, body, svix_id, svix_timestamp, svix_signature)) {
    console.error('Error verifying webhook signature')
    return new Response('Error occurred', {
      status: 400,
    })
  }

  const evt = payload as WebhookEvent

  const eventType = evt.type

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, username } = evt.data

    const email = email_addresses?.[0]?.email_address
    const name =
      first_name && last_name
        ? `${first_name} ${last_name}`
        : username || null

    await prisma.user.upsert({
      where: { authId: id },
      update: {
        email,
        name,
      },
      create: {
        authId: id,
        email,
        name,
        role: 'USER',
      },
    })
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    if (id) {
      await prisma.user.delete({
        where: { authId: id },
      }).catch(() => {
        // User might not exist in our DB
      })
    }
  }

  console.log(`Processed Clerk webhook event: ${eventType}`)

  return new Response('', { status: 200 })
}
