'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface VideoEmbedContextType {
  activeVideoId: string | null
  setActiveVideoId: (id: string | null) => void
}

const VideoEmbedContext = createContext<VideoEmbedContextType | undefined>(undefined)

export function VideoEmbedProvider({ children }: { children: ReactNode }) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  return (
    <VideoEmbedContext.Provider value={{ activeVideoId, setActiveVideoId }}>
      {children}
    </VideoEmbedContext.Provider>
  )
}

export function useVideoEmbed() {
  const context = useContext(VideoEmbedContext)
  if (context === undefined) {
    throw new Error('useVideoEmbed must be used within a VideoEmbedProvider')
  }
  return context
}
