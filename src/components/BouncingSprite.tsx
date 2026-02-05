'use client'

import Image from 'next/image'
import { useState, useCallback } from 'react'

interface BouncingSpriteProps {
  src: string
  size?: number
  className?: string
}

export function BouncingSprite({ src, size = 40, className = '' }: BouncingSpriteProps) {
  const [isBouncing, setIsBouncing] = useState(false)

  const handleMouseEnter = useCallback(() => {
    setIsBouncing(true)
  }, [])

  const handleAnimationEnd = useCallback(() => {
    setIsBouncing(false)
  }, [])

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
