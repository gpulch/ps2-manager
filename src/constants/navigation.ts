import type { Page } from '../contexts/NavContext'

export type NavigationTab = {
  key: Page
  label: string
}

export const NAVIGATION_TABS: ReadonlyArray<NavigationTab> = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'library', label: 'Library' },
  { key: 'disk', label: 'Disk' },
  { key: 'cheats', label: 'Cheats' },
  { key: 'settings', label: 'Settings' },
] as const
