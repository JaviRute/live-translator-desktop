import type {
  TranslationEngine,
  TranslationOptions,
} from './TranslationEngine'

export class ChromeTranslatorEngine implements TranslationEngine {
  private translator: TranslatorInstance | null = null
  private initialization: Promise<boolean> | null = null
  private languagePair = ''
  private generation = 0

  isSupported() {
    return Boolean(window.Translator)
  }

  initialize(options: TranslationOptions) {
    const languagePair = this.getLanguagePair(options)

    if (this.translator && this.languagePair === languagePair) {
      return Promise.resolve(true)
    }

    if (this.initialization && this.languagePair === languagePair) {
      return this.initialization
    }

    this.dispose()
    this.languagePair = languagePair
    const generation = ++this.generation
    const initialization = this.createTranslator(options, generation)
    this.initialization = initialization

    const clearInitialization = () => {
      if (this.initialization === initialization) this.initialization = null
    }
    initialization.then(clearInitialization, clearInitialization)

    return initialization
  }

  async translate(text: string) {
    if (!this.translator) throw new Error('Translator is not initialized')
    return this.translator.translate(text)
  }

  dispose() {
    this.generation += 1
    this.translator?.destroy?.()
    this.translator = null
    this.initialization = null
    this.languagePair = ''
  }

  private async createTranslator(options: TranslationOptions, generation: number) {
    if (!window.Translator) return false

    const availability = await window.Translator.availability(options)
    if (availability === 'unavailable') return false

    const translator = await window.Translator.create(options)
    if (generation !== this.generation) {
      translator.destroy?.()
      return false
    }

    this.translator = translator
    return true
  }

  private getLanguagePair(options: TranslationOptions) {
    return `${options.sourceLanguage}:${options.targetLanguage}`
  }
}
