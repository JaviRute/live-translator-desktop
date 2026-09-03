import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { TextAppearance } from '../types/settings'
import { getRecentLines, wrapTextIntoLines } from '../utils/subtitleLayout'

const getLineHeight = (element: HTMLElement, fontSize: number): number => {
  const computedLineHeight = Number.parseFloat(getComputedStyle(element).lineHeight)
  return Number.isFinite(computedLineHeight) ? computedLineHeight : fontSize * 1.14
}

export function useSubtitleLayout(text: string, appearance: TextAppearance, enabled: boolean) {
  const { font, fontSize } = appearance
  const paneRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const [visibleLines, setVisibleLines] = useState<string[]>(() => text ? [text] : [])

  const measure = useCallback(() => {
    const pane = paneRef.current
    const textElement = textRef.current
    if (!pane || !textElement || !text.trim()) {
      setVisibleLines([])
      return
    }

    const measurer = document.createElement('span')
    measurer.className = 'subtitle-line-measurer'
    measurer.setAttribute('aria-hidden', 'true')
    textElement.appendChild(measurer)

    const availableWidth = textElement.clientWidth
    const lines = wrapTextIntoLines(text, (line) => {
      measurer.textContent = line
      return measurer.getBoundingClientRect().width <= availableWidth
    })
    const lineHeight = getLineHeight(textElement, fontSize)
    const maxLines = Math.max(1, Math.floor((pane.clientHeight + 0.5) / lineHeight))

    measurer.remove()
    setVisibleLines(getRecentLines(lines, maxLines))
  }, [enabled, font, fontSize, text])

  useLayoutEffect(() => {
    measure()

    const pane = paneRef.current
    if (!pane) return

    const observer = new ResizeObserver(measure)
    observer.observe(pane)

    const fonts = document.fonts
    void fonts?.ready.then(measure)
    fonts?.addEventListener('loadingdone', measure)

    return () => {
      observer.disconnect()
      fonts?.removeEventListener('loadingdone', measure)
    }
  }, [measure])

  return { paneRef, textRef, visibleLines }
}
