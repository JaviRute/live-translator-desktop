export function getSubtitleLayoutClass(showTranscription: boolean, showTranslation: boolean): string {
  if (showTranscription && showTranslation) return 'subtitles subtitles-split'
  return 'subtitles subtitles-single'
}

export function wrapTextIntoLines(text: string, fitsLine: (line: string) => boolean): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const lines: string[] = []

  for (const word of words) {
    const currentLine = lines.at(-1)
    const candidate = currentLine ? `${currentLine} ${word}` : word

    if (!currentLine || fitsLine(candidate)) {
      if (currentLine) lines[lines.length - 1] = candidate
      else lines.push(candidate)
    } else {
      lines.push(word)
    }
  }

  return lines
}

export function getRecentLines(lines: string[], maxLines: number): string[] {
  return lines.slice(-maxLines)
}
