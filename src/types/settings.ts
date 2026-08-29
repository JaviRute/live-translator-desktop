import type { ColourThemeId } from '../data/colourThemes'

export type LanguageId = 'es' | 'en' | 'fr' | 'de' | 'it'
export type LanguageOption = { id: LanguageId; label: string; speechCode: string }
export type DisplayMode = 'transcription-and-translation' | 'transcription-only' | 'translation-only'
export type ClearAfterMs = 5_000 | 10_000 | 20_000 | 30_000 | 60_000 | null

export const fontOptions = ['Atkinson Hyperlegible', 'Arial', 'Calibri', 'Open Sans', 'Roboto', 'Verdana'] as const
export type FontFamily = (typeof fontOptions)[number]
export type TextAppearance = { font: FontFamily; fontSize: number }
export type AppSettings = {
  inputLanguage: LanguageId
  targetLanguage: LanguageId
  displayMode: DisplayMode
  clearAfterMs: ClearAfterMs
  hideOffensiveLanguage: boolean
  colourTheme: ColourThemeId
  transcription: TextAppearance
  translation: TextAppearance
}
export const defaultSettings: AppSettings = {
  inputLanguage: 'es',
  targetLanguage: 'en',
  displayMode: 'transcription-and-translation',
  clearAfterMs: 5_000,
  hideOffensiveLanguage: true,
  colourTheme: 'dark',
  transcription: { font: 'Atkinson Hyperlegible', fontSize: 80 },
  translation: { font: 'Atkinson Hyperlegible', fontSize: 60 },
}
export const languages: LanguageOption[] = [
  { id: 'es', label: 'Spanish', speechCode: 'es-ES' },
  { id: 'en', label: 'English', speechCode: 'en-US' },
  { id: 'fr', label: 'French', speechCode: 'fr-FR' },
  { id: 'de', label: 'German', speechCode: 'de-DE' },
  { id: 'it', label: 'Italian', speechCode: 'it-IT' },
]
export const getLanguage = (id: LanguageId) => languages.find((language) => language.id === id) ?? languages[0]
export const getAlternativeTarget = (inputLanguage: LanguageId): LanguageId => inputLanguage === 'en' ? 'es' : 'en'
