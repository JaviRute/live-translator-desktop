import { describe, expect, it } from 'vitest'
import { getRecentLines, getSubtitleLayoutClass, getVisibleLineCount, wrapTextIntoLines } from './subtitleLayout'

describe('getSubtitleLayoutClass', () => {
  it('uses the split layout when both text zones are visible', () => {
    expect(getSubtitleLayoutClass(true, true)).toBe('subtitles subtitles-split')
  })

  it('uses the full layout when only one text zone is visible', () => {
    expect(getSubtitleLayoutClass(true, false)).toBe('subtitles subtitles-single')
    expect(getSubtitleLayoutClass(false, true)).toBe('subtitles subtitles-single')
  })

  it('fills each line with all the words that fit', () => {
    const fitsThreeWords = (line: string) => line.split(' ').length <= 3
    expect(wrapTextIntoLines('one two three four five six seven', fitsThreeWords)).toEqual([
      'one two three',
      'four five six',
      'seven',
    ])
  })

  it('limits visible lines without exceeding the available space', () => {
    expect(getVisibleLineCount(6, 1)).toBe(1)
    expect(getVisibleLineCount(6, 2)).toBe(2)
    expect(getVisibleLineCount(2, 3)).toBe(2)
    expect(getVisibleLineCount(6, null)).toBe(6)
  })

  it('keeps complete lines stable as new words arrive', () => {
    const text = 'one two three four five six seven eight nine ten eleven twelve'
    const fitsEightWords = (line: string) => line.split(' ').length <= 8
    expect(getRecentLines(wrapTextIntoLines(text, fitsEightWords), 2)).toEqual([
      'one two three four five six seven eight',
      'nine ten eleven twelve',
    ])
    expect(getRecentLines(wrapTextIntoLines(`${text} thirteen fourteen fifteen sixteen seventeen`, fitsEightWords), 2)).toEqual([
      'nine ten eleven twelve thirteen fourteen fifteen sixteen',
      'seventeen',
    ])
  })

  it('shows more recent lines when only one zone is visible', () => {
    const lines = ['line one', 'line two', 'line three', 'line four', 'line five']
    expect(getRecentLines(lines, 4)).toEqual(['line two', 'line three', 'line four', 'line five'])
  })
})
