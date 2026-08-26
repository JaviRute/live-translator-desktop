import { useCallback, useEffect, useRef, useState } from 'react'
import type { TranslationEngine } from '../engines/translation/TranslationEngine'

const DEFAULT_DEBOUNCE_MS = 160

type UseTranslationOptions = {
  sourceText: string
  sourceLanguage: string
  targetLanguage: string
  enabled: boolean
  active: boolean
  debounceMs?: number
}

export function useTranslation(
  engine: TranslationEngine,
  {
    sourceText,
    sourceLanguage,
    targetLanguage,
    enabled,
    active,
    debounceMs = DEFAULT_DEBOUNCE_MS,
  }: UseTranslationOptions,
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

  const clearTranslation = useCallback(() => {
    cancelPending()
    lastRequestedText.current = ''
    setTranslation('')
  }, [cancelPending])

  useEffect(() => {
    cancelPending()

    if (!enabled) {
      lastRequestedText.current = ''
      setTranslation('')
      setNotice('')
      setIsReady(false)
      engine.dispose()
      return
    }

    if (!active) return

    lastRequestedText.current = ''
    setNotice('')
    setIsReady(false)

    let isCurrent = true
    engine.initialize({ sourceLanguage, targetLanguage })
      .then((ready) => {
        if (!isCurrent) return
        setIsReady(ready)
        if (!ready) {
          setNotice('Chrome Translator API is unavailable; transcription will still work.')
        }
      })
      .catch(() => {
        if (!isCurrent) return
        setIsReady(false)
        setNotice('Chrome could not prepare its translation model; transcription will still work.')
      })

    return () => {
      isCurrent = false
      cancelPending()
    }
  }, [active, cancelPending, enabled, engine, sourceLanguage, targetLanguage])

  useEffect(() => {
    window.clearTimeout(timer.current)

    if (!active || !enabled || !isReady || !sourceText || sourceText === lastRequestedText.current) {
      return
    }

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
  }, [active, debounceMs, enabled, engine, isReady, sourceText])

  useEffect(() => () => {
    cancelPending()
    engine.dispose()
  }, [cancelPending, engine])

  return {
    translation,
    notice,
    clearTranslation,
    cancelPending,
  }
}
