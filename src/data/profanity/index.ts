import type { LanguageId } from '../../types/settings'
import { deProfanity } from './de'
import { enProfanity } from './en'
import { esProfanity } from './es'
import { frProfanity } from './fr'
import { itProfanity } from './it'

export const profanityByLanguage: Record<LanguageId, readonly string[]> = {
  de: deProfanity,
  en: enProfanity,
  es: esProfanity,
  fr: frProfanity,
  it: itProfanity,
}
