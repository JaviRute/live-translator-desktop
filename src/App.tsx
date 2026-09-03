import { useCallback, useState, type CSSProperties } from 'react'
import { SettingsPanel } from './components/Settings/SettingsPanel'
import { getColourTheme, type ColourThemeId } from './data/colourThemes'
import { speechEngine, translationEngine } from './engines/browserEngines'
import { useClearTextTimer } from './hooks/useClearTextTimer'
import { usePersistentSettings } from './hooks/usePersistentSettings'
import { useSpeechRecognition, type SpeechStatus } from './hooks/useSpeechRecognition'
import { useSubtitleLayout } from './hooks/useSubtitleLayout'
import { useTranslation } from './hooks/useTranslation'
import { filterOffensiveLanguage, filterTranslatedOffensiveLanguage } from './utils/filterOffensiveLanguage'
import { getSubtitleLayoutClass } from './utils/subtitleLayout'
import { getAlternativeTarget, getLanguage, type AppSettings, type DisplayMode, type LanguageId, type TextAppearance } from './types/settings'

const statusMessages: Record<SpeechStatus, string> = {
  idle: 'Ready for live transcription',
  preparing: 'Preparing microphone...',
  listening: 'Listening...',
  stopped: 'Stopped',
  'speech-error': 'Speech recognition stopped unexpectedly. Try starting again.',
  unsupported: 'Speech recognition is not available in this browser.',
  'microphone-unavailable': 'No microphone is available. Check the device and try again.',
  'permission-denied': 'Microphone permission was denied. Allow it in Chrome and try again.',
}
const fontStack = (font: string) => `"${font}", "Atkinson Hyperlegible", Arial, Verdana, sans-serif`
const appearanceStyle = (appearance: TextAppearance, color: string): CSSProperties => ({
  color,
  fontFamily: fontStack(appearance.font),
  fontSize: `${appearance.fontSize}px`,
})

