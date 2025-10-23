import { useEffect, useState } from 'react'
import { load as loadStore } from '@tauri-apps/plugin-store'

const setVar = (k: string, v: string) => document.documentElement.style.setProperty(k, v)

export const useTheme = () => {
  const [fontSize, setFontSize] = useState('16px')
  const [accent, setAccent] = useState('#4cc2ff')

  useEffect(() => {
    (async () => {
      const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
      const fs = (await store.get<string>('theme:fontSize')) || '16px'
      const ac = (await store.get<string>('theme:accent')) || '#4cc2ff'
      setFontSize(fs)
      setAccent(ac)
      setVar('--ui-font-size', fs)
      setVar('--ui-accent', ac)
    })()
  }, [])

  const apply = async () => {
    const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
    await store.set('theme:fontSize', fontSize)
    await store.set('theme:accent', accent)
    setVar('--ui-font-size', fontSize)
    setVar('--ui-accent', accent)
  }

  return { fontSize, setFontSize, accent, setAccent, apply }
}
