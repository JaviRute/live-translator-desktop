import { useEffect, useState } from 'react'
import { defaultSettings, fontOptions, languages, type AppSettings, type ClearAfterMs, type DisplayMode, type FontFamily, type LanguageId, type TextAppearance } from '../types/settings'

const storageKey = 'live-translator-settings'
const displayModes: DisplayMode[] = ['transcription-and-translation', 'transcription-only', 'translation-only']
const clearDurations: ClearAfterMs[] = [5_000, 10_000, 20_000, 30_000, 60_000, null]
const colorPattern = /^#[0-9a-f]{6}$/i
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
const validLanguage = (value: unknown, fallback: LanguageId): LanguageId =>
  languages.some(({ id }) => id === value) ? value as LanguageId : fallback
const validAppearance = (value: unknown, fallback: TextAppearance): TextAppearance => {
  if (!isRecord(value)) return fallback
  return {
    color: typeof value.color === 'string' && colorPattern.test(value.color) ? value.color : fallback.color,
    font: fontOptions.includes(value.font as FontFamily) ? value.font as FontFamily : fallback.font,
    fontSize: typeof value.fontSize === 'number' && Number.isFinite(value.fontSize)
      ? Math.round(Math.min(120, Math.max(32, value.fontSize))) : fallback.fontSize,
  }
}
function loadSettings(): AppSettings {
  try {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return defaultSettings
    const value: unknown = JSON.parse(saved)
    if (!isRecord(value)) return defaultSettings
    const inputLanguage = validLanguage(value.inputLanguage, defaultSettings.inputLanguage)
    let targetLanguage = validLanguage(value.targetLanguage, defaultSettings.targetLanguage)
    if (targetLanguage === inputLanguage) targetLanguage = inputLanguage === 'en' ? 'es' : 'en'
    return {
      inputLanguage,
      targetLanguage,
      displayMode: displayModes.includes(value.displayMode as DisplayMode) ? value.displayMode as DisplayMode : defaultSettings.displayMode,
      clearAfterMs: clearDurations.includes(value.clearAfterMs as ClearAfterMs) ? value.clearAfterMs as ClearAfterMs : defaultSettings.clearAfterMs,
      hideOffensiveLanguage: typeof value.hideOffensiveLanguage === 'boolean'
        ? value.hideOffensiveLanguage
        : defaultSettings.hideOffensiveLanguage,
      backgroundColor: typeof value.backgroundColor === 'string' && colorPattern.test(value.backgroundColor) ? value.backgroundColor : defaultSettings.backgroundColor,
      transcription: validAppearance(value.transcription, defaultSettings.transcription),
      translation: validAppearance(value.translation, defaultSettings.translation),
    }
  } catch {
    return defaultSettings
  }
}
export function usePersistentSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings)
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(settings))
    } catch {
      // Storage may be unavailable or full; settings still work for this session.
    }
  }, [settings])
  return [settings, setSettings] as const
}
