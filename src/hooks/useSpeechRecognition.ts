import { useCallback, useEffect, useState } from 'react'
import type { SpeechEngine, SpeechError } from '../engines/speech/SpeechEngine'

export type SpeechStatus =
  | 'idle'
  | 'preparing'
  | 'listening'
  | 'stopped'
  | 'speech-error'
  | 'unsupported'
  | 'permission-denied'
  | 'microphone-unavailable'

export function useSpeechRecognition(engine: SpeechEngine) {
  const [status, setStatus] = useState<SpeechStatus>('idle')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [activityId, setActivityId] = useState(0)

  const handleError = useCallback((error: SpeechError) => {
    if (error === 'not-allowed') {
      setStatus('permission-denied')
    } else if (error === 'microphone-unavailable') {
      setStatus('microphone-unavailable')
    } else if (error === 'unavailable') {
      setStatus('unsupported')
    } else {
      setStatus('speech-error')
    }
  }, [])

  const start = useCallback((language: string) => {
    setStatus('preparing')
    setFinalTranscript('')
    setInterimTranscript('')
    setActivityId(0)

    if (!engine.isSupported()) {
      setStatus('unsupported')
      return
    }

    engine.start({ language }, {
      onStart: () => setStatus('listening'),
      onUpdate: ({ finalText, interimText, hasSpeechActivity }) => {
        setFinalTranscript(finalText)
        setInterimTranscript(interimText)
        if (hasSpeechActivity) setActivityId((current) => current + 1)
      },
      onError: handleError,
    })
  }, [engine, handleError])

  const stop = useCallback(() => {
    engine.stop()
    setStatus('stopped')
  }, [engine])

  const clearTranscript = useCallback(() => {
    engine.clearTranscript()
    setFinalTranscript('')
    setInterimTranscript('')
    setActivityId(0)
  }, [engine])

  useEffect(() => () => engine.stop(), [engine])

  const isActive = status === 'preparing' || status === 'listening'

  return {
    status,
    isActive,
    finalTranscript,
    interimTranscript,
    transcript: [finalTranscript, interimTranscript].filter(Boolean).join(' '),
    activityId,
    start,
    stop,
    clearTranscript,
  }
}
