/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react'
import { getStoredValue, setStoredValue } from '../utils/storage'

export type Page = 'dashboard' | 'library' | 'disk' | 'cheats' | 'settings'

export type NavContextValue = {
  page: Page
  setPage: (page: Page) => Promise<void>
}

const NAV_PAGE_KEY = 'nav:page'
const DEFAULT_PAGE: Page = 'dashboard'

const Ctx = createContext<NavContextValue | null>(null)

export const useNav = (): NavContextValue => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('NavContext not available')
  return ctx
}

const loadSavedPage = async (): Promise<Page> => {
  try {
    const saved = await getStoredValue<Page>(NAV_PAGE_KEY)
    return saved ?? DEFAULT_PAGE
  } catch {
    return DEFAULT_PAGE
  }
}

const savePage = async (page: Page): Promise<void> => {
  try {
    await setStoredValue(NAV_PAGE_KEY, page)
  } catch (error) {
    console.warn('Failed to save page:', error)
  }
}

export const NavProvider = ({ children }: { children: ReactNode }) => {
  const [page, setPageState] = useState<Page>(DEFAULT_PAGE)

  useEffect(() => {
    const initPage = async (): Promise<void> => {
      const savedPage = await loadSavedPage()
      setPageState(savedPage)
    }
    initPage()
  }, [])

  const setPage = async (newPage: Page): Promise<void> => {
    setPageState(newPage)
    await savePage(newPage)
  }

  const value = useMemo(() => ({ page, setPage }), [page])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
