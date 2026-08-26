import type { TranslationEngine } from './TranslationEngine'

export class ChromeTranslatorEngine implements TranslationEngine {
  private translator: TranslatorInstance | null = null
  private initialization: Promise<boolean> | null = null

  isSupported() {
    return Boolean(window.Translator)
  }

  initialize() {
    if (this.translator) return Promise.resolve(true)
    if (this.initialization) return this.initialization

    this.initialization = this.createTranslator().finally(() => {
      this.initialization = null
    })

    return this.initialization
  }

  async translate(text: string) {
    if (!this.translator) throw new Error('Translator is not initialized')
    return this.translator.translate(text)
  }

  dispose() {
    this.translator?.destroy?.()
    this.translator = null
    this.initialization = null
  }

  private async createTranslator() {
    if (!window.Translator) return false

    const options = { sourceLanguage: 'es', targetLanguage: 'en' }
    const availability = await window.Translator.availability(options)
    if (availability === 'unavailable') return false

    this.translator = await window.Translator.create(options)
    return true
  }
}
