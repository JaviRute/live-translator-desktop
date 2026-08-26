import { useCallback, useEffect, useState } from 'react'
import type { SpeechEngine, SpeechError } from '../engines/speech/SpeechEngine'

export type SpeechStatus =
  | 'idle'
  | 'preparing'
  | 'listening'
  | 'stopped'
  | 'speech-error'
  | 'permission-denied'

export function useSpeechRecognition(engine: SpeechEngine) {
  const [status, setStatus] = useState<SpeechStatus>('idle')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [activityId, setActivityId] = useState(0)

  const handleError = useCallback((error: SpeechError) => {
    setStatus(error === 'not-allowed' ? 'permission-denied' : 'speech-error')
  }, [])

  const start = useCallback((language: string) => {
    setStatus('preparing')
    setFinalTranscript('')
    setInterimTranscript('')
    setActivityId(0)

    if (!engine.isSupported()) {
      setStatus('speech-error')
      return
    }

    engine.start({ language }, {
      onUpdate: ({ finalText, interimText, hasSpeechActivity }) => {
        setFinalTranscript(finalText)
        setInterimTranscript(interimText)
        if (hasSpeechActivity) setActivityId((current) => current + 1)
      },
      onError: handleError,
    })
    setStatus('listening')
  }, [engine, handleError])

  const stop = useCallback(() => {
    engine.stop()
    setStatus('stopped')
  }, [engine])

  const clearTranscript = useCallback(() => {
    engine.clearTranscript()
    setFinalTranscript('')
    setInterimTranscript('')
  }, [engine])

  useEffect(() => () => engine.stop(), [engine])

  return {
    status,
    finalTranscript,
    interimTranscript,
    transcript: [finalTranscript, interimTranscript].filter(Boolean).join(' '),
    activityId,
    start,
    stop,
    clearTranscript,
  }
}
