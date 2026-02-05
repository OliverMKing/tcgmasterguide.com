'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface VideoEmbedContextType {
  activeVideoId: string | null
  setActiveVideoId: (id: string | null) => void
  expandedVideoId: string | null
  setExpandedVideoId: (id: string | null) => void
}

const VideoEmbedContext = createContext<VideoEmbedContextType | undefined>(undefined)

export function VideoEmbedProvider({ children }: { children: ReactNode }) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null)

  return (
    <VideoEmbedContext.Provider value={{ activeVideoId, setActiveVideoId, expandedVideoId, setExpandedVideoId }}>
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
