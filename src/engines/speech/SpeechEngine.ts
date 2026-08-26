export type SpeechUpdate = {
  finalText: string
  interimText: string
}

export type SpeechError = 'not-allowed' | 'unavailable' | 'recognition-error'

export type SpeechEngineCallbacks = {
  onUpdate: (update: SpeechUpdate) => void
  onError: (error: SpeechError) => void
}

export interface SpeechEngine {
  isSupported(): boolean
  start(callbacks: SpeechEngineCallbacks): void
  stop(): void
}
