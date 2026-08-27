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
  const lastTranslatedText = useRef('')

  const cancelPending = useCallback(() => {
    window.clearTimeout(timer.current)
    timer.current = undefined
    requestVersion.current += 1
  }, [])

  const clearTranslation = useCallback(() => {
    cancelPending()
    lastTranslatedText.current = ''
    setTranslation('')
  }, [cancelPending])

  useEffect(() => {
    cancelPending()

    if (!enabled) {
      lastTranslatedText.current = ''
      setTranslation('')
      setNotice('')
      setIsReady(false)
      engine.dispose()
      return
    }

    if (!active) {
      setIsReady(false)
      setNotice('')
      return
    }

    lastTranslatedText.current = ''
    setNotice('')
    setIsReady(false)

    if (!engine.isSupported()) {
      setNotice('Chrome Translator API is unavailable; transcription will still work.')
      return
    }

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
    cancelPending()

    if (
      !active ||
      !enabled ||
      !isReady ||
      !sourceText ||
      sourceText === lastTranslatedText.current
    ) {
      return
    }

    const version = requestVersion.current
    timer.current = window.setTimeout(async () => {
      timer.current = undefined

      try {
        const result = await engine.translate(sourceText)
        if (version === requestVersion.current) {
          lastTranslatedText.current = sourceText
          setTranslation(result)
          setNotice('')
        }
      } catch {
        if (version === requestVersion.current) {
          setTranslation('')
          setNotice('Translation failed for this update.')
        }
      }
    }, debounceMs)

    return () => window.clearTimeout(timer.current)
  }, [active, cancelPending, debounceMs, enabled, engine, isReady, sourceText])

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
