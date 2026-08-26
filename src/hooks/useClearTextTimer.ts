import { useEffect, useRef } from 'react'
import type { ClearAfterMs } from '../types/settings'

export function useClearTextTimer(
  activityId: number,
  clearAfterMs: ClearAfterMs,
  onClear: () => void,
) {
  const lastActivityAt = useRef<number | null>(null)

  useEffect(() => {
    if (activityId > 0) lastActivityAt.current = Date.now()
  }, [activityId])

  useEffect(() => {
    if (clearAfterMs === null || lastActivityAt.current === null) return

    const elapsed = Date.now() - lastActivityAt.current
    const remaining = clearAfterMs - elapsed

    if (remaining <= 0) {
      lastActivityAt.current = null
      onClear()
      return
    }

    const timer = window.setTimeout(() => {
      lastActivityAt.current = null
      onClear()
    }, remaining)

    return () => window.clearTimeout(timer)
  }, [activityId, clearAfterMs, onClear])
}
