import { useCallback, useEffect, useState } from 'react'
import type { SpeechEngine, SpeechError } from '../engines/speech/SpeechEngine'

export type SpeechStatus =
  | 'idle'
  | 'preparing'
  | 'listening'
  | 'stopped'
  | 'speech-error'
  | 'permission-denied'

type BeforeStart = () => void | Promise<void>

export function useSpeechRecognition(engine: SpeechEngine) {
  const [status, setStatus] = useState<SpeechStatus>('idle')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')

  const handleError = useCallback((error: SpeechError) => {
    setStatus(error === 'not-allowed' ? 'permission-denied' : 'speech-error')
  }, [])

  const start = useCallback(async (beforeStart?: BeforeStart) => {
    setStatus('preparing')
    setFinalTranscript('')
    setInterimTranscript('')

    if (!engine.isSupported()) {
      setStatus('speech-error')
      return
    }

    await beforeStart?.()

    engine.start({
      onUpdate: ({ finalText, interimText }) => {
        setFinalTranscript(finalText)
        setInterimTranscript(interimText)
      },
      onError: handleError,
    })
    setStatus('listening')
  }, [engine, handleError])

  const stop = useCallback(() => {
    engine.stop()
    setStatus('stopped')
  }, [engine])

  useEffect(() => () => engine.stop(), [engine])

  return {
    status,
    finalTranscript,
    interimTranscript,
    transcript: [finalTranscript, interimTranscript].filter(Boolean).join(' '),
    start,
    stop,
  }
}
