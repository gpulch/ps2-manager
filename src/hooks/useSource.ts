import { useEffect, useState } from 'react'
import { load as loadStore } from '@tauri-apps/plugin-store'
import { open } from '@tauri-apps/plugin-dialog'

export type SourceMode = 'disk' | 'library'

export const useSource = () => {
  const [activeSource, setActiveSource] = useState<SourceMode>('disk')
  const [libraryRoot, setLibraryRoot] = useState<string | null>(null)
  const [cheatsRoot, setCheatsRoot] = useState<string | null>(null)
  const [storeReady, setStoreReady] = useState(false)

  const currentRoot = (): string | null => (activeSource === 'disk' ? null : libraryRoot)
  const currentCheatRoot = (): string | null => (cheatsRoot ?? currentRoot())

  const initStore = async (): Promise<void> => {
    const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
    await store.set('lastOpened', new Date().toISOString())
    setStoreReady(true)
  }

  const setSource = async (mode: SourceMode): Promise<void> => {
    setActiveSource(mode)
    const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
    await store.set('activeSource', mode)
  }

  const chooseLibraryRoot = async (): Promise<string | null> => {
    const folder = await open({ directory: true, multiple: false })
    if (!folder || Array.isArray(folder)) return null
    setLibraryRoot(folder)
    const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
    await store.set('libraryRoot', folder)
    return folder
  }

  const chooseCheatsRoot = async (): Promise<string | null> => {
    const folder = await open({ directory: true, multiple: false })
    if (!folder || Array.isArray(folder)) return null
    setCheatsRoot(folder)
    const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
    await store.set('cheatsRoot', folder)
    return folder
  }

  const useLibraryForCheats = async (): Promise<void> => {
    if (!libraryRoot) return
    setCheatsRoot(libraryRoot)
    const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
    await store.set('cheatsRoot', libraryRoot)
  }

  useEffect(() => {
    (async () => {
      try {
        const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
        const src = await store.get<string>('activeSource')
        const lib = await store.get<string>('libraryRoot')
        const cht = await store.get<string>('cheatsRoot')
        if (src === 'library') setActiveSource('library')
        if (lib) setLibraryRoot(lib)
        if (cht) setCheatsRoot(cht)
        setStoreReady(true)
      } catch {
        setStoreReady(true)
      }
    })()
  }, [])

  return {
    activeSource,
    libraryRoot,
    cheatsRoot,
    setSource,
    chooseLibraryRoot,
    chooseCheatsRoot,
    useLibraryForCheats,
    currentRoot,
    currentCheatRoot,
    storeReady,
    initStore,
  }
}
