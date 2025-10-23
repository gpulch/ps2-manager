import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { load as loadStore } from '@tauri-apps/plugin-store'
import { open } from '@tauri-apps/plugin-dialog'

export type SourceMode = 'disk' | 'library'

export type SourceContextValue = {
  activeSource: SourceMode
  selectedRoot: string | null
  libraryRoot: string | null
  cheatsRoot: string | null
  setSource: (m: SourceMode) => Promise<void>
  setSelectedRoot: (r: string | null) => void
  chooseLibraryRoot: () => Promise<void>
  chooseCheatsRoot: () => Promise<void>
  useLibraryForCheats: () => Promise<void>
  currentRoot: () => string | null
  currentCheatRoot: () => string | null
  storeReady: boolean
}

const Ctx = createContext<SourceContextValue | null>(null)

export const useSourceContext = (): SourceContextValue => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('SourceContext not available')
  return ctx
}

export const SourceProvider = ({ children }: { children: ReactNode }) => {
  const [activeSource, setActiveSource] = useState<SourceMode>('disk')
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null)
  const [libraryRoot, setLibraryRoot] = useState<string | null>(null)
  const [cheatsRoot, setCheatsRoot] = useState<string | null>(null)
  const [storeReady, setStoreReady] = useState(false)

  const currentRoot = (): string | null => (activeSource === 'disk' ? selectedRoot : libraryRoot)
  const currentCheatRoot = (): string | null => (cheatsRoot ?? currentRoot())

  const setSource = async (mode: SourceMode): Promise<void> => {
    setActiveSource(mode)
    const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
    await store.set('activeSource', mode)
  }

  const chooseLibraryRoot = async (): Promise<void> => {
    const folder = await open({ directory: true, multiple: false })
    if (!folder || Array.isArray(folder)) return
    setLibraryRoot(folder)
    const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
    await store.set('libraryRoot', folder)
  }

  const chooseCheatsRoot = async (): Promise<void> => {
    const folder = await open({ directory: true, multiple: false })
    if (!folder || Array.isArray(folder)) return
    setCheatsRoot(folder)
    const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
    await store.set('cheatsRoot', folder)
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
        const last = await store.get<string>('lastRoot')
        const lib = await store.get<string>('libraryRoot')
        const cht = await store.get<string>('cheatsRoot')
        if (src === 'library') setActiveSource('library')
        if (last) setSelectedRoot(last)
        if (lib) setLibraryRoot(lib)
        if (cht) setCheatsRoot(cht)
      } finally {
        setStoreReady(true)
      }
    })()
  }, [])

  return (
    <Ctx.Provider value={{
      activeSource,
      selectedRoot,
      libraryRoot,
      cheatsRoot,
      setSource,
      setSelectedRoot,
      chooseLibraryRoot,
      chooseCheatsRoot,
      useLibraryForCheats,
      currentRoot,
      currentCheatRoot,
      storeReady,
    }}>
      {children}
    </Ctx.Provider>
  )
}
