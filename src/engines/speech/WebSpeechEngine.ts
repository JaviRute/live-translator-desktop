import type { SpeechEngine, SpeechError, SpeechUpdate } from './SpeechEngine'

export class WebSpeechEngine implements SpeechEngine {
  private recognition: SpeechRecognition | null = null
  private shouldRestart = false
  private finalText = ''

  isSupported() {
    return Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition)
  }

  start(onUpdate: (update: SpeechUpdate) => void, onError: (error: SpeechError) => void) {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!Recognition) {
      onError('unavailable')
      return
    }

    this.stop()
    this.finalText = ''
    this.shouldRestart = true
    const recognition = new Recognition()
    this.recognition = recognition
    recognition.lang = 'es-ES'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let interimText = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const text = event.results[index][0]?.transcript ?? ''
        if (event.results[index].isFinal) this.finalText += text
        else interimText += text
      }
      onUpdate({ finalText: this.finalText.trim(), interimText: interimText.trim() })
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        this.shouldRestart = false
        onError('not-allowed')
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        onError('recognition-error')
      }
    }

    recognition.onend = () => {
      if (this.shouldRestart) {
        try {
          recognition.start()
        } catch {
          onError('recognition-error')
        }
      }
    }

    recognition.start()
  }

  stop() {
    this.shouldRestart = false
    this.recognition?.stop()
    this.recognition = null
  }
}
