interface SpeechRecognitionAlternative {
  transcript: string
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean
  readonly length: number
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionResultList {
  readonly length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition
}

interface TranslatorInstance {
  translate(text: string): Promise<string>
  destroy?: () => void
}

interface TranslatorFactory {
  availability(options: { sourceLanguage: string; targetLanguage: string }): Promise<string>
  create(options: { sourceLanguage: string; targetLanguage: string }): Promise<TranslatorInstance>
}

interface Window {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
  Translator?: TranslatorFactory
}
