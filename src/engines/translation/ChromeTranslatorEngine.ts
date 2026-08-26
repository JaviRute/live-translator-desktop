import type { TranslationEngine } from './TranslationEngine'

export class ChromeTranslatorEngine implements TranslationEngine {
  private translator: TranslatorInstance | null = null

  isSupported() {
    return Boolean(window.Translator)
  }

  async initialize() {
    if (!window.Translator) return false
    const options = { sourceLanguage: 'es', targetLanguage: 'en' }
    const availability = await window.Translator.availability(options)
    if (availability === 'unavailable') return false
    this.translator = await window.Translator.create(options)
    return true
  }

  async translate(text: string) {
    if (!this.translator) throw new Error('Translator is not initialized')
    return this.translator.translate(text)
  }

  dispose() {
    this.translator?.destroy?.()
    this.translator = null
  }
}
