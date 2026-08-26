export interface TranslationEngine {
  isSupported(): boolean
  initialize(): Promise<boolean>
  translate(text: string): Promise<string>
  dispose(): void
}
