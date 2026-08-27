export type SpeechUpdate = {
  finalText: string
  interimText: string
  hasSpeechActivity: boolean
}

export type SpeechError =
  | 'not-allowed'
  | 'microphone-unavailable'
  | 'unavailable'
  | 'recognition-error'

export type SpeechEngineOptions = {
  language: string
}

export type SpeechEngineCallbacks = {
  onStart: () => void
  onUpdate: (update: SpeechUpdate) => void
  onError: (error: SpeechError) => void
}

export interface SpeechEngine {
  isSupported(): boolean
  start(options: SpeechEngineOptions, callbacks: SpeechEngineCallbacks): void
  stop(): void
  clearTranscript(): void
}
