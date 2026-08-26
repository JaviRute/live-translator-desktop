export type SpeechUpdate = {
  finalText: string
  interimText: string
}

export type SpeechError = 'not-allowed' | 'unavailable' | 'recognition-error'

export interface SpeechEngine {
  isSupported(): boolean
  start(onUpdate: (update: SpeechUpdate) => void, onError: (error: SpeechError) => void): void
  stop(): void
}
