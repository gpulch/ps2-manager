import { useEffect, useState } from 'react'
import { applyThemeVariables, DEFAULT_THEME } from '../utils/theme'
import { getStoredValue, setStoredValue } from '../utils/storage'

export const useTheme = () => {
  const [fontSize, setFontSize] = useState(DEFAULT_THEME.fontSize)
  const [accent, setAccent] = useState(DEFAULT_THEME.accent)

  useEffect(() => {
    const loadTheme = async (): Promise<void> => {
      const [savedFontSize, savedAccent] = await Promise.all([
        getStoredValue<string>('theme:fontSize'),
        getStoredValue<string>('theme:accent'),
      ])

      const fontSize = savedFontSize || DEFAULT_THEME.fontSize
      const accent = savedAccent || DEFAULT_THEME.accent
      
      setFontSize(fontSize)
      setAccent(accent)
      applyThemeVariables({ fontSize, accent })
    }
    
    loadTheme()
  }, [])

  const apply = async (): Promise<void> => {
    const theme = { fontSize, accent }
    await Promise.all([
      setStoredValue('theme:fontSize', fontSize),
      setStoredValue('theme:accent', accent),
    ])
    applyThemeVariables(theme)
  }

  return { fontSize, setFontSize, accent, setAccent, apply }
}
