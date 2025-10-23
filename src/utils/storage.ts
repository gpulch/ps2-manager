import { load as loadStore } from '@tauri-apps/plugin-store'

export type Store = Awaited<ReturnType<typeof loadStore>>

export const getStore = async (): Promise<Store> =>
  loadStore('settings.json', { autoSave: true, defaults: {} })

export const getStoredValue = async <T>(key: string, defaultValue?: T): Promise<T | undefined> => {
  const store = await getStore()
  const value = await store.get<T>(key)
  return value ?? defaultValue
}

export const setStoredValue = async <T>(key: string, value: T): Promise<void> => {
  const store = await getStore()
  await store.set(key, value)
}

export const removeStoredValue = async (key: string): Promise<void> => {
  const store = await getStore()
  await store.delete(key)
}
