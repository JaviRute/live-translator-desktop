import type {
  SpeechEngine,
  SpeechEngineCallbacks,
  SpeechEngineOptions,
  SpeechUpdate,
} from './SpeechEngine'

type RecognitionSegment = {
  text: string
  isFinal: boolean
}

export class WebSpeechEngine implements SpeechEngine {
  private recognition: SpeechRecognition | null = null
  private shouldRestart = false
  private committedText = ''
  private sessionSegments = new Map<number, RecognitionSegment>()
  private callbacks: SpeechEngineCallbacks | null = null
  private lastResultCount = 0
  private ignoreResultsBefore = 0

  isSupported() {
    return Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition)
  }

  start(options: SpeechEngineOptions, callbacks: SpeechEngineCallbacks) {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!Recognition) {
      callbacks.onError('unavailable')
      return
    }

    this.stop()
    this.callbacks = callbacks
    this.committedText = ''
    this.sessionSegments.clear()
    this.lastResultCount = 0
    this.ignoreResultsBefore = 0
    this.shouldRestart = true

    const recognition = new Recognition()
    this.recognition = recognition
    recognition.lang = options.language
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      this.lastResultCount = event.results.length
      const startIndex = Math.max(event.resultIndex, this.ignoreResultsBefore)

      for (let index = startIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        this.sessionSegments.set(index, {
          text: result[0]?.transcript.trim() ?? '',
          isFinal: result.isFinal,
        })
      }

      callbacks.onUpdate({ ...this.createUpdate(), hasSpeechActivity: true })
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        this.shouldRestart = false
        callbacks.onError('not-allowed')
        return
      }

      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        callbacks.onError('recognition-error')
      }
    }

    recognition.onend = () => {
      if (!this.shouldRestart) return

      this.commitFinishedSession()
      this.ignoreResultsBefore = 0
      this.lastResultCount = 0

      try {
        recognition.start()
      } catch {
        this.shouldRestart = false
        callbacks.onError('recognition-error')
      }
    }

    recognition.start()
  }

  stop() {
    this.shouldRestart = false
    const recognition = this.recognition
    this.recognition = null
    this.callbacks = null

    if (recognition) {
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      recognition.stop()
    }
  }

  clearTranscript() {
    const activeInterimIndex = [...this.sessionSegments.entries()]
      .find(([, segment]) => !segment.isFinal)?.[0]

    this.committedText = ''
    this.sessionSegments.clear()
    this.ignoreResultsBefore = activeInterimIndex ?? this.lastResultCount
    this.callbacks?.onUpdate({
      finalText: '',
      interimText: '',
      hasSpeechActivity: false,
    })
  }

  private createUpdate(): Omit<SpeechUpdate, 'hasSpeechActivity'> {
    const orderedSegments = [...this.sessionSegments.entries()]
      .sort(([left], [right]) => left - right)
      .map(([, segment]) => segment)

    const sessionFinalText = orderedSegments
      .filter((segment) => segment.isFinal)
      .map((segment) => segment.text)
      .filter(Boolean)
      .join(' ')

    const interimText = orderedSegments
      .filter((segment) => !segment.isFinal)
      .map((segment) => segment.text)
      .filter(Boolean)
      .join(' ')

    return {
      finalText: this.joinText(this.committedText, sessionFinalText),
      interimText,
    }
  }

  private commitFinishedSession() {
    const update = this.createUpdate()
    this.committedText = update.finalText
    this.sessionSegments.clear()
    this.callbacks?.onUpdate({
      finalText: this.committedText,
      interimText: '',
      hasSpeechActivity: false,
    })
  }

  private joinText(...parts: string[]) {
    return parts.filter(Boolean).join(' ').trim()
  }
}
