'use client'

import { useCallback, useRef } from 'react'

/**
 * Drives the .holo foil effect. Sets --px/--py (pointer position, 0–100)
 * and --rx/--ry (tilt in degrees) on the element while the pointer is over it.
 * Does nothing for people who ask for reduced motion.
 */
export function useHolo<T extends HTMLElement>(maxTilt = 10) {
  const ref = useRef<T>(null)
  const frame = useRef<number | null>(null)

  const onPointerMove = useCallback(
    (e: React.PointerEvent<T>) => {
      const el = ref.current
      if (!el || e.pointerType === 'touch') return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      if (frame.current) cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        el.style.setProperty('--px', String(Math.round(x * 100)))
        el.style.setProperty('--py', String(Math.round(y * 100)))
        el.style.setProperty('--rx', `${((0.5 - y) * maxTilt).toFixed(2)}deg`)
        el.style.setProperty('--ry', `${((x - 0.5) * maxTilt).toFixed(2)}deg`)
        el.classList.add('is-active')
      })
    },
    [maxTilt]
  )

  const onPointerLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    if (frame.current) cancelAnimationFrame(frame.current)
    el.style.setProperty('--px', '50')
    el.style.setProperty('--py', '50')
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.classList.remove('is-active')
  }, [])

  return { ref, onPointerMove, onPointerLeave }
}
