import { useCallback, useEffect, useRef, useState } from 'react'
import type { TranslationEngine } from '../engines/translation/TranslationEngine'

const DEFAULT_DEBOUNCE_MS = 160

export function useTranslation(
  engine: TranslationEngine,
  sourceText: string,
  debounceMs = DEFAULT_DEBOUNCE_MS,
) {
  const [translation, setTranslation] = useState('')
  const [notice, setNotice] = useState('')
  const [isReady, setIsReady] = useState(false)
  const requestVersion = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  const lastRequestedText = useRef('')

  const cancelPending = useCallback(() => {
    window.clearTimeout(timer.current)
    requestVersion.current += 1
  }, [])

  const reset = useCallback(() => {
    cancelPending()
    lastRequestedText.current = ''
    setTranslation('')
    setNotice('')
  }, [cancelPending])

  const initialize = useCallback(async () => {
    try {
      const ready = await engine.initialize()
      setIsReady(ready)
      if (!ready) {
        setNotice('Chrome Translator API is unavailable; transcription will still work.')
      }
      return ready
    } catch {
      setIsReady(false)
      setNotice('Chrome could not prepare its translation model; transcription will still work.')
      return false
    }
  }, [engine])

  useEffect(() => {
    window.clearTimeout(timer.current)

    if (!isReady || !sourceText || sourceText === lastRequestedText.current) return

    const version = ++requestVersion.current
    timer.current = window.setTimeout(async () => {
      lastRequestedText.current = sourceText

      try {
        const result = await engine.translate(sourceText)
        if (version === requestVersion.current) {
          setTranslation(result)
          setNotice('')
        }
      } catch {
        if (version === requestVersion.current) {
          setNotice('Translation failed for this update.')
        }
      }
    }, debounceMs)

    return () => window.clearTimeout(timer.current)
  }, [debounceMs, engine, isReady, sourceText])

  useEffect(() => () => {
    cancelPending()
    engine.dispose()
  }, [cancelPending, engine])

  return {
    translation,
    notice,
    initialize,
    reset,
    cancelPending,
  }
}
