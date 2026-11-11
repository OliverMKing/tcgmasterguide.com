// Shown while a route loads. One card outline pulses gently.
// Global CSS stops the pulse for people who ask for reduced motion.
export default function Loading() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4" role="status" aria-live="polite">
      <div aria-hidden="true" className="w-[88px] aspect-[63/88] rounded-[12px] border-2 border-line-strong animate-pulse" />
      <span className="sr-only">Loading</span>
    </main>
  )
}
