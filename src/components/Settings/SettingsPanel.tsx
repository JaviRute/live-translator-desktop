import type {
  ClearAfterMs,
  DisplayMode,
  LanguageId,
} from '../../types/settings'
import { languages } from '../../types/settings'

type SettingsPanelProps = {
  inputLanguage: LanguageId
  targetLanguage: LanguageId
  displayMode: DisplayMode
  clearAfterMs: ClearAfterMs
  onInputLanguageChange: (language: LanguageId) => void
  onTargetLanguageChange: (language: LanguageId) => void
  onDisplayModeChange: (mode: DisplayMode) => void
  onClearAfterChange: (duration: ClearAfterMs) => void
  onClose: () => void
}

const clearOptions: Array<{ value: ClearAfterMs; label: string }> = [
  { value: 5_000, label: '5 seconds' },
  { value: 10_000, label: '10 seconds' },
  { value: 20_000, label: '20 seconds' },
  { value: 30_000, label: '30 seconds' },
  { value: 60_000, label: '1 minute' },
  { value: null, label: 'Never' },
]

export function SettingsPanel({
  inputLanguage,
  targetLanguage,
  displayMode,
  clearAfterMs,
  onInputLanguageChange,
  onTargetLanguageChange,
  onDisplayModeChange,
  onClearAfterChange,
  onClose,
}: SettingsPanelProps) {
  const usesTranslation = displayMode !== 'transcription-only'

  return (
    <aside
      className="settings-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="settings-header">
        <h2 id="settings-title">Settings</h2>
        <button className="icon-button close-button" type="button" onClick={onClose} aria-label="Close settings">
          &times;
        </button>
      </div>

      <label className="setting-field">
        <span>Input language</span>
        <select
          value={inputLanguage}
          onChange={(event) => onInputLanguageChange(event.target.value as LanguageId)}
        >
          {languages.map((language) => (
            <option key={language.id} value={language.id}>{language.label}</option>
          ))}
        </select>
      </label>

      <label className="setting-field">
        <span>Display mode</span>
        <select
          value={displayMode}
          onChange={(event) => onDisplayModeChange(event.target.value as DisplayMode)}
        >
          <option value="transcription-and-translation">Transcription + translation</option>
          <option value="transcription-only">Transcription only</option>
          <option value="translation-only">Translation only</option>
        </select>
      </label>

      {usesTranslation && (
        <label className="setting-field">
          <span>Translation target language</span>
          <select
            value={targetLanguage}
            onChange={(event) => onTargetLanguageChange(event.target.value as LanguageId)}
          >
            {languages.map((language) => (
              <option
                key={language.id}
                value={language.id}
                disabled={language.id === inputLanguage}
              >
                {language.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="setting-field">
        <span>Clear text after:</span>
        <select
          value={clearAfterMs === null ? 'never' : String(clearAfterMs)}
          onChange={(event) => {
            const value = event.target.value
            onClearAfterChange(value === 'never' ? null : Number(value) as ClearAfterMs)
          }}
        >
          {clearOptions.map((option) => (
            <option key={option.value ?? 'never'} value={option.value ?? 'never'}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </aside>
  )
}