export default function App() {
  const [settings, setSettings] = usePersistentSettings()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [previewTheme, setPreviewTheme] = useState<ColourThemeId | null>(null)
  const { inputLanguage, targetLanguage, displayMode, maxSubtitleLines, clearAfterMs, hideOffensiveLanguage, colourTheme,
    transcription: transcriptionAppearance, translation: translationAppearance } = settings
  const activeTheme = getColourTheme(previewTheme ?? colourTheme)
  const { status, isActive, transcript, activityId, start: startSpeech, stop: stopSpeech, clearTranscript } =
    useSpeechRecognition(speechEngine)
  const { translation, notice: translationNotice, clearTranslation, cancelPending: cancelPendingTranslation } =
    useTranslation(translationEngine, {
      sourceText: transcript,
      sourceLanguage: inputLanguage,
      targetLanguage,
      enabled: displayMode !== 'transcription-only',
      active: status === 'listening',
    })
  const clearText = useCallback(() => {
    clearTranscript()
    clearTranslation()
  }, [clearTranscript, clearTranslation])
  useClearTextTimer(activityId, clearAfterMs, clearText)

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setSettings((current) => ({ ...current, [key]: value }))
  const updateAppearance = (kind: 'transcription' | 'translation', change: Partial<TextAppearance>) =>
    setSettings((current) => ({ ...current, [kind]: { ...current[kind], ...change } }))
  const closeSettings = () => {
    setPreviewTheme(null)
    setSettingsOpen(false)
  }
  const start = () => {
    clearText()
    startSpeech(getLanguage(inputLanguage).speechCode)
  }
  const stop = () => {
    cancelPendingTranslation()
    stopSpeech()
  }
  const handleInputLanguageChange = (language: LanguageId) => {
    const nextTarget = language === targetLanguage ? getAlternativeTarget(language) : targetLanguage
    setSettings((current) => ({ ...current, inputLanguage: language, targetLanguage: nextTarget }))
    clearText()
    if (isActive) startSpeech(getLanguage(language).speechCode)
  }
  const handleDisplayModeChange = (mode: DisplayMode) => {
    updateSetting('displayMode', mode)
    if (mode === 'transcription-only') clearTranslation()
  }
  const showTranscription = displayMode !== 'translation-only'
  const showTranslation = displayMode !== 'transcription-only'
  const inputLabel = getLanguage(inputLanguage).label
  const targetLabel = getLanguage(targetLanguage).label
  const displayedTranscript = hideOffensiveLanguage
    ? filterOffensiveLanguage(transcript, inputLanguage)
    : transcript
  const displayedTranslation = hideOffensiveLanguage
    ? filterTranslatedOffensiveLanguage(
      translation,
      targetLanguage,
      transcript,
      inputLanguage,
    )
    : translation
  const transcriptText = displayedTranscript || `Your ${inputLabel} transcription will appear here`
  const translationText = displayedTranslation || `${targetLabel} translation will appear here`
  const transcriptLayout = useSubtitleLayout(
    transcriptText,
    transcriptionAppearance,
    showTranscription,
    transcript ? maxSubtitleLines : null,
  )
  const translationLayout = useSubtitleLayout(
    translationText,
    translationAppearance,
    showTranslation,
    translation ? maxSubtitleLines : null,
  )

  return (
    <main className={`app-shell ${previewTheme ? 'theme-preview' : ''}`} style={{ backgroundColor: activeTheme.background }}>
      <section className={getSubtitleLayoutClass(showTranscription, showTranslation)} aria-live="polite" aria-atomic="true">
        {showTranscription && (
          <div className="live-text-pane" ref={transcriptLayout.paneRef}>
            <p ref={transcriptLayout.textRef} className={`transcript ${transcript ? '' : 'placeholder'}`} style={appearanceStyle(transcriptionAppearance, activeTheme.transcription)}>
              {transcriptLayout.visibleLines.map((line, index) => <span className="subtitle-line" key={`${index}-${line}`}>{line}</span>)}
            </p>
          </div>
        )}
        {showTranslation && (
          <div className="live-text-pane" ref={translationLayout.paneRef}>
            <p ref={translationLayout.textRef} className={`translation ${translation ? '' : 'placeholder'}`} style={appearanceStyle(translationAppearance, activeTheme.translation)}>
              {translationLayout.visibleLines.map((line, index) => <span className="subtitle-line" key={`${index}-${line}`}>{line}</span>)}
            </p>
          </div>
        )}
      </section>
      {settingsOpen && (
        <div className="settings-backdrop" onMouseDown={closeSettings}>
          <SettingsPanel
            settings={settings}
            onInputLanguageChange={handleInputLanguageChange}
            onTargetLanguageChange={(language) => {
              updateSetting('targetLanguage', language)
              clearTranslation()
            }}
            onDisplayModeChange={handleDisplayModeChange}
            onSettingChange={updateSetting}
            onAppearanceChange={updateAppearance}
            onThemePreview={setPreviewTheme}
            onClose={closeSettings}
          />
        </div>
      )}
      <footer className="controls">
        <div className="control-cluster">
          <button className="icon-button settings-button" type="button"
            onClick={() => {
              setPreviewTheme(null)
              setSettingsOpen((open) => !open)
            }}
            aria-label={settingsOpen ? 'Close settings' : 'Open settings'} aria-expanded={settingsOpen}>
            &#9881;
          </button>
          <div>
            <span className={`status-dot ${status}`} aria-hidden="true" />
            <span>{statusMessages[status]}</span>
            {translationNotice && <span className="notice"> {translationNotice}</span>}
          </div>
        </div>
        {isActive
          ? <button className="listen-button" type="button" onClick={stop}>Stop listening</button>
          : <button className="listen-button" type="button" onClick={start}>Start listening</button>}
      </footer>
    </main>
  )
}
