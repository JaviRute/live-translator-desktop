export function getSubtitleLayoutClass(showTranscription: boolean, showTranslation: boolean): string {
  if (showTranscription && showTranslation) return 'subtitles subtitles-split'
  return 'subtitles subtitles-single'
}

export function getRecentLines(text: string, wordsPerLine: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const lines: string[] = []
  for (let index = 0; index < words.length; index += wordsPerLine) {
    lines.push(words.slice(index, index + wordsPerLine).join(' '))
  }
  return lines.slice(-maxLines)
}