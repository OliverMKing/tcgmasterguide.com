'use client'

import Image from 'next/image'
import { useState, useCallback, useEffect } from 'react'

interface BouncingSpriteProps {
  src: string
  size?: number
  className?: string
  /** When this number changes to a non-zero value, the sprite plays a full bounce. */
  bounceKey?: number
}

export function BouncingSprite({ src, size = 40, className = '', bounceKey }: BouncingSpriteProps) {
  const [isBouncing, setIsBouncing] = useState(false)

  const handleMouseEnter = useCallback(() => {
    setIsBouncing((prev) => prev || true)
  }, [])

  const handleAnimationEnd = useCallback(() => {
    setIsBouncing(false)
  }, [])

  // Parent-driven bounce: start the animation when bounceKey changes,
  // but only if we're not already in the middle of one. This prevents
  // a visible "reset flash" when the user rapidly re-hovers a card.
  useEffect(() => {
    if (!bounceKey) return
    setIsBouncing((prev) => (prev ? prev : true))
  }, [bounceKey])

  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className={`object-contain ${className} ${isBouncing ? 'sprite-bouncing' : ''}`}
      unoptimized
      onMouseEnter={handleMouseEnter}
      onAnimationEnd={handleAnimationEnd}
    />
  )
}
