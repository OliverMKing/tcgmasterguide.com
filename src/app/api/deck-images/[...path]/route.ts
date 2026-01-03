import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params
  const imagePath = pathSegments.join('/')
  const fullPath = path.join(process.cwd(), 'content', 'decks', 'images', imagePath)

  try {
    if (!fs.existsSync(fullPath)) {
      return new NextResponse('Not found', { status: 404 })
    }

    const imageBuffer = fs.readFileSync(fullPath)
    const ext = path.extname(fullPath).toLowerCase()

    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    }

    const contentType = mimeTypes[ext] || 'application/octet-stream'

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Error reading image', { status: 500 })
  }
}
