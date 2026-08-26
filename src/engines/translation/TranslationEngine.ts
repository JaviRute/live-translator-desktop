export type TranslationOptions = {
  sourceLanguage: string
  targetLanguage: string
}

export interface TranslationEngine {
  isSupported(): boolean
  initialize(options: TranslationOptions): Promise<boolean>
  translate(text: string): Promise<string>
  dispose(): void
}
