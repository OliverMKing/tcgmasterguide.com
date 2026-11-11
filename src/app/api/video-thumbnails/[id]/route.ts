import { NextResponse } from 'next/server'

// Serves YouTube video thumbnails from our own domain, so a visitor's browser does
// not contact YouTube until they choose to play a video.
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/

// ?size=large asks for the 1280px thumbnail. Not every video has one, so fall back.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!VIDEO_ID.test(id)) {
    return NextResponse.json({ error: 'Invalid video ID' }, { status: 400 })
  }

  const large = new URL(request.url).searchParams.get('size') === 'large'
  const candidates = large ? ['maxresdefault.jpg', 'hqdefault.jpg'] : ['hqdefault.jpg']

  try {
    let res: Response | null = null
    for (const file of candidates) {
      res = await fetch(`https://i.ytimg.com/vi/${id}/${file}`, {
        next: { revalidate: 60 * 60 * 24 * 7 },
      })
      if (res.ok) break
    }
    if (!res || !res.ok) {
      return NextResponse.json({ error: 'Thumbnail not found' }, { status: 404 })
    }
    const body = await res.arrayBuffer()
    return new NextResponse(body, {
      headers: {
        'Content-Type': res.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Thumbnail unavailable' }, { status: 502 })
  }
}
