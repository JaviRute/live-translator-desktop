import { speechEngine, translationEngine } from './engines/browserEngines'
import { useSpeechRecognition, type SpeechStatus } from './hooks/useSpeechRecognition'
import { useTranslation } from './hooks/useTranslation'

const statusMessages: Record<SpeechStatus, string> = {
  idle: 'Ready to test Spanish!’ English',
  preparing: 'Preparing microphone and translation&',
  listening: 'Listening&',
  stopped: 'Stopped',
  'speech-error': 'Speech recognition is unavailable or encountered an error.',
  'permission-denied': 'Microphone permission was denied. Allow it in Chrome and try again.',
}

export default function App() {
  const {
    status,
    transcript,
    start: startSpeech,
    stop: stopSpeech,
  } = useSpeechRecognition(speechEngine)

  const {
    translation,
    notice: translationNotice,
    initialize: initializeTranslation,
    reset: resetTranslation,
    cancelPending: cancelPendingTranslation,
  } = useTranslation(translationEngine, transcript)

  const start = () => startSpeech(async () => {
    resetTranslation()
    await initializeTranslation()
  })

  const stop = () => {
    cancelPendingTranslation()
    stopSpeech()
  }

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
