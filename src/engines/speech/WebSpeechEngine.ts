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
  private restartTimer: number | undefined
  private shouldRestart = false
  private committedText = ''
  private restartBoundaryText = ''
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
    this.restartBoundaryText = ''
    this.sessionSegments.clear()
    this.lastResultCount = 0
    this.ignoreResultsBefore = 0
    this.shouldRestart = true

    const recognition = new Recognition()
    this.recognition = recognition
    recognition.lang = options.language
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onstart = () => {
      if (this.recognition === recognition) callbacks.onStart()
    }

    recognition.onresult = (event) => {
      if (this.recognition !== recognition) return

      this.lastResultCount = event.results.length
      for (const index of this.sessionSegments.keys()) {
        if (index >= event.results.length) this.sessionSegments.delete(index)
      }

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
      if (this.recognition !== recognition) return

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        this.shouldRestart = false
        callbacks.onError('not-allowed')
        return
      }

      if (event.error === 'audio-capture') {
        this.shouldRestart = false
        callbacks.onError('microphone-unavailable')
        return
      }

      if (event.error === 'network') {
        this.shouldRestart = false
        callbacks.onError('recognition-error')
        return
      }

      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        this.shouldRestart = false
        callbacks.onError('recognition-error')
      }
    }

    recognition.onend = () => {
      if (this.recognition !== recognition || !this.shouldRestart) return

      this.commitFinishedSession()
      this.ignoreResultsBefore = 0
      this.lastResultCount = 0

      this.restartTimer = window.setTimeout(() => {
        if (this.recognition !== recognition || !this.shouldRestart) return
        try {
          recognition.start()
        } catch {
          this.shouldRestart = false
          callbacks.onError('recognition-error')
        }
      }, 100)
    }

    try {
      recognition.start()
    } catch {
      this.shouldRestart = false
      this.recognition = null
      callbacks.onError('recognition-error')
    }
  }

  stop() {
    this.shouldRestart = false
    window.clearTimeout(this.restartTimer)
    this.restartTimer = undefined

    const recognition = this.recognition
    this.recognition = null
    this.callbacks = null

    if (recognition) {
      recognition.onstart = null
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      try {
        recognition.abort()
      } catch {
        // The browser may already have ended the session.
      }
    }
  }

  clearTranscript() {
    const activeInterimIndex = [...this.sessionSegments.entries()]
      .find(([, segment]) => !segment.isFinal)?.[0]

    this.committedText = ''
    this.restartBoundaryText = ''
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

    const finalWords = this.toWords(orderedSegments
      .filter((segment) => segment.isFinal)
      .map((segment) => segment.text)
      .filter(Boolean)
      .join(' '))
    const interimWords = this.toWords(orderedSegments
      .filter((segment) => !segment.isFinal)
      .map((segment) => segment.text)
      .filter(Boolean)
      .join(' '))

    const overlap = this.getRestartOverlap([...finalWords, ...interimWords])
    const finalWordsToRemove = Math.min(overlap, finalWords.length)
    const interimWordsToRemove = overlap - finalWordsToRemove
    const sessionFinalText = finalWords.slice(finalWordsToRemove).join(' ')
    const interimText = interimWords.slice(interimWordsToRemove).join(' ')

    return {
      finalText: this.joinText(this.committedText, sessionFinalText),
      interimText,
    }
  }

  private commitFinishedSession() {
    const update = this.createUpdate()
    this.committedText = this.joinText(update.finalText, update.interimText)
    this.restartBoundaryText = this.committedText
    this.sessionSegments.clear()
    this.callbacks?.onUpdate({
      finalText: this.committedText,
      interimText: '',
      hasSpeechActivity: false,
    })
  }

  private getRestartOverlap(sessionWords: string[]) {
    if (!this.restartBoundaryText || sessionWords.length === 0) return 0

    const committedWords = this.toWords(this.restartBoundaryText)
    const maximum = Math.min(committedWords.length, sessionWords.length, 30)

    for (let length = maximum; length > 0; length -= 1) {
      const committedSuffix = committedWords.slice(-length).map(this.normalizeWord)
      const sessionPrefix = sessionWords.slice(0, length).map(this.normalizeWord)
      if (committedSuffix.every((word, index) => word === sessionPrefix[index])) {
        return length
      }
    }

    return 0
  }

  private normalizeWord(word: string) {
    return word.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
  }

  private toWords(text: string) {
    return text.trim() ? text.trim().split(/\s+/) : []
  }

  private joinText(...parts: string[]) {
    return parts.filter(Boolean).join(' ').trim()
  }
}
