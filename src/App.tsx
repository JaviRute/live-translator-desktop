import { useCallback, useState } from 'react'
import { SettingsPanel } from './components/Settings/SettingsPanel'
import { speechEngine, translationEngine } from './engines/browserEngines'
import { useClearTextTimer } from './hooks/useClearTextTimer'
import { useSpeechRecognition, type SpeechStatus } from './hooks/useSpeechRecognition'
import { useTranslation } from './hooks/useTranslation'
import {
  getAlternativeTarget,
  getLanguage,
  type ClearAfterMs,
  type DisplayMode,
  type LanguageId,
} from './types/settings'

const statusMessages: Record<SpeechStatus, string> = {
  idle: 'Ready for live transcription',
  preparing: 'Preparing microphone...',
  listening: 'Listening...',
  stopped: 'Stopped',
  'speech-error': 'Speech recognition is unavailable or encountered an error.',
  'permission-denied': 'Microphone permission was denied. Allow it in Chrome and try again.',
}

export default function App() {
  const [inputLanguage, setInputLanguage] = useState<LanguageId>('es')
  const [targetLanguage, setTargetLanguage] = useState<LanguageId>('en')
  const [displayMode, setDisplayMode] = useState<DisplayMode>('transcription-and-translation')
  const [clearAfterMs, setClearAfterMs] = useState<ClearAfterMs>(5_000)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const {
    status,
    transcript,
    activityId,
    start: startSpeech,
    stop: stopSpeech,
    clearTranscript,
  } = useSpeechRecognition(speechEngine)

  const translationNeeded = displayMode !== 'transcription-only'

  const {
    translation,
    notice: translationNotice,
    clearTranslation,
    cancelPending: cancelPendingTranslation,
  } = useTranslation(translationEngine, {
    sourceText: transcript,
    sourceLanguage: inputLanguage,
    targetLanguage,
    enabled: translationNeeded,
    active: status === 'listening',
  })

  const clearText = useCallback(() => {
    clearTranscript()
    clearTranslation()
  }, [clearTranscript, clearTranslation])

  useClearTextTimer(activityId, clearAfterMs, clearText)

  const start = () => {
    clearText()
    startSpeech(getLanguage(inputLanguage).speechCode)
  }

  const stop = () => {
    cancelPendingTranslation()
    stopSpeech()
  }

  const handleInputLanguageChange = (language: LanguageId) => {
    const nextTarget =
      language === targetLanguage ? getAlternativeTarget(language) : targetLanguage

    setInputLanguage(language)
    setTargetLanguage(nextTarget)
    clearText()

    if (status === 'listening') {
      startSpeech(getLanguage(language).speechCode)
    }
  }

  const handleDisplayModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode)
    if (mode === 'transcription-only') {
      clearTranslation()
    }
  }

  const showTranscription = displayMode !== 'translation-only'
  const showTranslation = displayMode !== 'transcription-only'
  const inputLabel = getLanguage(inputLanguage).label
  const targetLabel = getLanguage(targetLanguage).label

  return (
    <main className="app-shell">
      <section className="subtitles" aria-live="polite" aria-atomic="true">
        {showTranscription && (
          <p className={`transcript ${transcript ? '' : 'placeholder'}`}>
            {transcript || `Your ${inputLabel} transcription will appear here`}
          </p>
        )}
        {showTranslation && (
          <p className={`translation ${translation ? '' : 'placeholder'}`}>
            {translation || `${targetLabel} translation will appear here`}
          </p>
        )}
      </section>

      {settingsOpen && (
        <div
          className="settings-backdrop"
          onMouseDown={() => setSettingsOpen(false)}
        >
          <SettingsPanel
            inputLanguage={inputLanguage}
            targetLanguage={targetLanguage}
            displayMode={displayMode}
            clearAfterMs={clearAfterMs}
            onInputLanguageChange={handleInputLanguageChange}
            onTargetLanguageChange={(language) => {
              setTargetLanguage(language)
              clearTranslation()
            }}
            onDisplayModeChange={handleDisplayModeChange}
            onClearAfterChange={setClearAfterMs}
            onClose={() => setSettingsOpen(false)}
          />
        </div>
      )}

      <footer className="controls">
        <div className="control-cluster">
          <button
            className="icon-button settings-button"
            type="button"
            onClick={() => setSettingsOpen((open) => !open)}
            aria-label={settingsOpen ? 'Close settings' : 'Open settings'}
            aria-expanded={settingsOpen}
          >
            &#9881;
          </button>
          <div>
            <span className={`status-dot ${status}`} aria-hidden="true" />
            <span>{statusMessages[status]}</span>
            {translationNotice && <span className="notice"> {translationNotice}</span>}
          </div>
        </div>

        {status === 'listening' ? (
          <button className="listen-button" type="button" onClick={stop}>Stop listening</button>
        ) : (
          <button className="listen-button" type="button" onClick={start}>Start listening</button>
        )}
      </footer>
    </main>
  )
}
