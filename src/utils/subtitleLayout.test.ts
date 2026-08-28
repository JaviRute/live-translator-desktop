import { describe, expect, it } from 'vitest'
import { getRecentLines, getSubtitleLayoutClass } from './subtitleLayout'

describe('getSubtitleLayoutClass', () => {
  it('uses the split layout when both text zones are visible', () => {
    expect(getSubtitleLayoutClass(true, true)).toBe('subtitles subtitles-split')
  })

  it('uses the full layout when only one text zone is visible', () => {
    expect(getSubtitleLayoutClass(true, false)).toBe('subtitles subtitles-single')
    expect(getSubtitleLayoutClass(false, true)).toBe('subtitles subtitles-single')
  })

  it('keeps complete recent lines stable as new words arrive', () => {
    const text = 'one two three four five six seven eight nine ten eleven twelve'
    expect(getRecentLines(text, 8, 2)).toEqual([
      'one two three four five six seven eight',
      'nine ten eleven twelve',
    ])
    expect(getRecentLines(`${text} thirteen fourteen fifteen sixteen seventeen`, 8, 2)).toEqual([
      'nine ten eleven twelve thirteen fourteen fifteen sixteen',
      'seventeen',
    ])
  })

  it('shows more recent lines when only one zone is visible', () => {
    const text = 'one two three four five six seven eight nine ten eleven twelve'
    expect(getRecentLines(text, 8, 4)).toEqual([
      'one two three four five six seven eight',
      'nine ten eleven twelve',
    ])
  })
})