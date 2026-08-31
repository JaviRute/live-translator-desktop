import { colourThemes, type ColourTheme, type ColourThemeId } from '../../data/colourThemes'
import type {
  AppSettings,
  ClearAfterMs,
  DisplayMode,
  FontFamily,
  LanguageId,
  TextAppearance,
} from '../../types/settings'
import { fontOptions, languages } from '../../types/settings'

type SettingsPanelProps = {
  settings: AppSettings
  onInputLanguageChange: (language: LanguageId) => void
  onTargetLanguageChange: (language: LanguageId) => void
  onDisplayModeChange: (mode: DisplayMode) => void
  onSettingChange: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => void
  onAppearanceChange: (
    kind: 'transcription' | 'translation',
    change: Partial<TextAppearance>,
  ) => void
  onThemePreview: (theme: ColourThemeId | null) => void
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

function ThemeSwatch({
  theme,
  selected,
  onSelect,
  onPreview,
}: {
  theme: ColourTheme
  selected: boolean
  onSelect: () => void
  onPreview: (theme: ColourThemeId | null) => void
}) {
  return (
    <button
      className={`theme-swatch ${selected ? 'selected' : ''}`}
      type="button"
      style={{
        background: `linear-gradient(to right, transparent 50%, ${theme.background} 50%), linear-gradient(to bottom, ${theme.transcription} 50%, ${theme.translation} 50%)`,
      }}
      aria-label={`${theme.label} colour theme`}
      aria-pressed={selected}
      title={theme.label}
      onMouseEnter={() => onPreview(theme.id)}
      onMouseLeave={() => onPreview(null)}
      onFocus={() => onPreview(theme.id)}
      onBlur={() => onPreview(null)}
      onClick={onSelect}
    >
      {selected && (
        <span className="theme-check" aria-hidden="true">
          &#10003;
        </span>
      )}
    </button>
  )
}

function AppearanceFields({
  label,
  value,
  onChange,
}: {
  label: string
  value: TextAppearance
  onChange: (change: Partial<TextAppearance>) => void
}) {
  return (
    <div className="appearance-fields">
      <label className="setting-field">
        <span>{label} font</span>
        <select
          value={value.font}
          onChange={(event) =>
            onChange({ font: event.target.value as FontFamily })
          }
        >
          {fontOptions.map((font) => (
            <option
              key={font}
              value={font}
              style={{ fontFamily: font }}
            >
              {font}
            </option>
          ))}
        </select>
      </label>

      <label className="setting-field">
        <span className="setting-label-row">
          <span>{label} font size</span>
          <output>{value.fontSize}px</output>
        </span>

        <input
          type="range"
          min="32"
          max="120"
          step="1"
          value={value.fontSize}
          onChange={(event) =>
            onChange({ fontSize: Number(event.target.value) })
          }
        />
      </label>
    </div>
  )
}

export function SettingsPanel({
  settings,
  onInputLanguageChange,
  onTargetLanguageChange,
  onDisplayModeChange,
  onSettingChange,
  onAppearanceChange,
  onThemePreview,
  onClose,
}: SettingsPanelProps) {
  const usesTranslation = settings.displayMode !== 'transcription-only'

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

        <button
          className="icon-button close-button"
          type="button"
          onClick={onClose}
          aria-label="Close settings"
        >
          &times;
        </button>
      </div>

      <section className="settings-section">
        <legend>Language</legend>

        <label className="setting-field">
          <span>Input language</span>
          <select
            value={settings.inputLanguage}
            onChange={(event) =>
              onInputLanguageChange(event.target.value as LanguageId)
            }
          >
            {languages.map((language) => (
              <option key={language.id} value={language.id}>
                {language.label}
              </option>
            ))}
          </select>
        </label>

        {usesTranslation && (
          <label className="setting-field">
            <span>Translation target language</span>
            <select
              value={settings.targetLanguage}
              onChange={(event) =>
                onTargetLanguageChange(event.target.value as LanguageId)
              }
            >
              {languages.map((language) => (
                <option
                  key={language.id}
                  value={language.id}
                  disabled={language.id === settings.inputLanguage}
                >
                  {language.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </section>

      <section className="settings-section">
        <legend>Display</legend>

        <label className="setting-field">
          <span>Display mode</span>
          <select
            value={settings.displayMode}
            onChange={(event) =>
              onDisplayModeChange(event.target.value as DisplayMode)
            }
          >
            <option value="transcription-and-translation">
              Transcription + translation
            </option>
            <option value="transcription-only">Transcription only</option>
            <option value="translation-only">Translation only</option>
          </select>
        </label>

        <label className="setting-field">
          <span>Clear text after</span>
          <select
            value={
              settings.clearAfterMs === null
                ? 'never'
                : String(settings.clearAfterMs)
            }
            onChange={(event) =>
              onSettingChange(
                'clearAfterMs',
                event.target.value === 'never'
                  ? null
                  : (Number(event.target.value) as ClearAfterMs),
              )
            }
          >
            {clearOptions.map((option) => (
              <option
                key={option.value ?? 'never'}
                value={option.value ?? 'never'}
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={settings.hideOffensiveLanguage}
            onChange={(event) =>
              onSettingChange(
                'hideOffensiveLanguage',
                event.target.checked,
              )
            }
          />
          <span>Hide offensive language</span>
        </label>
      </section>

      <section className="settings-section">
        <legend>Colour theme</legend>

        <div className="setting-field theme-field">
          <div
            className="theme-swatches"
            role="group"
            aria-label="Colour theme"
          >
            {colourThemes.map((theme) => (
              <ThemeSwatch
                key={theme.id}
                theme={theme}
                selected={settings.colourTheme === theme.id}
                onSelect={() => {
                  onSettingChange('colourTheme', theme.id)
                  onThemePreview(null)
                }}
                onPreview={onThemePreview}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="settings-section">
        <legend>Font</legend>

        <AppearanceFields
          label="Transcription"
          value={settings.transcription}
          onChange={(change) =>
            onAppearanceChange('transcription', change)
          }
        />

        <AppearanceFields
          label="Translation"
          value={settings.translation}
          onChange={(change) =>
            onAppearanceChange('translation', change)
          }
        />
      </section>
    </aside>
  )
}