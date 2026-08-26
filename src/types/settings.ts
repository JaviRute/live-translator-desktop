export type LanguageId = 'es' | 'en' | 'fr' | 'de' | 'it'

export type LanguageOption = {
  id: LanguageId
  label: string
  speechCode: string
}

export type DisplayMode =
  | 'transcription-and-translation'
  | 'transcription-only'
  | 'translation-only'

export type ClearAfterMs = 5_000 | 10_000 | 20_000 | 30_000 | 60_000 | null

export const languages: LanguageOption[] = [
  { id: 'es', label: 'Spanish', speechCode: 'es-ES' },
  { id: 'en', label: 'English', speechCode: 'en-US' },
  { id: 'fr', label: 'French', speechCode: 'fr-FR' },
  { id: 'de', label: 'German', speechCode: 'de-DE' },
  { id: 'it', label: 'Italian', speechCode: 'it-IT' },
]

export const getLanguage = (id: LanguageId) =>
  languages.find((language) => language.id === id) ?? languages[0]

export const getAlternativeTarget = (inputLanguage: LanguageId): LanguageId =>
  inputLanguage === 'en' ? 'es' : 'en'
