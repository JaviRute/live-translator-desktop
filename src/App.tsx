import { useEffect, useMemo, useRef, useState } from 'react'
import { WebSpeechEngine } from './engines/speech/WebSpeechEngine'
import { ChromeTranslatorEngine } from './engines/translation/ChromeTranslatorEngine'
import type { SpeechError } from './engines/speech/SpeechEngine'

type Status = 'idle' | 'preparing' | 'listening' | 'stopped' | 'speech-error' | 'permission-denied'

const statusMessages: Record<Status, string> = {
  idle: 'Ready to test Spanish → English',
  preparing: 'Preparing microphone and translation…',
  listening: 'Listening…',
  stopped: 'Stopped',
  'speech-error': 'Speech recognition is unavailable or encountered an error.',
  'permission-denied': 'Microphone permission was denied. Allow it in Chrome and try again.',
}

export default function App() {
  const speechEngine = useMemo(() => new WebSpeechEngine(), [])
  const translationEngine = useMemo(() => new ChromeTranslatorEngine(), [])
  const [status, setStatus] = useState<Status>('idle')
  const [transcript, setTranscript] = useState('')
  const [translation, setTranslation] = useState('')
  const [translationNotice, setTranslationNotice] = useState('')
  const translationVersion = useRef(0)
  const translationTimer = useRef<number | undefined>(undefined)
  const translationReady = useRef(false)

  const requestTranslation = (text: string) => {
    window.clearTimeout(translationTimer.current)
    if (!text) return setTranslation('')
    const version = ++translationVersion.current
    translationTimer.current = window.setTimeout(async () => {
      try {
        const translated = await translationEngine.translate(text)
        if (version === translationVersion.current) setTranslation(translated)
      } catch {
        if (version === translationVersion.current) setTranslationNotice('Translation failed for this update.')
      }
    }, 160)
  }

  const handleSpeechError = (error: SpeechError) => {
    setStatus(error === 'not-allowed' ? 'permission-denied' : 'speech-error')
  }

  const start = async () => {
    setStatus('preparing')
    setTranscript('')
    setTranslation('')
    setTranslationNotice('')

    if (!speechEngine.isSupported()) {
      setStatus('speech-error')
      return
    }

    try {
      translationReady.current = await translationEngine.initialize()
      if (!translationReady.current) setTranslationNotice('Chrome Translator API is unavailable; transcription will still work.')
    } catch {
      translationReady.current = false
      setTranslationNotice('Chrome could not prepare its translation model; transcription will still work.')
    }

    speechEngine.start(({ finalText, interimText }) => {
      const current = [finalText, interimText].filter(Boolean).join(' ')
      setTranscript(current)
      if (translationReady.current) requestTranslation(current)
    }, handleSpeechError)
    setStatus('listening')
  }

  const stop = () => {
    speechEngine.stop()
    window.clearTimeout(translationTimer.current)
    setStatus('stopped')
  }

  useEffect(() => () => {
    speechEngine.stop()
    translationEngine.dispose()
    window.clearTimeout(translationTimer.current)
  }, [speechEngine, translationEngine])

  return (
    <main className="app-shell">
      <section className="subtitles" aria-live="polite" aria-atomic="true">
        <p className={`transcript ${transcript ? '' : 'placeholder'}`}>
          {transcript || 'Your Spanish transcription will appear here'}
        </p>
        <p className={`translation ${translation ? '' : 'placeholder'}`}>
          {translation || 'English translation will appear here'}
        </p>
      </section>

      <footer className="controls">
        <div>
          <span className={`status-dot ${status}`} aria-hidden="true" />
          <span>{statusMessages[status]}</span>
          {translationNotice && <span className="notice"> {translationNotice}</span>}
        </div>
        {status === 'listening' ? (
          <button type="button" onClick={stop}>Stop listening</button>
        ) : (
          <button type="button" onClick={start}>Start listening</button>
        )}
      </footer>
    </main>
  )
}
