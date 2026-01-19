'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import TwitchEmbed, { type StreamStatus } from '@/components/TwitchEmbed'

interface LivePageContentProps {
  channel: string
}

export default function LivePageContent({ channel }: LivePageContentProps) {
  const [streamStatus, setStreamStatus] = useState<StreamStatus>('loading')

  const handleStatusChange = useCallback((status: StreamStatus) => {
    setStreamStatus(status)
  }, [])

  const isLive = streamStatus === 'live' || streamStatus === 'unknown'

  return (
    <>
      {/* Stream Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <TwitchEmbed channel={channel} onStatusChange={handleStatusChange} />
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 p-6 md:p-8">
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                {isLive
                  ? 'Want to learn these strategies?'
                  : 'In the meantime, learn his winning strategies'}
              </h2>
              <p className="text-purple-100">
                {isLive
                  ? 'Check out our in-depth deck guides'
                  : 'Everything you need to know to win at every level of competitive play'}
              </p>
            </div>
            <Link
              href="/#decks"
              className="shrink-0 px-6 py-2.5 bg-white text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition-colors shadow-lg shadow-purple-900/20"
            >
              View Deck Guides
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
