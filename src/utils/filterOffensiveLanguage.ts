import { profanityByLanguage } from '../data/profanity'
import { profanityConcepts } from '../data/profanity/concepts'
import type { LanguageId } from '../types/settings'

const replacement = '---'
const languagePatterns = new Map<LanguageId, RegExp>()
const termPatterns = new Map<string, RegExp>()

const escapePattern = (value: string) =>
  value.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')

const createPattern = (terms: readonly string[]) => {
  const alternatives = [...terms]
    .sort((left, right) => right.length - left.length)
    .map(escapePattern)
    .join('|')
  return new RegExp(
    `(?<![\\p{L}\\p{N}])(?:${alternatives})(?![\\p{L}\\p{N}])`,
    'giu',
  )
}

const getLanguagePattern = (language: LanguageId) => {
  const cached = languagePatterns.get(language)
  if (cached) return cached
  const pattern = createPattern(profanityByLanguage[language])
  languagePatterns.set(language, pattern)
  return pattern
}

const getTermPattern = (terms: readonly string[]) => {
  const key = terms.join('\u0000')
  const cached = termPatterns.get(key)
  if (cached) return cached
  const pattern = createPattern(terms)
  termPatterns.set(key, pattern)
  return pattern
}

const containsTerms = (text: string, terms: readonly string[]) => {
  const pattern = getTermPattern(terms)
  pattern.lastIndex = 0
  const matches = pattern.test(text)
  pattern.lastIndex = 0
  return matches
}

const replaceTerms = (text: string, terms: readonly string[]) => {
  const pattern = getTermPattern(terms)
  pattern.lastIndex = 0
  return text.replace(pattern, replacement)
}

export function filterOffensiveLanguage(text: string, language: LanguageId) {
  if (!text) return text
  const pattern = getLanguagePattern(language)
  pattern.lastIndex = 0
  return text.replace(pattern, replacement)
}

export function filterTranslatedOffensiveLanguage(
  translation: string,
  targetLanguage: LanguageId,
  sourceText: string,
  sourceLanguage: LanguageId,
) {
  let filtered = filterOffensiveLanguage(translation, targetLanguage)
  if (!sourceText || !translation) return filtered
  const sourceContainsOffensiveLanguage =
    filterOffensiveLanguage(sourceText, sourceLanguage) !== sourceText

  for (const concept of profanityConcepts) {
    if (containsTerms(sourceText, concept[sourceLanguage])) {
      filtered = replaceTerms(filtered, concept[targetLanguage])
    }
  }

  if (sourceContainsOffensiveLanguage && filtered === translation) return replacement
  return filtered
}
