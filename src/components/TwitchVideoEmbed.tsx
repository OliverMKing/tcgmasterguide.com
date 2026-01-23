'use client'

import { useEffect, useState } from 'react'

interface TwitchVideoEmbedProps {
  videoId: string
  title?: string
}

export function TwitchVideoEmbed({ videoId, title = 'Twitch video' }: TwitchVideoEmbedProps) {
  const [parent, setParent] = useState('localhost')

  useEffect(() => {
    setParent(window.location.hostname)
  }, [])

  return (
    <div className="my-6 aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
      <iframe
        src={`https://player.twitch.tv/?video=${videoId}&parent=${parent}&autoplay=false`}
        title={title}
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  )
}
