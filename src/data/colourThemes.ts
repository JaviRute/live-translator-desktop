export const colourThemes = [
  { id: 'dark', label: 'Dark', background: '#000000', transcription: '#F5F5F5', translation: '#67D5F5' },
  { id: 'light', label: 'Light', background: '#F7F7F7', transcription: '#111111', translation: '#00769B' },
  { id: 'navy', label: 'Navy', background: '#102A43', transcription: '#FFFFFF', translation: '#7FDBFF' },
  { id: 'soft-blue', label: 'Soft Blue', background: '#DCEEFF', transcription: '#102A43', translation: '#8A3FFC' },
  { id: 'deep-blue', label: 'Deep Blue', background: '#071E3D', transcription: '#FFFFFF', translation: '#FFD166' },
  { id: 'slate', label: 'Slate', background: '#263238', transcription: '#FFFFFF', translation: '#80CBC4' },
  { id: 'warm-cream', label: 'Warm Cream', background: '#FFF4D6', transcription: '#202020', translation: '#8B3A3A' },
  { id: 'deep-purple', label: 'Deep Purple', background: '#211A2E', transcription: '#FFFFFF', translation: '#70D6FF' },
] as const

export type ColourTheme = (typeof colourThemes)[number]
export type ColourThemeId = ColourTheme['id']

export const getColourTheme = (id: ColourThemeId): ColourTheme =>
  colourThemes.find((theme) => theme.id === id) ?? colourThemes[0]

export const isColourThemeId = (value: unknown): value is ColourThemeId =>
  colourThemes.some((theme) => theme.id === value)
