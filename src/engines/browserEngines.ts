import { WebSpeechEngine } from './speech/WebSpeechEngine'
import { ChromeTranslatorEngine } from './translation/ChromeTranslatorEngine'

export const speechEngine = new WebSpeechEngine()
export const translationEngine = new ChromeTranslatorEngine()
