import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { load as loadStore } from '@tauri-apps/plugin-store'

export type Page = 'dashboard' | 'library' | 'disk' | 'cheats' | 'settings'

export type NavContextValue = {
  page: Page
  setPage: (p: Page) => void
}

const Ctx = createContext<NavContextValue | null>(null)

export const useNav = (): NavContextValue => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('NavContext not available')
  return ctx
}

export const NavProvider = ({ children }: { children: ReactNode }) => {
  const [page, setPageState] = useState<Page>('dashboard')

  useEffect(() => {
    (async () => {
      try {
        const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
        const saved = await store.get<Page>('nav:page')
        if (saved) setPageState(saved)
      } catch {}
    })()
  }, [])

  const setPage = async (p: Page) => {
    setPageState(p)
    try {
      const store = await loadStore('settings.json', { autoSave: true, defaults: {} })
      await store.set('nav:page', p)
    } catch {}
  }

  return <Ctx.Provider value={{ page, setPage }}>{children}</Ctx.Provider>
}
